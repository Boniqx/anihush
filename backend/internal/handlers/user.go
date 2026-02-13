package handlers

import (
	"anikama-backend/internal/domain"
	"anikama-backend/pkg/db"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetCurrentUser returns the current authenticated user's profile
func GetCurrentUser(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	query := `
		SELECT id, username, tier, COALESCE(hush_coins, 0), created_at, updated_at
		FROM profiles
		WHERE id = $1
	`

	var user domain.User
	err := db.DB.QueryRow(query, userID).Scan(
		&user.ID,
		&user.Username,
		&user.Tier,
		&user.HushCoins,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": user,
	})
}
