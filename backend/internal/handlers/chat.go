package handlers

import (
	"anikama-backend/internal/domain"
	"anikama-backend/pkg/db"
	"anikama-backend/pkg/gemini"
	"context"
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Chat handles AI chat requests with companions
func Chat(c *gin.Context) {
	userIdStr, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}
	userID := userIdStr.(string)

	var req domain.ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Get user tier
	var tier string
	tierQuery := `SELECT tier FROM profiles WHERE id = $1`
	err := db.DB.QueryRow(tierQuery, userID).Scan(&tier)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user tier"})
		return
	}

	// 2. Get companion's system prompt & name
	var systemPrompt, companionName string
	promptQuery := `SELECT system_prompt, name FROM companions WHERE id = $1`
	err = db.DB.QueryRow(promptQuery, req.CompanionID).Scan(&systemPrompt, &companionName)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Companion not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch companion"})
		return
	}

	// 3. Save User Message to DB
	_, err = db.DB.Exec(`
		INSERT INTO messages (user_id, companion_id, role, content) 
		VALUES ($1, $2, 'user', $3)
	`, userID, req.CompanionID, req.Message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save user message"})
		return
	}

	// 4. Retrieve Chat History (Last 10 messages)
	rows, err := db.DB.Query(`
		SELECT role, content FROM (
			SELECT role, content, created_at 
			FROM messages 
			WHERE user_id = $1 AND companion_id = $2
			ORDER BY created_at DESC 
			LIMIT 10
		) sub ORDER BY created_at ASC
	`, userID, req.CompanionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch chat history"})
		return
	}
	defer rows.Close()

	var historyContext string
	for rows.Next() {
		var role, content string
		if err := rows.Scan(&role, &content); err == nil {
			// Format: "User: hello" or "CharacterName: hi"
			speaker := "User"
			if role == "assistant" {
				speaker = companionName
			}
			historyContext += fmt.Sprintf("%s: %s\n", speaker, content)
		}
	}

	// 5. Initialize Gemini client
	ctx := context.Background()
	geminiClient, err := gemini.NewClient(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize AI client"})
		return
	}

	// 6. Generate Context-Aware Prompt
	// We prepend the history to the current message for the AI
	// Note: Ideally we'd use Gemini's chat history API, but for simplicity/statelessness
	// we'll append recent history to the prompt.
	fullPrompt := fmt.Sprintf("History:\n%s\nUser: %s\n", historyContext, req.Message)

	// 7. Generate response based on tier
	var response string
	var isLimited bool

	// Using the system prompt as the base instruction
	if tier == "premium" {
		response, err = geminiClient.GenerateResponsePremium(ctx, systemPrompt, fullPrompt)
		isLimited = false
	} else {
		// allow free chat for now as requested
		response, err = geminiClient.GenerateResponsePremium(ctx, systemPrompt, fullPrompt)
		isLimited = false
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate response"})
		return
	}

	// 8. Save Assistant Response to DB
	_, err = db.DB.Exec(`
		INSERT INTO messages (user_id, companion_id, role, content) 
		VALUES ($1, $2, 'assistant', $3)
	`, userID, req.CompanionID, response)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save assistant message"})
		return
	}

	// 9. Update Chats Table (Upsert)
	_, err = db.DB.Exec(`
		INSERT INTO chats (user_id, companion_id, last_message, last_message_at)
		VALUES ($1, $2, $3, NOW())
		ON CONFLICT (user_id, companion_id) 
		DO UPDATE SET last_message = EXCLUDED.last_message, last_message_at = NOW();
	`, userID, req.CompanionID, response)
	if err != nil {
		// Log error but don't fail the request as the message was sent
	}

	c.JSON(http.StatusOK, domain.ChatResponse{
		CompanionID: req.CompanionID,
		Message:     response,
		IsLimited:   isLimited,
	})
}

// GetChats returns the list of active chats for the user
func GetChats(c *gin.Context) {
	userIdStr, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}
	userID := userIdStr.(string)

	query := `
		SELECT 
			c.id, c.companion_id, c.last_message, c.last_message_at,
			co.name, co.avatar_url
		FROM chats c
		JOIN companions co ON c.companion_id = co.id
		WHERE c.user_id = $1
		ORDER BY c.last_message_at DESC
	`

	rows, err := db.DB.Query(query, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch chats"})
		return
	}
	defer rows.Close()

	var chats []domain.ChatListItem
	for rows.Next() {
		var chat domain.ChatListItem
		if err := rows.Scan(
			&chat.ID,
			&chat.CompanionID,
			&chat.LastMessage,
			&chat.LastMessageAt,
			&chat.CompanionName,
			&chat.AvatarURL,
		); err != nil {
			continue
		}
		chats = append(chats, chat)
	}

	c.JSON(http.StatusOK, domain.ChatListResponse{Chats: chats})
}

// GetChatHistory returns the chat history for a specific companion
func GetChatHistory(c *gin.Context) {
	userIdStr, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}
	userID := userIdStr.(string)
	companionID := c.Param("companion_id")

	rows, err := db.DB.Query(`
		SELECT id, user_id, companion_id, role, content, created_at 
		FROM messages 
		WHERE user_id = $1 AND companion_id = $2
		ORDER BY created_at ASC
	`, userID, companionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch chat history"})
		return
	}
	defer rows.Close()

	var messages []domain.Message
	for rows.Next() {
		var msg domain.Message
		if err := rows.Scan(&msg.ID, &msg.UserID, &msg.CompanionID, &msg.Role, &msg.Content, &msg.CreatedAt); err != nil {
			continue
		}
		messages = append(messages, msg)
	}

	c.JSON(http.StatusOK, domain.ChatHistoryResponse{Messages: messages})
}
