# Nomad UX Journey Maps

## Overview
This document outlines the complete user experience journey for Nomad across three user roles and three product tiers.

---

## 1. Onboarding ? Personalization Journey

```mermaid
graph TD
    A[Landing Page] --> B{User Type?}
    B -->|New User| C[Welcome Screen]
    B -->|Returning| D[Login/Social Auth]
    
    C --> E[Account Creation]
    E --> F[Social Login Options]
    F --> G[Email/Password Setup]
    
    D --> H[Authentication]
    H --> I[Onboarding Wizard]
    G --> I
    
    I --> J[Dietary Preferences]
    J --> K[Allergens Selection]
    K --> L[Health Goals Setup]
    L --> M[Household Members]
    M --> N[Theme Selection]
    N --> O[Notification Setup]
    O --> P{Subscription?}
    
    P -->|Free| Q[Free Edition Onboarding]
    P -->|Premium| R[Premium Setup]
    P -->|Partner| S[Partner Branding Setup]
    
    Q --> T[Dashboard - Free]
    R --> U[Dashboard - Premium]
    S --> V[Dashboard - Partner]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style T fill:#9f9,stroke:#333,stroke-width:2px
    style U fill:#99f,stroke:#333,stroke-width:2px
    style V fill:#ff9,stroke:#333,stroke-width:2px
```

### Emotional Touchpoints

| Stage | Emotion | Functional Goal | UI Element |
|-------|---------|----------------|------------|
| Landing | Curiosity | Capture interest | Hero video, value prop |
| Welcome | Warmth | Build trust | Personalized greeting |
| Preferences | Empowerment | Enable customization | Interactive selectors |
| Goals | Motivation | Set clear objectives | Progress visualization |
| Dashboard | Achievement | Show immediate value | Success animation |

---

## 2. Daily Dashboard Flow

```mermaid
graph LR
    A[Dashboard Load] --> B[Widget Render]
    B --> C{User Tier?}
    
    C -->|Free| D[Core Widgets + Ads]
    C -->|Premium| E[Enhanced Widgets]
    C -->|Partner| F[Co-branded Widgets]
    
    D --> G[Quick Actions]
    E --> G
    F --> G
    
    G --> H{Action Type?}
    
    H -->|Add Meal| I[Meal Planner]
    H -->|Scan| J[Barcode Scanner]
    H -->|Message| K[Family Chat]
    H -->|Share| L[Recipe Share]
    H -->|Health| M[Health Tracker]
    H -->|Grocery| N[Grocery List]
    
    I --> O[Save Meal Plan]
    J --> P[Add to Pantry]
    K --> Q[Send Message]
    L --> R[Generate Share Card]
    M --> S[Log Metrics]
    N --> T[Update List]
    
    O --> U[Update Dashboard]
    P --> U
    Q --> U
    R --> U
    S --> U
    T --> U
    
    style A fill:#bbf,stroke:#333,stroke-width:2px
    style U fill:#bfb,stroke:#333,stroke-width:2px
```

### Dashboard Widget Priority

1. **Meal Plan Card** - Today's meals with quick edit
2. **Health Metrics** - Calories, water, steps (if wearables connected)
3. **Grocery List** - Auto-populated from meal plan
4. **Recipe Spotlight** - AI-recommended recipe
5. **Family Feed** - Recent family activity
6. **Streaks & Badges** - Gamification widget
7. **Ad Placement** (Free) - Contextual ad every 5th widget

---

## 3. Engagement Loop

```mermaid
graph TD
    A[User Opens App] --> B[Check Streaks]
    B --> C{Streak Active?}
    
    C -->|Yes| D[Show Streak Badge]
    C -->|No| E[Show Motivation Message]
    
    D --> F[Log Activity]
    E --> F
    
    F --> G{Activity Type?}
    
    G -->|Meal Logged| H[Update Meal Streak]
    G -->|Water Logged| I[Update Hydration Goal]
    G -->|Recipe Tried| J[Award Badge]
    G -->|Family Message| K[Update Social Score]
    
    H --> L[Check Achievements]
    I --> L
    J --> L
    K --> L
    
    L --> M{New Achievement?}
    
    M -->|Yes| N[Show Celebration]
    M -->|No| O[Update Progress Bars]
    
    N --> P[Push Notification]
    O --> Q[Save State]
    P --> Q
    
    Q --> R{Time-based Trigger?}
    
    R -->|Water Reminder| S[Send Notification]
    R -->|Meal Reminder| T[Send Notification]
    R -->|Family Check-in| U[Send Notification]
    R -->|Weekly Digest| V[Send Email]
    
    style A fill:#fbb,stroke:#333,stroke-width:2px
    style N fill:#bfb,stroke:#333,stroke-width:2px
```

---

## 4. Retention & Growth Flow

