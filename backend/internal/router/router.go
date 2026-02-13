package router

import (
	"anikama-backend/internal/handlers"
	"anikama-backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRouter configures all API routes
func SetupRouter() *gin.Engine {
	router := gin.Default()

	// Apply CORS middleware
	router.Use(middleware.CORSMiddleware())

	// API v1 group
	v1 := router.Group("/api/v1")
	{
		// Auth routes (public)
		auth := v1.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			// Login is handled by Supabase on frontend
		}

		// Public companion routes
		companions := v1.Group("/companions")
		{
			companions.GET("", middleware.OptionalAuthMiddleware(), handlers.GetCompanions)
			companions.GET("/:id", middleware.OptionalAuthMiddleware(), handlers.GetCompanionByID)
		}

		// Public stories route
		v1.GET("/stories", handlers.GetStories)
		v1.GET("/story/:companionId", handlers.GetStoryByCompanionID)

		// Protected routes (require authentication)
		protected := v1.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			// Chat endpoint (requires auth)
			protected.POST("/chat", handlers.Chat)
			protected.GET("/chats", handlers.GetChats) // List of chats
			protected.GET("/chat/:companion_id/history", handlers.GetChatHistory)

			// Interaction endpoint (requires auth)
			protected.POST("/interact", handlers.Interact)

			// User profile endpoint
			protected.GET("/user/me", handlers.GetCurrentUser)

			// Economy endpoints
			protected.POST("/economy/deposit", handlers.Deposit)

			// Relationship endpoint
			protected.GET("/relationship/:companion_id", handlers.GetRelationship)
		}
	}

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "anikama-backend",
		})
	})

	return router
}
