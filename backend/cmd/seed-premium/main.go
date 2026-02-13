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

	// Set stories with order_index 1 to be premium
	_, err := db.DB.Exec("UPDATE stories SET is_premium = TRUE WHERE order_index = 1")
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Seeded premium stories successfully")
}
