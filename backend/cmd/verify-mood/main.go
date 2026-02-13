package main

import (
	"anikama-backend/pkg/db"
	"database/sql"
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

	// Query stories and print mood and is_premium
	rows, err := db.DB.Query("SELECT id, order_index, mood, is_premium FROM stories ORDER BY companion_id, order_index")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	for rows.Next() {
		var id string
		var orderIndex int
		var mood sql.NullString
		var isPremium bool

		if err := rows.Scan(&id, &orderIndex, &mood, &isPremium); err != nil {
			log.Fatal(err)
		}

		moodStr := "NULL"
		if mood.Valid {
			moodStr = mood.String
		}

		fmt.Printf("Story ID: %s, Order: %d, Mood: %s, Premium: %v\n", id, orderIndex, moodStr, isPremium)
	}
}
