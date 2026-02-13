package handlers

import (
	"anikama-backend/internal/domain"
	"anikama-backend/pkg/db"
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
)

// GetCompanions returns all companions with their mood/status and user relationship if authenticated
func GetCompanions(c *gin.Context) {
	userID, _ := c.Get("user_id") // Optional auth

	// Base query
	query := `
		SELECT c.id, c.name, c.anime_source, c.archetype, c.avatar_url, 
		       c.personality_traits, c.tags, 
		       COALESCE(c.system_prompt, ''), 
		       COALESCE(c.mood, 'Neutral'), 
		       COALESCE(c.personality_type, 'Deredere'), 
		       c.created_at,
		       EXISTS(SELECT 1 FROM stories s WHERE s.companion_id = c.id) as has_stories,
		       r.user_id, r.companion_id, r.affinity_score, r.current_mood, r.last_interaction_at
		FROM companions c
		LEFT JOIN relationships r ON c.id = r.companion_id AND r.user_id = $1
		ORDER BY c.created_at ASC
	`

	// Prepare userID for query (handle nil/empty)
	var queryUserID interface{}
	if userID != nil {
		queryUserID = userID
	} else {
		queryUserID = nil // SQL driver handles nil as NULL
	}

	rows, err := db.DB.Query(query, queryUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch companions"})
		return
	}
	defer rows.Close()

	companions := []domain.Companion{}
	for rows.Next() {
		var comp domain.Companion
		var rel domain.Relationship

		// Nullable fields for relationship
		var rUserID, rCompanionID, rCurrentMood sql.NullString
		var rAffinityScore sql.NullInt64
		var rLastInteractionAt sql.NullTime

		err := rows.Scan(
			&comp.ID,
			&comp.Name,
			&comp.AnimeSource,
			&comp.Archetype,
			&comp.AvatarURL,
			pq.Array(&comp.PersonalityTraits),
			pq.Array(&comp.Tags),
			&comp.SystemPrompt,
			&comp.Mood,
			&comp.PersonalityType,
			&comp.CreatedAt,
			&comp.HasStories,
			&rUserID,
			&rCompanionID,
			&rAffinityScore,
			&rCurrentMood,
			&rLastInteractionAt,
		)
		if err != nil {
			continue
		}

		// Map relationship if it exists
		if rUserID.Valid {
			rel.UserID = rUserID.String
			rel.CompanionID = rCompanionID.String
			rel.AffinityScore = int(rAffinityScore.Int64)
			rel.CurrentMood = rCurrentMood.String
			rel.LastInteractionAt = rLastInteractionAt.Time
			comp.Relationship = &rel
		}

		companions = append(companions, comp)
	}

	c.JSON(http.StatusOK, gin.H{
		"companions": companions,
		"count":      len(companions),
	})
}

// GetCompanionByID returns a specific companion with user affinity if authenticated
func GetCompanionByID(c *gin.Context) {
	companionID := c.Param("id")
	userID, _ := c.Get("user_id") // Optional auth

	// Get companion details
	compQuery := `
		SELECT id, name, anime_source, archetype, avatar_url, 
		       personality_traits, tags, system_prompt, mood, created_at
		FROM companions
		WHERE id = $1
	`

	var comp domain.Companion
	err := db.DB.QueryRow(compQuery, companionID).Scan(
		&comp.ID,
		&comp.Name,
		&comp.AnimeSource,
		&comp.Archetype,
		&comp.AvatarURL,
		pq.Array(&comp.PersonalityTraits),
		pq.Array(&comp.Tags),
		&comp.SystemPrompt,
		&comp.Mood,
		&comp.CreatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Companion not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch companion"})
		return
	}

	response := domain.CompanionWithAffinity{
		Companion: comp,
	}

	// If user is authenticated, get their affinity
	if userID != nil {
		affinityQuery := `
			SELECT user_id, companion_id, xp, level, last_interaction, created_at
			FROM user_affinity
			WHERE user_id = $1 AND companion_id = $2
		`

		var affinity domain.UserAffinity
		err := db.DB.QueryRow(affinityQuery, userID, companionID).Scan(
			&affinity.UserID,
			&affinity.CompanionID,
			&affinity.XP,
			&affinity.Level,
			&affinity.LastInteraction,
			&affinity.CreatedAt,
		)

		if err == nil {
			response.UserAffinity = &affinity
		}
		// If no affinity exists, that's fine - it means they haven't interacted yet
	}

	c.JSON(http.StatusOK, response)
}
