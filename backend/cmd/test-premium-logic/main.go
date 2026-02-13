package main

import (
	"anikama-backend/pkg/db"
	"fmt"
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

	// 1. Fetch a user
	var userID, tier string
	err := db.DB.QueryRow("SELECT id, tier FROM profiles LIMIT 1").Scan(&userID, &tier)
	if err != nil {
		log.Fatal("Failed to fetch user:", err)
	}
	fmt.Printf("Testing with User ID: %s, Tier: %s\n", userID, tier)

	// 2. Fetch stories
	rows, err := db.DB.Query("SELECT id, media_url, is_premium FROM stories")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	for rows.Next() {
		var id, mediaURL string
		var isPremium bool
		if err := rows.Scan(&id, &mediaURL, &isPremium); err != nil {
			log.Fatal(err)
		}

		isLocked := false
		finalURL := mediaURL

		// Logic from handler
		if isPremium && tier != "premium" {
			isLocked = true
			finalURL = "" // Redacted
		}

		fmt.Printf("Story %s: Premium=%v, Locked=%v, URL=%s\n", id, isPremium, isLocked, finalURL)
	}
}
