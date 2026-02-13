package middleware

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware validates the JWT token from Supabase
// It extracts the user ID and attaches it to the context
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization format"})
			c.Abort()
			return
		}

		token := parts[1]

		// TODO: Validate JWT token with Supabase
		// For now, we'll create a placeholder
		// In production, you would:
		// 1. Verify the JWT signature using Supabase JWT secret
		// 2. Extract the user ID from the token claims
		// 3. Optionally check token expiration

		// Placeholder: Use the token as user ID directly for development
		// in production, you would parse the JWT and verify signature
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Try to extract user ID from JWT if it looks like one
		userID := token
		if strings.Count(token, ".") == 2 {
			parts := strings.Split(token, ".")
			payload, err := base64.RawURLEncoding.DecodeString(parts[1])
			if err == nil {
				var claims map[string]interface{}
				if err := json.Unmarshal(payload, &claims); err == nil {
					if sub, ok := claims["sub"].(string); ok {
						userID = sub
					}
				}
			}
		}

		// Set user ID in context
		c.Set("user_id", userID)

		c.Next()
	}
}

// OptionalAuthMiddleware is similar to AuthMiddleware but doesn't abort if no auth
// It just sets the user_id if available
func OptionalAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				token := parts[1]
				if token != "" {
					// Set user ID if valid (placeholder)
					c.Set("user_id", "placeholder-user-id")
				}
			}
		}
		c.Next()
	}
}
