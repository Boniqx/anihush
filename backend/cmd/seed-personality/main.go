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

	// Map companion names to personality types
	// Using partial name matches for simplicity
	assignments := map[string]string{
		"Gojo":     "Ore-sama",
		"Yor":      "Deredere",
		"Loid":     "Kuudere",
		"Levi":     "Tsundere",
		"Power":    "Ore-sama",
		"Makima":   "Kuudere",
		"Bakugo":   "Tsundere",
		"Mikasa":   "Kuudere",
		"Zero Two": "Deredere",
		"Frieren":  "Kuudere",
	}

	for name, pType := range assignments {
		res, err := db.DB.Exec(`
			UPDATE companions 
			SET personality_type = $1 
			WHERE name LIKE $2 AND personality_type IS NULL
		`, pType, "%"+name+"%")

		if err != nil {
			log.Printf("Failed to update %s: %v\n", name, err)
			continue
		}

		rows, _ := res.RowsAffected()
		if rows > 0 {
			fmt.Printf("Updated %s to %s\n", name, pType)
		}
	}

	// Set default for any remaining NULLs
	_, err := db.DB.Exec(`UPDATE companions SET personality_type = 'Deredere' WHERE personality_type IS NULL`)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Set default 'Deredere' for any remaining companions.")
}
