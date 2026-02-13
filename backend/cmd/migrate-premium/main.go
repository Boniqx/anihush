package main

import (
	"anikama-backend/pkg/db"
	"log"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	if err := db.InitDB(); err != nil {
		log.Fatal(err)
	}

	// Add is_premium column
	_, err := db.DB.Exec("ALTER TABLE stories ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;")
	if err != nil {
		log.Fatal("Failed to add is_premium column:", err)
	}

	log.Println("Successfully added is_premium column to stories table")
}
