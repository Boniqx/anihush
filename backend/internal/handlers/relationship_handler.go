package handlers

import (
	"anikama-backend/pkg/db"
	"database/sql"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"anikama-backend/internal/service"
)

type InteractRequest struct {
	CompanionID string `json:"companion_id"`
	Action      string `json:"action"`
	StoryID     string `json:"story_id"`
}

type InteractResponse struct {
	NewScore         int    `json:"new_score"`
	Delta            int    `json:"delta"`
	NewMood          string `json:"new_mood"`
	ToastMessage     string `json:"toast_message"`
	ReactionVideoURL string `json:"reaction_video_url,omitempty"`
}

func Interact(c *gin.Context) {
	// Get User ID from context (Auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req InteractRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Fetch Companion Personality
	var personalityType string
	err := db.DB.QueryRow("SELECT personality_type FROM companions WHERE id = $1", req.CompanionID).Scan(&personalityType)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Companion not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch companion"})
		return
	}

	// 1b. Fetch Story Mood if StoryID is present
	storyMood := "neutral"
	if req.StoryID != "" {
		err := db.DB.QueryRow("SELECT mood FROM stories WHERE id = $1", req.StoryID).Scan(&storyMood)
		if err != nil && err != sql.ErrNoRows {
			// Log error but continue with neutral mood
			// Log error but continue with neutral mood
		}
	}

	// 2. Fetch Current Relationship (if exists)
	var currentScore int
	var lastInteraction time.Time

	// Default values
	currentScore = 0
	lastInteraction = time.Now().Add(-240 * time.Hour) // Long time ago

	var dbScore sql.NullInt64
	var dbLastInteraction sql.NullTime

	err = db.DB.QueryRow(`
		SELECT affinity_score, last_interaction_at 
		FROM relationships 
		WHERE user_id = $1 AND companion_id = $2
	`, userID, req.CompanionID).Scan(&dbScore, &dbLastInteraction)

	if err == sql.ErrNoRows {
		// No relationship exists, create one
		// No relationship exists, create one
		// Default values are already set: currentScore = 0, lastInteraction = long ago
		// We can proceed with these defaults, the INSERT/UPSERT at the end will save it.
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch relationship"})
		return
	}

	if dbScore.Valid {
		currentScore = int(dbScore.Int64)
	}
	if dbLastInteraction.Valid {
		lastInteraction = dbLastInteraction.Time
	}

	// 3. Calculate New State
	companionPersonality := service.PersonalityType(personalityType)
	delta := service.CalculateDelta(companionPersonality, service.ReactionType(req.Action), storyMood)

	newScore := currentScore + delta
	// Clamp score between -100 and 100
	if newScore > 100 {
		newScore = 100
	} else if newScore < -100 {
		newScore = -100
	}

	newMood := service.CalculateMood(newScore, lastInteraction)

	toastMsg := service.GenerateToastMessage(companionPersonality, newMood, delta)

	// 5. Fetch Reaction Video if applicable
	var reactionVideoURL string
	if delta != 0 {
		var happyURL, sadURL string
		err := db.DB.QueryRow("SELECT happy_reaction_url, sad_reaction_url FROM reactions WHERE companion_id = $1", req.CompanionID).Scan(&happyURL, &sadURL)
		if err == nil {
			if delta > 0 {
				reactionVideoURL = happyURL
			} else {
				reactionVideoURL = sadURL
			}
		}
	}

	// 4. Upsert Relationship
	_, err = db.DB.Exec(`
		INSERT INTO relationships (user_id, companion_id, affinity_score, current_mood, last_interaction_at)
		VALUES ($1, $2, $3, $4, NOW())
		ON CONFLICT (user_id, companion_id) 
		DO UPDATE SET affinity_score = $3, current_mood = $4, last_interaction_at = NOW()
	`, userID, req.CompanionID, newScore, string(newMood))

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update relationship"})
		return
	}

	resp := InteractResponse{
		NewScore:         newScore,
		Delta:            delta,
		NewMood:          string(newMood),
		ToastMessage:     toastMsg,
		ReactionVideoURL: reactionVideoURL,
	}

	c.JSON(http.StatusOK, resp)
}

// GetRelationship returns the relationship status between current user and a companion
func GetRelationship(c *gin.Context) {
	// Get User ID from context (Auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	companionID := c.Param("companion_id")
	if companionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Companion ID required"})
		return
	}

	var affinityScore int
	var currentMood string
	var lastInteraction time.Time

	err := db.DB.QueryRow(`
		SELECT affinity_score, current_mood, last_interaction_at 
		FROM relationships 
		WHERE user_id = $1 AND companion_id = $2
	`, userID, companionID).Scan(&affinityScore, &currentMood, &lastInteraction)

	if err == sql.ErrNoRows {
		// Return friendly empty state for frontend to handle (or 404, but json is nicer)
		// Let's return a default relationship structure
		c.JSON(http.StatusOK, gin.H{
			"found":          false,
			"affinity_score": 0,
			"current_mood":   "neutral",
		})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch relationship"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"found":               true,
		"affinity_score":      affinityScore,
		"current_mood":        currentMood,
		"last_interaction_at": lastInteraction,
	})
}
