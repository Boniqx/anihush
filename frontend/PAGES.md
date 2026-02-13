# Anikama - Frontend Pages Quick Reference

## Routes Created

### Public Routes

- `/` - Landing page with CTA
- `/login` - Auth form (login/register toggle)

### Protected Routes (TODO: Add auth middleware)

- `/companions` - Companion list with story ring
- `/companions/[id]` - Companion detail with chat

## Component Structure

### Features

```
/features
  /auth
    - AuthForm.tsx (login/register)
  /companions
    - CompanionCard.tsx (GSAP animations)
    - CompanionList.tsx (grid layout)
  /stories
    - StoryRing.tsx (horizontal scroll)
    - StoryViewer.tsx (Instagram-style)
  /chat
    - ChatWindow.tsx (Gemini integration)
  /nakama
    - AffinityDisplay.tsx (XP/level display)
```

### Common Components

```
/components
  /common
    - ReduxProvider.tsx
  /ui
    - styles.css (utilities)
```

## API Integration Points

All components use `NEXT_PUBLIC_API_URL` from env:

1. **CompanionList** → `GET /api/v1/companions`
2. **CompanionDetail** → `GET /api/v1/companions/:id`
3. **StoryRing** → `GET /api/v1/stories`
4. **ChatWindow** → `POST /api/v1/chat`
5. **AuthForm** → Supabase Auth (client-side)

## Next Steps

1. Add auth middleware for protected routes
2. Implement interaction tracking (XP updates)
3. Add tier-based UI restrictions
4. Mobile optimization
5. Add loading states everywhere
