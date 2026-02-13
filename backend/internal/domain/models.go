package domain

import (
	"time"
)

// User represents a registered user profile
type User struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Tier      string    `json:"tier"` // "free" or "premium"
	HushCoins int       `json:"hush_coins"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Companion represents an anime character companion
type Companion struct {
	ID                string        `json:"id"`
	Name              string        `json:"name"`
	AnimeSource       string        `json:"anime_source"`
	Archetype         string        `json:"archetype"`
	AvatarURL         string        `json:"avatar_url"`
	PersonalityTraits []string      `json:"personality_traits"`
	Tags              []string      `json:"tags"`
	SystemPrompt      string        `json:"system_prompt"`
	Mood              string        `json:"mood"`
	PersonalityType   string        `json:"personality_type"`
	HasStories        bool          `json:"has_stories"`
	CreatedAt         time.Time     `json:"created_at"`
	Relationship      *Relationship `json:"relationship,omitempty"` // null if no relationship
}

// Relationship represents the dynamic affinity engine state
type Relationship struct {
	UserID            string    `json:"user_id"`
	CompanionID       string    `json:"companion_id"`
	AffinityScore     int       `json:"affinity_score"`
	CurrentMood       string    `json:"current_mood"`
	LastInteractionAt time.Time `json:"last_interaction_at"`
}

// Story represents a companion's story content
type Story struct {
	ID          string    `json:"id"`
	CompanionID string    `json:"companion_id"`
	MediaURL    string    `json:"media_url"`
	MediaType   string    `json:"media_type"` // "image" or "video"
	Duration    int       `json:"duration"`
	OrderIndex  int       `json:"order_index"`
	Mood        string    `json:"mood"`
	IsPremium   bool      `json:"is_premium"`
	IsLocked    bool      `json:"is_locked,omitempty"` // Computed field, not in DB
	CreatedAt   time.Time `json:"created_at"`
}

// UserAffinity represents the user-companion relationship (Legacy/XP)
type UserAffinity struct {
	UserID          string    `json:"user_id"`
	CompanionID     string    `json:"companion_id"`
	XP              int       `json:"xp"`
	Level           int       `json:"level"`
	LastInteraction time.Time `json:"last_interaction"`
	CreatedAt       time.Time `json:"created_at"`
}

// CompanionWithAffinity combines companion data with user affinity (Legacy)
type CompanionWithAffinity struct {
	Companion
	UserAffinity *UserAffinity `json:"affinity,omitempty"`
}

// StoriesGrouped represents stories grouped by companion
type StoriesGrouped struct {
	CompanionID   string  `json:"companion_id"`
	CompanionName string  `json:"companion_name"`
	AvatarURL     string  `json:"avatar_url"`
	Stories       []Story `json:"stories"`
}

// Chat request and response types
type ChatRequest struct {
	CompanionID string `json:"companion_id" binding:"required"`
	Message     string `json:"message" binding:"required"`
}

type ChatResponse struct {
	CompanionID string `json:"companion_id"`
	Message     string `json:"message"`
	IsLimited   bool   `json:"is_limited"` // True if response was limited due to free tier
}

// Interaction request type
type InteractionRequest struct {
	CompanionID string `json:"companion_id" binding:"required"`
	Action      string `json:"action" binding:"required"` // "view_story" or "sent_msg"
}

type InteractionResponse struct {
	CompanionID string `json:"companion_id"`
	XP          int    `json:"xp"`
	Level       int    `json:"level"`
	XPGained    int    `json:"xp_gained"`
	LeveledUp   bool   `json:"leveled_up"`
}

// Auth types
type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=20"`
	Password string `json:"password" binding:"required,min=8"`
}

type AuthResponse struct {
	User  User   `json:"user"`
	Token string `json:"token,omitempty"`
}

// Chat types
type Message struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`
	CompanionID string    `json:"companion_id"`
	Role        string    `json:"role"` // "user" or "assistant"
	Content     string    `json:"content"`
	CreatedAt   time.Time `json:"created_at"`
}

type ChatHistoryResponse struct {
	Messages []Message `json:"messages"`
}

// Chat List item
type ChatListItem struct {
	ID            string    `json:"id"`
	CompanionID   string    `json:"companion_id"`
	CompanionName string    `json:"companion_name"`
	AvatarURL     string    `json:"avatar_url"`
	LastMessage   string    `json:"last_message"`
	LastMessageAt time.Time `json:"last_message_at"`
}

type ChatListResponse struct {
	Chats []ChatListItem `json:"chats"`
}

type Reaction struct {
	ID               string    `json:"id"`
	CompanionID      string    `json:"companion_id"`
	HappyReactionURL string    `json:"happy_reaction_url"`
	SadReactionURL   string    `json:"sad_reaction_url"`
	CreatedAt        time.Time `json:"created_at"`
}
