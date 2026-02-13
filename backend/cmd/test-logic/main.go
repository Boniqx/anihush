package main

import (
	"anikama-backend/internal/service"
	"fmt"
)

func main() {
	// Test Case 1: Happy Story + Love (Deredere)
	// Base Deredere Love = 10. Happy adds 5. Result should be 15.
	delta1 := service.CalculateDelta(service.PersonalityDeredere, service.ReactionLove, "happy")
	fmt.Printf("Deredere + Love + Happy Story: Expected 15, Got %d\n", delta1)

	// Test Case 2: Sad Story + Laugh (Deredere)
	// Base Deredere Laugh = 5. Sad makes it -10 (penalty).
	delta2 := service.CalculateDelta(service.PersonalityDeredere, service.ReactionLaugh, "sad")
	fmt.Printf("Deredere + Laugh + Sad Story: Expected -10, Got %d\n", delta2)

	// Test Case 3: Neutral + Love (Deredere)
	// Base Deredere Love = 10. Neutral adds 0. Result should be 10.
	delta3 := service.CalculateDelta(service.PersonalityDeredere, service.ReactionLove, "neutral")
	fmt.Printf("Deredere + Love + Neutral Story: Expected 10, Got %d\n", delta3)
}
