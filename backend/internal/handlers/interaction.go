package handlers

import (
	"anikama-backend/internal/domain"
	"anikama-backend/internal/service"
	"anikama-backend/pkg/db"
	"database/sql"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// InteractLegacy handles user interactions with companions (affinity/XP system)
func InteractLegacy(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	var req domain.InteractionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get XP for this action
	xpGained := service.GetXPForAction(req.Action)
	if xpGained == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid action type"})
		return
	}

	// Check if affinity record exists
	var currentXP, currentLevel int
	checkQuery := `
		SELECT xp, level 
		FROM user_affinity 
		WHERE user_id = $1 AND companion_id = $2
	`

	err := db.DB.QueryRow(checkQuery, userID, req.CompanionID).Scan(&currentXP, &currentLevel)

	if err == sql.ErrNoRows {
		// Create new affinity record
		currentXP = 0
		currentLevel = 1
		insertQuery := `
			INSERT INTO user_affinity (user_id, companion_id, xp, level, last_interaction)
			VALUES ($1, $2, $3, $4, $5)
		`
		_, err = db.DB.Exec(insertQuery, userID, req.CompanionID, xpGained, service.CalculateLevel(xpGained), time.Now())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create affinity"})
			return
		}
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch affinity"})
		return
	} else {
		// Update existing affinity
		newXP := currentXP + xpGained
		newLevel := service.CalculateLevel(newXP)

		updateQuery := `
			UPDATE user_affinity 
			SET xp = $1, level = $2, last_interaction = $3
			WHERE user_id = $4 AND companion_id = $5
		`
		_, err = db.DB.Exec(updateQuery, newXP, newLevel, time.Now(), userID, req.CompanionID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update affinity"})
			return
		}
	}

	// Get final state
	var finalXP, finalLevel int
	err = db.DB.QueryRow(checkQuery, userID, req.CompanionID).Scan(&finalXP, &finalLevel)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated affinity"})
		return
	}

	leveledUp := service.DidLevelUp(currentXP, finalXP)

	c.JSON(http.StatusOK, domain.InteractionResponse{
		CompanionID: req.CompanionID,
		XP:          finalXP,
		Level:       finalLevel,
		XPGained:    xpGained,
		LeveledUp:   leveledUp,
	})
}
