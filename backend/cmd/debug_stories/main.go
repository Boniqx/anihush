package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	connStr := "postgresql://postgres:postgres@127.0.0.1:54322/postgres?sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Check stories count
	var count int
	err = db.QueryRow("SELECT count(*) FROM stories").Scan(&count)
	if err != nil {
		// Try to create table if it doesn't exist? No, just fail.
		log.Printf("Failed to count stories (table might not exist): %v\n", err)
	} else {
		fmt.Printf("Stories count: %d\n", count)
	}

	// Check Stories details
	rowsStories, err := db.Query("SELECT id, companion_id FROM stories")
	if err != nil {
		log.Fatal("Failed to query stories:", err)
	}
	defer rowsStories.Close()
	fmt.Println("--- Stories ---")
	for rowsStories.Next() {
		var id, companionID string
		if err := rowsStories.Scan(&id, &companionID); err != nil {
			log.Fatal(err)
		}
		fmt.Printf("Story ID: %s, Companion ID: %s\n", id, companionID)
	}

	// Check All Companions
	rowsComps, err := db.Query("SELECT id, name FROM companions")
	if err != nil {
		log.Fatal("Failed to query companions:", err)
	}
	defer rowsComps.Close()
	fmt.Println("--- Companions ---")
	for rowsComps.Next() {
		var id, name string
		if err := rowsComps.Scan(&id, &name); err != nil {
			log.Fatal(err)
		}
		fmt.Printf("Companion: %s, ID: %s\n", name, id)
	}
}
