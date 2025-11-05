# Gamification & Community Layer

## UX Principles
- Positive reinforcement: celebrate small wins (confetti, haptics, copy).
- No dark patterns; all social features are opt-in.
- Respect reduced motion & consent.

## Pages
- /play: Hub for progress, streaks, quests, peers online.
- /journal: Private self-help; user can optionally share snippets later.
- /community: Feed + reactions; comments can be added in a later PR.

## Components
- ProgressRing, StreakFlame, QuestCard, Badge, Confetti, Haptics
- AvatarStack, ReactionBar, ShareButton

## Data
- Tables: profiles, journal_entries, badges, user_badges, streaks, posts, reactions
- RLS: Owner CRUD for private data; public read for posts.

## Next Steps
- Add comments table + moderation, referral tracking, weekly challenges,
  push notifications (Web Push), and email nudges on streak risk (Klaviyo/Zapier).
