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

	// Fetch all companions
	rows, err := db.DB.Query("SELECT id FROM companions")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	for rows.Next() {
		var companionID string
		if err := rows.Scan(&companionID); err != nil {
			log.Fatal(err)
		}

		// Insert or Update reaction URLs
		// Using placeholder URLs for now
		happyURL := "https://cdn.pixabay.com/video/2020/08/04/46369-448834079_tiny.mp4" // Placeholder happy
		sadURL := "https://cdn.pixabay.com/video/2019/04/23/23011-332470747_tiny.mp4"   // Placeholder sad

		_, err := db.DB.Exec(`
			INSERT INTO reactions (companion_id, happy_reaction_url, sad_reaction_url)
			VALUES ($1, $2, $3)
			ON CONFLICT (companion_id) 
			DO UPDATE SET happy_reaction_url = $2, sad_reaction_url = $3
		`, companionID, happyURL, sadURL)

		if err != nil {
			log.Printf("Failed to seed reactions for companion %s: %v\n", companionID, err)
		} else {
			log.Printf("Seeded reactions for companion %s\n", companionID)
		}
	}

	log.Println("Finished seeding reactions")
}
