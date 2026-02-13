package handlers

import (
	"anikama-backend/internal/domain"
	"anikama-backend/pkg/db"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetStories returns all active stories grouped by companion
func GetStories(c *gin.Context) {
	// 1. Fetch User Tier
	userID, exists := c.Get("user_id")
	userTier := "free" // Default to free if auth fails or not provided (though auth middleware should handle it)

	if exists {
		// Assuming userID is the token or ID.
		// Ideally we fetch the user from DB to get fresh tier.
		// For now, let's query the user tier.
		var tier string
		err := db.DB.QueryRow("SELECT tier FROM profiles WHERE id = $1", userID).Scan(&tier)
		if err == nil {
			userTier = tier
		}
	}

	query := `
		SELECT 
			s.id, s.companion_id, s.media_url, s.media_type, 
			s.duration, s.order_index, s.mood, s.is_premium, s.created_at,
			co.name, co.avatar_url
		FROM stories s
		JOIN companions co ON s.companion_id = co.id
		ORDER BY s.companion_id, s.order_index ASC
	`

	rows, err := db.DB.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stories"})
		return
	}
	defer rows.Close()

	// Map to group stories by companion
	storiesMap := make(map[string]*domain.StoriesGrouped)

	for rows.Next() {
		var story domain.Story
		var companionName, avatarURL string

		err := rows.Scan(
			&story.ID,
			&story.CompanionID,
			&story.MediaURL,
			&story.MediaType,
			&story.Duration,
			&story.OrderIndex,
			&story.Mood,
			&story.IsPremium,
			&story.CreatedAt,
			&companionName,
			&avatarURL,
		)
		if err != nil {
			continue
		}

		// Apply Locking Logic
		if story.IsPremium && userTier != "premium" {
			story.IsLocked = true
			story.MediaURL = "" // Redact URL
		} else {
			story.IsLocked = false
		}

		// If this companion isn't in the map yet, create entry
		if _, exists := storiesMap[story.CompanionID]; !exists {
			storiesMap[story.CompanionID] = &domain.StoriesGrouped{
				CompanionID:   story.CompanionID,
				CompanionName: companionName,
				AvatarURL:     avatarURL,
				Stories:       []domain.Story{},
			}
		}

		// Add story to companion's list
		storiesMap[story.CompanionID].Stories = append(
			storiesMap[story.CompanionID].Stories,
			story,
		)
	}

	// Convert map to slice
	storiesGrouped := make([]domain.StoriesGrouped, 0, len(storiesMap))
	for _, group := range storiesMap {
		storiesGrouped = append(storiesGrouped, *group)
	}

	c.JSON(http.StatusOK, gin.H{
		"stories": storiesGrouped,
		"count":   len(storiesGrouped),
	})
}

// GetStoryByCompanionID returns all stories for a specific companion
func GetStoryByCompanionID(c *gin.Context) {
	companionID := c.Param("companionId")

	// 1. Fetch User Tier
	userID, exists := c.Get("user_id")
	userTier := "free"

	if exists {
		var tier string
		err := db.DB.QueryRow("SELECT tier FROM profiles WHERE id = $1", userID).Scan(&tier)
		if err == nil {
			userTier = tier
		}
	}

	query := `
		SELECT 
			s.id, s.companion_id, s.media_url, s.media_type, 
			s.duration, s.order_index, s.mood, s.is_premium, s.created_at,
			co.name, co.avatar_url
		FROM stories s
		JOIN companions co ON s.companion_id = co.id
		WHERE s.companion_id = $1
		ORDER BY s.order_index ASC
	`

	rows, err := db.DB.Query(query, companionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stories"})
		return
	}
	defer rows.Close()

	var stories []domain.Story
	var companionName, avatarURL string

	for rows.Next() {
		var story domain.Story
		err := rows.Scan(
			&story.ID,
			&story.CompanionID,
			&story.MediaURL,
			&story.MediaType,
			&story.Duration,
			&story.OrderIndex,
			&story.Mood,
			&story.IsPremium,
			&story.CreatedAt,
			&companionName,
			&avatarURL,
		)
		if err != nil {
			continue
		}

		// Apply Locking Logic
		if story.IsPremium && userTier != "premium" {
			story.IsLocked = true
			story.MediaURL = "" // Redact URL
		} else {
			story.IsLocked = false
		}

		stories = append(stories, story)
	}

	// Even if no stories found, we return the structure if possible,
	// but here we just return the list or empty list
	c.JSON(http.StatusOK, gin.H{
		"stories": stories,
		"count":   len(stories),
	})
}
