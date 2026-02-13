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

	// Create reactions table
	query := `
		CREATE TABLE IF NOT EXISTS reactions (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			companion_id UUID REFERENCES companions(id) ON DELETE CASCADE,
			happy_reaction_url TEXT,
			sad_reaction_url TEXT,
			created_at TIMESTAMPTZ DEFAULT NOW(),
			UNIQUE(companion_id)
		);
	`

	_, err := db.DB.Exec(query)
	if err != nil {
		log.Fatal("Failed to create reactions table:", err)
	}

	log.Println("Successfully created reactions table")
}
