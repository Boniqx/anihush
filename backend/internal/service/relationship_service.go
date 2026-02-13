package service

import (
	"time"
)

type PersonalityType string

const (
	PersonalityTsundere PersonalityType = "Tsundere"
	PersonalityDeredere PersonalityType = "Deredere"
	PersonalityKuudere  PersonalityType = "Kuudere"
	PersonalityOreSama  PersonalityType = "Ore-sama"
)

type ReactionType string

const (
	ReactionLove  ReactionType = "reaction_heart"
	ReactionFire  ReactionType = "reaction_fire"
	ReactionLaugh ReactionType = "reaction_laugh"
	ReactionAngry ReactionType = "reaction_angry"
)

type MoodState string

const (
	MoodNeutral MoodState = "neutral"
	MoodHappy   MoodState = "happy"
	MoodJealous MoodState = "jealous"
	MoodAnnoyed MoodState = "annoyed"
	MoodFlirty  MoodState = "flirty"
	MoodSad     MoodState = "sad"
)

type InteractionResult struct {
	NewScore     int       `json:"new_score"`
	Delta        int       `json:"delta"`
	NewMood      MoodState `json:"new_mood"`
	ToastMessage string    `json:"toast_message"`
}

func CalculateDelta(personality PersonalityType, reaction ReactionType, storyMood string) int {
	// Angry always hurts
	if reaction == ReactionAngry {
		return -20
	}

	// Base delta from personality (original logic)
	baseDelta := 0
	switch personality {
	case PersonalityTsundere:
		switch reaction {
		case ReactionLove:
			baseDelta = -2
		case ReactionFire:
			baseDelta = 5
		case ReactionLaugh:
			baseDelta = -5
		}
	case PersonalityDeredere:
		switch reaction {
		case ReactionLove:
			baseDelta = 10
		case ReactionFire:
			baseDelta = -2
		case ReactionLaugh:
			baseDelta = 5
		}
	case PersonalityKuudere:
		switch reaction {
		case ReactionLove:
			baseDelta = 2
		case ReactionFire:
			baseDelta = 0
		case ReactionLaugh:
			baseDelta = 0
		}
	case PersonalityOreSama:
		switch reaction {
		case ReactionLove:
			baseDelta = 3
		case ReactionFire:
			baseDelta = 5
		case ReactionLaugh:
			baseDelta = 5
		}
	}

	// Adjust based on Story Mood
	// If story is Sad, Laughing is bad (-10), Heart is good (+5)
	if storyMood == "sad" {
		if reaction == ReactionLaugh {
			return -10
		}
		if reaction == ReactionLove {
			return baseDelta + 5
		}
	}

	// If story is Happy, Laughing is good (+5), Heart is good (+5)
	if storyMood == "happy" {
		if reaction == ReactionLaugh {
			return baseDelta + 5
		}
		if reaction == ReactionLove {
			return baseDelta + 5
		}
	}

	return baseDelta
}

func CalculateMood(score int, lastInteraction time.Time) MoodState {
	// Sad: If score < -20
	if score < -20 {
		return MoodSad
	}

	// Jealous: If score > 50 AND last_interaction > 24h ago
	if score > 50 && time.Since(lastInteraction) > 24*time.Hour {
		return MoodJealous
	}

	// Flirty: If score > 80
	if score > 80 {
		return MoodFlirty
	}

	// Annoyed: If score < 0
	if score < 0 {
		return MoodAnnoyed
	}

	// Happy: Default if score > 0
	if score > 0 {
		return MoodHappy
	}

	return MoodNeutral
}

func GenerateToastMessage(personality PersonalityType, mood MoodState, delta int) string {
	if mood == MoodSad {
		return "You broke their heart..."
	}
	// Simple logic for now, can be expanded
	if delta > 0 {
		return "Relationship deepened!"
	} else if delta < 0 {
		return "They didn't like that..."
	}
	return "No reaction."
}
