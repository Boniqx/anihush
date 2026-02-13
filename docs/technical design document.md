Project: "Anikama" - Anime AI Companion Social Platform
Target Audience: Anime fans (Shonen/Seinen demographics).
Core Value: A "Social Loop" experience where users build relationships with popular anime characters through stories and chat.

1. Visual Identity & UX Design
   Theme: "Energetic & Friendly" (Shonen Jump aesthetic).

Primary Color: Orange (#FF9900 or similar vibrant playful orange) mixed with high-contrast white and dark grey/black.

Typography: Clean sans-serif (Inter or Geist) with bold, stylized headers reminiscent of manga covers.

Animation (GSAP):

Bouncy Interactions: Buttons should scale down slightly on click (scale: 0.95) and bounce back with an elastic ease.

Page Transitions: Smooth fade-ins with slight upward movement for content.

Story Transitions: Instagram-style cube or slide transitions, but faster/snappier.

Responsiveness: Mobile-first approach. On desktop, the app simulates a "mobile app view" in the center or uses a masonry grid layout for the feed.

2. Tech Stack Requirements
   Frontend
   Framework: Next.js 14 (App Router)

Library: React 19

Styling: Tailwind CSS v4 + Shadcn UI (for base components).

Animations: GSAP (GreenSock) for high-fidelity, "bouncy" animations.

State Management:

Global: Redux Toolkit (for User Auth state, Global Modals, Notifications).

Feature-Scoped: React Context API (e.g., StoryContext for managing current story slide).

Data Fetching: Server-Side Rendering (SSR) for initial data; Client-side fetching for dynamic interactions.

Backend
Language: Go (Golang).

API Architecture: RESTful API (chosen for speed of implementation and robustness in 48h).

Database: Supabase (PostgreSQL).

Auth: Supabase Auth (Email/Password or Username/Password).

3. Frontend Architecture (Feature-First)
   The folder structure must strictly follow a Feature-First pattern to ensure scalability and clean separation.

Plaintext
/src
/app # Next.js App Router pages
/components # SHARED atomic components (Buttons, Inputs, Cards)
/ui # Shadcn components
/features # Feature-based modules
/auth # Login/Register forms, Auth slices
/stories # Story viewer, progression logic, story context
/chat # Chat interface, message bubbles
/companions # Companion lists, profile cards
/store # Redux store setup
/lib # Utilities (GSAP setup, Supabase client, API fetchers) 4. Database Schema & Data Models
The backend must serve 10 distinct Anime Companions.

Character Roster (Seed Data)
Yor Forger (Spy x Family) - Archetype: Motherly/Deadly

Loid Forger (Spy x Family) - Archetype: Stoic/Smart

Katsuki Bakugo (MHA) - Archetype: Tsundere/Aggressive

Levi Ackerman (AOT) - Archetype: Cold/Clean Freak

Mikasa Ackerman (AOT) - Archetype: Loyal/Protective

Gojo Satoru (JJK) - Archetype: Playful/OP

Makima (Chainsaw Man) - Archetype: Domineering/Mysterious

Power (Chainsaw Man) - Archetype: Chaotic/Selfish

Izuku Midoriya (MHA) - Archetype: Heroic/Nervous

Zero Two (Darling in the Franxx) - Archetype: Flirty/Dangerous

Schema
Companions: id, name, anime_source, avatar_url, personality_json (traits), affinity_level (default 0).

Stories: id, companion_id, media_url (video/image), type, order_index.

User_Affinity: user_id, companion_id, current_level, points.

5. Feature Specifications
   A. Core Feature: The Social Loop (Stories)
   Logic: Users see a horizontal scroll of "Story Bubbles" (like IG) at the top.

Gatekeeping: If a user is not logged in, clicking a story triggers a bouncy "Login to View" modal.

The Viewer: A full-screen overlay. Tapping right goes to the next story; tapping left goes back. Long-press to pause.

Requirement: At least one character (e.g., Gojo) must have a sequence of 4+ story posts.

B. Core Feature: Chat (Base)
Simple UI with message bubbles.

User sends text -> Go Backend -> Mock AI Response (or generic logic if LLM is too heavy) -> Update UI.

C. Net-New Feature 1: "Nakama Level" (Affinity System)
Concept: A gamified relationship meter inspired by dating sims/RPGs.

Mechanic: Watching a full story grants +5 XP. Chatting grants +1 XP.

UI: A circular progress bar around the character's avatar in the profile.

Payoff: Reaching "Level 5" unlocks a "Secret Voice Note" or "Exclusive Image".

D. Net-New Feature 2: "Daily Scenario" (Event System)
Concept: A daily unique "Quest" or prompt from a random character.

Mechanic: On login, a modal appears: "Bakugo is challenging you to a push-up contest."

Action: User clicks "Accept" -> Triggers a specific chat scenario.

Technical: This requires a Cron Job or a simple date-check in the Go backend to rotate the "Daily Scenario" every 24 hours.

6. Implementation Steps for AI
   Setup: Initialize Next.js 14 project with Tailwind 4. Setup Redux store.

Styles: Configure globals.css with the "Anime Orange" theme and install GSAP.

Backend: Scaffold Go server. Create main.go and routes for /api/companions and /api/stories.

UI Construction: Build StoryCircle, FeedCard, and ChatInterface components in the /features folder.

Integration: Connect Frontend to Go API. Ensure Supabase Auth protects private routes.

Polish: Add GSAP bouncy animations to all interactive elements.
