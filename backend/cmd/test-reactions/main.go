package main

import (
	"anikama-backend/internal/service"
	"anikama-backend/pkg/db"
	"fmt"
	"log"
	"time"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

// Mock handler just for testing DB logic portion basically, or re-implement logic
// Actually, let's just query the DB and simulate logic like we did for premium
// because setting up a full Gin context with Auth middleware is repetitive.

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	if err := db.InitDB(); err != nil {
		log.Fatal(err)
	}

	// 1. Fetch a companion with reactions
	var companionID, happyURL, sadURL string
	err := db.DB.QueryRow(`
		SELECT r.companion_id, r.happy_reaction_url, r.sad_reaction_url 
		FROM reactions r 
		LIMIT 1
	`).Scan(&companionID, &happyURL, &sadURL)
	if err != nil {
		log.Fatal("Failed to fetch companion with reactions:", err)
	}
	fmt.Printf("Testing with Companion ID: %s\n", companionID)

	// 2. Simulate Happy Interaction (Heart)
	// We know Heart on Neutral gives +5 (or similar positive)
	storyMood := "happy"
	companionPersonality := service.PersonalityType("Deredere") // Dere likes hearts
	action := service.ReactionType("reaction_heart")

	delta := service.CalculateDelta(companionPersonality, action, storyMood)
	fmt.Printf("Action: Heart, Delta: %d\n", delta)

	expectedURL := ""
	if delta > 0 {
		expectedURL = happyURL
	} else if delta < 0 {
		expectedURL = sadURL
	}

	fmt.Printf("Expected URL: %s\n", expectedURL)
	if expectedURL != happyURL {
		log.Println("❌ Mismatch! Expected happy URL")
	} else {
		log.Println("✅ Positive interaction matches Happy URL logic")
	}

	// Calculate expected mood
	newScore := 0 + delta // Assuming start 0
	newMood := service.CalculateMood(newScore, time.Now())
	fmt.Printf("New Score: %d, New Mood: %s\n", newScore, newMood)
	if newMood != service.MoodHappy {
		log.Println("❌ Mismatch! Expected Happy mood for positive score")
	} else {
		log.Println("✅ Positive score triggers Happy mood")
	}

	// 3. Simulate Sad Interaction (Tsundere + Love = -2)
	storyMoodNeg := "neutral"
	companionPersonalityNeg := service.PersonalityType("Tsundere")
	actionNeg := service.ReactionType("reaction_heart")
	deltaNegative := service.CalculateDelta(companionPersonalityNeg, actionNeg, storyMoodNeg)

	fmt.Printf("Action: Tsundere Heart, Delta: %d\n", deltaNegative)

	expectedURLNeg := ""
	if deltaNegative > 0 {
		expectedURLNeg = happyURL
	} else if deltaNegative < 0 {
		expectedURLNeg = sadURL
	}

	fmt.Printf("Expected URL: %s\n", expectedURLNeg)
	if expectedURLNeg != sadURL {
		log.Println("❌ Mismatch! Expected sad URL")
	} else {
		log.Println("✅ Negative interaction matches Sad URL logic")
	}
}
