# Gamification & Community Layer - Complete Implementation

## Overview
A comprehensive gamification and community engagement system for Hardonia, featuring streaks, badges, quests, leaderboards, social features, and more.

## UX Principles
- **Positive reinforcement**: Celebrate small wins with confetti, haptics, and encouraging copy
- **No dark patterns**: All social features are opt-in and consent-aware
- **Accessibility**: WCAG 2.2 AA compliant, reduced motion support, keyboard navigation
- **Mobile-first**: Optimized for touch interactions, large tap targets (≥44px)
- **Performance**: Lazy loading, code splitting, minimal layout shift

## Pages & Routes

### `/play` - Play Hub
Main gamification dashboard featuring:
- Progress rings and XP tracking
- Streak visualization
- Daily quests
- Weekly challenges
- Leaderboards (daily/weekly/monthly/all-time)
- Badge collection
- Referral system
- Real-time visitor count
- Progress charts

### `/journal` - Personal Journal
Enhanced journaling with:
- Mood tracking (great, good, okay, challenging, tough)
- Tag system for organization
- Optional sharing to community
- Private by default with RLS protection

### `/community` - Community Feed
Social features including:
- Post creation and feed
- Real-time reactions (👍🔥💡🎉❤️)
- Comments with threading
- User avatars and profiles
- Live activity indicators

### `/profile` - User Profile
Personal profile page with:
- Profile editing (display name, bio)
- Progress visualization
- Badge showcase
- Friends list
- Activity history

### `/r/[code]` - Referral Landing
Handles referral code application and user onboarding

## Components

### Gamification Components
- **GamificationProvider**: Context provider for XP, streaks, levels
- **ProgressRing**: Animated circular progress indicator
- **StreakFlame**: Visual streak indicator with emoji tiers
- **QuestCard**: Daily quest completion cards
- **Badge**: Badge display component
- **BadgeCollection**: Full badge showcase with unlock animations
- **Confetti**: Celebration confetti (lazy-loaded)
- **Haptics**: Vibration API helper
- **WeeklyChallenges**: Weekly challenge tracker
- **Leaderboard**: Ranked leaderboard with multiple time periods
- **NotificationsCenter**: In-app notification bell
- **ReferralSection**: Referral code management
- **ProgressChart**: XP progress visualization (Recharts)
- **CommunityChallenges**: Group challenge tracking
- **PushNotificationSetup**: Web Push subscription management

### Social Components
- **AvatarStack**: Stacked avatar display for peer activity
- **ReactionBar**: Post reaction buttons with real-time updates
- **CommentSection**: Threaded comments with live updates
- **ShareButton**: Web Share API integration
- **FriendsList**: Friend connections and requests

### Integration Components
- **LiveVisitors**: Real-time visitor count using Supabase Presence

## Database Schema

### Core Tables
- `profiles`: User profiles with XP, level, referral codes
- `journal_entries`: Private journal entries with mood and tags
- `badges`: Badge definitions
- `user_badges`: User badge awards
- `streaks`: Daily streak tracking
- `posts`: Community posts
- `reactions`: Post reactions (emoji)
- `comments`: Threaded comments on posts

### Enhanced Features
- `weekly_challenges`: Weekly challenge definitions
- `user_challenge_progress`: User progress on challenges
- `leaderboard_entries`: Leaderboard rankings by period
- `notifications`: In-app notifications
- `activity_log`: User activity tracking
- `friendships`: Friend connections (pending/accepted/blocked)
- `referrals`: Referral tracking and rewards
- `push_subscriptions`: Web Push subscription storage
- `community_challenges`: Group challenges
- `moderation_actions`: Content moderation log

### Row Level Security (RLS)
All tables have appropriate RLS policies:
- **Private data**: Owner-only CRUD (journal, streaks, badges, notifications)
- **Public data**: Read-all, write-own (posts, comments, reactions)
- **Moderation**: Admin/moderator-only access
- **Social**: User-specific (friendships, referrals)

## Features Implemented

### ✅ Core Gamification
- [x] XP system with leveling
- [x] Streak tracking with visual indicators
- [x] Daily quests with completion rewards
- [x] Progress rings with animations
- [x] Badge system with 10+ badge types
- [x] Confetti celebrations
- [x] Haptic feedback