```mermaid
graph TD
    A[Weekly Review] --> B[Generate Progress Report]
    B --> C[Shareable Card Created]
    C --> D{User Tier?}
    
    D -->|Free| E[Show Premium CTA]
    D -->|Premium| F[Show Referral Prompt]
    D -->|Partner| G[Show Brand Co-marketing]
    
    E --> H{Interested?}
    F --> I{Want to Refer?}
    G --> J[Partner Benefits Shown]
    
    H -->|Yes| K[Premium Onboarding]
    H -->|No| L[Continue Free]
    
    I -->|Yes| M[Referral Link Generated]
    I -->|No| N[Continue Premium]
    
    K --> O[Unlock Features]
    M --> P[Track Referrals]
    
    L --> Q[Continue with Ads]
    N --> R[Continue Premium]
    O --> S[Enhanced Experience]
    P --> T[Discount Applied]
    J --> U[Co-branded Experience]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style S fill:#9f9,stroke:#333,stroke-width:2px
    style T fill:#99f,stroke:#333,stroke-width:2px
```

---

## 5. Role-Based Views

### Solo User Journey

```mermaid
graph LR
    A[Solo Onboarding] --> B[Personal Goals]
    B --> C[Individual Dashboard]
    C --> D[Meal Planning]
    C --> E[Health Tracking]
    C --> F[Recipe Discovery]
    
    D --> G[Weekly Plan]
    E --> H[Metrics Dashboard]
    F --> I[Personalized Feed]
    
    style A fill:#bbf,stroke:#333,stroke-width:2px
```

**Key Features:**
- Personalized meal recommendations
- Individual health goals
- Private recipe collection
- Solo streak tracking

---

### Family Planner Journey

```mermaid
graph LR
    A[Family Onboarding] --> B[Add Household Members]
    B --> C[Set Family Preferences]
    C --> D[Shared Dashboard]
    
    D --> E[Family Meal Plan]
    D --> F[Shared Grocery List]
    D --> G[Family Chat]
    D --> H[Health Sync]
    
    E --> I[Assign Meals]
    F --> J[Real-time Updates]
    G --> K[Notifications]
    H --> L[Group Progress]
    
    style A fill:#fbb,stroke:#333,stroke-width:2px
```

**Key Features:**
- Multi-user meal planning
- Shared grocery lists
- Family chat & notifications
- Coordinated health goals
- Family streak challenges

---

### Partner Brand Journey

```mermaid
graph LR
    A[Partner OAuth] --> B[Co-branding Setup]
    B --> C[API Integration]
    C --> D[Custom Dashboard]
    
    D --> E[Branded Widgets]
    D --> F[Partner Products]
    D --> G[Affiliate Links]
    
    E --> H[Custom Theme]
    F --> I[Sponsored Recipes]
    G --> J[Revenue Tracking]
    
    style A fill:#ff9,stroke:#333,stroke-width:2px
```

**Key Features:**
- Custom branding & themes
- API data partnerships
- Co-marketing opportunities
- Affiliate revenue sharing
- White-label options

---

## 6. Key Emotional Moments

### ?? High-Impact Touchpoints

1. **First Successful Meal Plan**
   - Emotion: Achievement
   - Visual: Confetti animation
   - Action: Badge unlock

2. **Streak Milestone (7, 30, 100 days)**
   - Emotion: Pride
   - Visual: Fire animation
   - Action: Share prompt

3. **Family Member Joins**
   - Emotion: Connection
   - Visual: Heart animation
   - Action: Welcome message

4. **Recipe Success Story**
   - Emotion: Satisfaction
   - Visual: Star rating animation
   - Action: Save to favorites

5. **Premium Upgrade**
   - Emotion: Excitement
   - Visual: Feature unlock animation
   - Action: Tour of new features

---

## 7. Notification Strategy

### Push Notification Timing

| Trigger | Timing | Message Type | Tier |
|---------|--------|-------------|------|
| Water Reminder | Every 2 hours (9am-9pm) | Hydration | All |
| Meal Reminder | 30min before scheduled meal | Meal Planning | All |
| Streak Warning | 6pm if no activity | Engagement | All |
| Family Message | Real-time | Communication | All |
| Weekly Digest | Sunday 9am | Progress Report | All |
| Premium Trial | After 7 days active | Conversion | Free |
| Partner Deal | Contextual | Marketing | Partner |

---

## 8. Accessibility Considerations

- **Screen Reader Support**: All interactive elements labeled
- **Keyboard Navigation**: Full keyboard support for all flows
- **Color Contrast**: WCAG AAA compliant
- **Font Scaling**: Supports up to 200% text scaling
- **Motion Reduction**: Respects `prefers-reduced-motion`
- **Voice Input**: Available for all text inputs
- **High Contrast Mode**: Dedicated theme option

---

## Next Steps

1. Implement journey map components
2. Build onboarding wizard
3. Create dashboard widget system
4. Design gamification system
5. Implement notification service
