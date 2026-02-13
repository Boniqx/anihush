package handlers

import (
	"anikama-backend/internal/domain"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// Register handles user registration with username-to-email conversion
func Register(c *gin.Context) {
	var req domain.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert username to dummy email for Supabase Auth
	// Format: {username}@anikama.app
	email := fmt.Sprintf("%s@anikama.app", req.Username)

	// TODO: Call Supabase Auth API to create user
	// For now, this is a placeholder that explains the flow
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_ANON_KEY")

	if supabaseURL == "" || supabaseKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Supabase configuration missing",
			"note":  "This endpoint requires Supabase URL and Anon Key to be configured",
		})
		return
	}

	// The actual implementation would:
	// 1. POST to {SUPABASE_URL}/auth/v1/signup
	// 2. Send: { email, password, options: { data: { username } } }
	// 3. The database trigger will create the profile automatically
	// 4. Return the session token

	c.JSON(http.StatusOK, gin.H{
		"message":      "Registration endpoint ready - implement Supabase auth integration",
		"email_format": email,
		"username":     req.Username,
		"note":         "Frontend should handle Supabase auth directly using supabase-js client",
	})
}

// Login handles user login
// Note: In practice, login should be handled by Supabase Auth on the frontend
func Login(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Login should be handled by Supabase Auth on frontend",
		"note":    "Use supabase.auth.signInWithPassword() with converted email",
	})
}