### ✅ Social & Community
- [x] Avatar stacks for peer activity
- [x] Emoji reactions (real-time)
- [x] Threaded comments
- [x] User profiles
- [x] Web Share API integration
- [x] Real-time live visitor count (Supabase Presence)

### ✅ Challenges & Competition
- [x] Weekly challenges (automatic creation)
- [x] Community challenges (group goals)
- [x] Leaderboards (daily/weekly/monthly/all-time)
- [x] Progress tracking and analytics

### ✅ Social Features
- [x] Friends system (send/accept requests)
- [x] Activity feed
- [x] Share achievements
- [x] Referral system with codes

### ✅ Notifications
- [x] In-app notification center
- [x] Real-time notification updates
- [x] Web Push notification setup
- [x] Streak milestone notifications
- [x] Badge unlock notifications

### ✅ Enhanced Journaling
- [x] Mood tracking
- [x] Tag system
- [x] Optional community sharing
- [x] Privacy controls

### ✅ Analytics & Insights
- [x] Progress charts (Recharts)
- [x] Activity logging
- [x] XP history tracking

## Database Functions & Triggers

### Functions
- `update_leaderboard()`: Automatically updates leaderboard on XP changes
- `check_streak_milestone()`: Awards XP and notifications for streak milestones
- `generate_referral_code()`: Generates unique referral codes
- `create_weekly_challenge()`: Creates weekly challenges automatically

### Triggers
- `update_leaderboard_trigger`: Updates leaderboard when profile XP changes
- `streak_milestone_trigger`: Checks and awards streak milestones

## Real-time Features

All real-time features use Supabase Realtime:
- **Live visitors**: Presence channel for active users
- **Post updates**: Real-time post feed updates
- **Reactions**: Live reaction counts
- **Comments**: Real-time comment updates
- **Notifications**: Instant notification delivery
- **Badge unlocks**: Real-time badge unlock notifications

## Push Notifications

Web Push notifications are supported via:
- Service Worker registration
- VAPID key management
- Subscription storage in database
- Notification center UI

**Note**: Requires `NEXT_PUBLIC_VAPID_PUBLIC_KEY` environment variable

## Performance Optimizations

- Dynamic imports for heavy components (confetti, charts)
- Lazy loading for non-critical features
- Code splitting by route
- Optimized database queries with indexes
- Real-time subscriptions with proper cleanup
- SSR-safe localStorage access

## Accessibility

- WCAG 2.2 AA compliant
- Keyboard navigation support
- Screen reader friendly (ARIA labels)
- Reduced motion support (Framer Motion)
- Focus management
- Semantic HTML

## Security

- Row Level Security (RLS) on all tables
- Owner-only access for private data
- Public read for community content
- Moderation system for content management
- Referral code validation
- Push subscription validation

## Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional:
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (for Web Push)

## Setup Instructions

1. **Run migrations**:
   ```sql
   -- Run in order:
   -- 007_gamify.sql (base schema)
   -- 008_gamify_enhanced.sql (enhanced features)
   -- 009_gamify_seed_data.sql (seed badges and challenges)
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure environment**:
   - Set Supabase keys in `.env.local`
   - Optionally set VAPID key for push notifications

4. **Build and test**:
   ```bash
   pnpm build
   pnpm dev
   ```

5. **Visit pages**:
   - `/play` - Gamification hub
   - `/journal` - Personal journal
   - `/community` - Community feed
   - `/profile` - User profile

## Future Enhancements

Potential additions:
- Email notifications for streak risks (Klaviyo/Zapier integration)
- Advanced moderation tools
- Badge customization
- Custom challenge creation
- Group/team challenges
- Achievement sharing on social media
- XP multipliers and power-ups
- Seasonal events and limited-time challenges

## Notes

- All features are feature-flagged via `config/flags.gamify.json`
- Journal entries are private by default (RLS enforced)
- Community posts are public but can be moderated
- Streak calculations should be handled by a cron job (not included)
- Weekly challenges auto-create via database function
- Leaderboard updates are automatic via triggers
