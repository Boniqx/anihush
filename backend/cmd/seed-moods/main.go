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

	// Update all stories to 'happy' first
	_, err := db.DB.Exec("UPDATE stories SET mood = 'happy'")
	if err != nil {
		log.Fatal(err)
	}

	// Update stories with order_index 1 to 'sad'
	_, err = db.DB.Exec("UPDATE stories SET mood = 'sad' WHERE order_index = 1")
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Seeded moods successfully")
}
