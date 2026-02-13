package main

import (
	"anikama-backend/internal/router"
	"anikama-backend/pkg/db"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  No .env file found, using system environment")
	}

	// Initialize database connection
if err := db.InitDB(); err != nil {
		log.Fatalf("❌ Failed to initialize database: %v", err)
	}
	defer db.CloseDB()

	

	// Setup router
	r := router.SetupRouter()

	// Get port from environment or default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Anikama Backend starting on port %s", port)
	log.Printf("📚 API Base URL: http://localhost:%s/api/v1", port)
	
	// Start server
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}
