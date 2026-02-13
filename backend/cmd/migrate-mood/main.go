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

	// Add mood column
	_, err := db.DB.Exec("ALTER TABLE stories ADD COLUMN IF NOT EXISTS mood VARCHAR(50) DEFAULT 'neutral';")
	if err != nil {
		log.Fatal("Failed to add mood column:", err)
	}

	log.Println("Successfully added mood column to stories table")
}
