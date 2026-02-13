package service

// CalculateLevel calculates the level based on XP
// Formula: level = floor(xp / 100) + 1
func CalculateLevel(xp int) int {
	return (xp / 100) + 1
}

// GetXPForAction returns the XP reward for a specific action
func GetXPForAction(action string) int {
	xpRewards := map[string]int{
		"view_story": 5,
		"sent_msg":   1,
	}

	if xp, exists := xpRewards[action]; exists {
		return xp
	}
	return 0
}

// DidLevelUp checks if the user leveled up
func DidLevelUp(oldXP, newXP int) bool {
	return CalculateLevel(newXP) > CalculateLevel(oldXP)
}
