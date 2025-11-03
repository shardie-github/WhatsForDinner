# Nomad Setup Guide

Complete setup instructions for implementing the remaining 4 steps.

---

## ? Step 1: Database Schema

### Migration File
Location: `/workspace/supabase/migrations/015_nomad_schema.sql`

### Setup Instructions

1. **Connect to Supabase**:
   ```bash
   # Using Supabase CLI
   supabase login
   supabase link --project-ref your-project-ref
   ```

2. **Run Migration**:
   ```bash
   # Apply migration to your Supabase project
   supabase db push
   ```

   OR manually:
   - Go to Supabase Dashboard ? SQL Editor
   - Copy contents of `015_nomad_schema.sql`
   - Paste and run

3. **Verify Tables Created**:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE '%nomad%' 
   OR table_name IN (
     'user_profiles', 'meal_plans', 'recipes', 
     'grocery_lists', 'health_metrics', 'families',
     'family_chat_messages', 'streaks', 'badges'
   );
   ```

4. **Enable Realtime** (in Supabase Dashboard):
   - Go to Database ? Replication
   - Enable replication for:
     - `family_chat_messages`
     - `family_activities`
     - `grocery_list_items`
     - `meal_plans` (if family-based)

---

## ? Step 2: Real-Time Integration

### Files Created
- `/apps/web/src/lib/nomad/realtime.ts` - Real-time hooks
- `/apps/web/src/lib/supabase/server.ts` - Server-side Supabase client

### Implementation

The real-time hooks are ready to use:

```typescript
import { useRealtimeFamilyChat } from '@/lib/nomad/realtime';

// In your component
const { messages, channel } = useRealtimeFamilyChat(familyId);
```

### Enable Realtime in Supabase

1. **Dashboard** ? **Database** ? **Replication**
2. Enable replication for tables:
   - `family_chat_messages` ?
   - `family_activities` ?
   - `grocery_list_items` ?
   - `meal_plans` ?

### Update Hooks

The hooks in `/apps/web/src/hooks/nomad/useNomadData.ts` already include the real-time structure. Update `useRealtimeFamilyChat`:

```typescript
// Replace the placeholder with actual implementation from realtime.ts
import { useRealtimeFamilyChat as useRTFC } from '@/lib/nomad/realtime';

export function useRealtimeFamilyChat(familyId?: string) {
  return useRTFC(familyId);
}
```

---

## ? Step 3: External API Integrations

### Files Created
- `/apps/web/src/lib/nomad/external-apis.ts` - All external API functions
- `/apps/web/src/app/api/nomad/wearables/google-fit/callback/route.ts` - OAuth callback

### Setup Instructions

#### A. Nutrition APIs

**Edamam**:
1. Sign up at https://developer.edamam.com/
2. Get App ID and API Key
3. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_EDAMAM_APP_ID=your_app_id
   NEXT_PUBLIC_EDAMAM_API_KEY=your_api_key
   ```

**Nutritionix**:
1. Sign up at https://www.nutritionix.com/business/api
2. Get App ID and API Key
3. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_NUTRITIONIX_APP_ID=your_app_id
   NEXT_PUBLIC_NUTRITIONIX_API_KEY=your_api_key
   ```

**Open Food Facts**: No API key needed (free, already implemented)

#### B. Wearables - Google Fit

1. **Create Google Cloud Project**:
   - Go to https://console.cloud.google.com/
   - Create new project

2. **Enable Google Fit API**:
   - APIs & Services ? Enable APIs
   - Search "Google Fitness API" ? Enable

3. **Create OAuth Credentials**:
   - APIs & Services ? Credentials
   - Create OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs: `https://yourdomain.com/api/nomad/wearables/google-fit/callback`

4. **Add to `.env.local`**:
   ```env
   NEXT_PUBLIC_GOOGLE_FIT_CLIENT_ID=your_client_id
   GOOGLE_FIT_CLIENT_SECRET=your_client_secret
   ```

5. **Update Callback Route**:
   - Update redirect URI in `/apps/web/src/lib/nomad/external-apis.ts`:
     ```typescript
     const redirectUri = `${window.location.origin}/api/nomad/wearables/google-fit/callback`;
     ```

#### C. Apple Health

Requires native iOS app. Will be implemented in React Native/Expo app.

#### D. Update API Routes

Update `/apps/web/src/app/api/nomad/nutrition/route.ts`:

```typescript
import { getNutritionData } from '@/lib/nomad/external-apis';

// Replace mock data with:
const nutritionData = await getNutritionData(query, barcode);
return NextResponse.json(nutritionData);
```

---

## ? Step 4: Ad Network Integration

### Files Created
- `/apps/web/src/components/nomad/AdMobIntegration.tsx` - AdMob component
- `/apps/web/src/lib/nomad/external-apis.ts` - AdMob functions

### Setup Instructions

#### A. Google AdMob (Mobile Apps)

For React Native/Expo apps:

1. **Create AdMob Account**:
   - Go to https://admob.google.com/
   - Create account and app

2. **Get App ID and Ad Unit IDs**:
   - App ID: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`
   - Banner Ad Unit ID: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`
   - Interstitial Ad Unit ID: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`

3. **Install SDK** (in mobile app):
   ```bash
   npm install react-native-google-mobile-ads
   ```

4. **Add to `.env.local`**:
   ```env
   NEXT_PUBLIC_ADMOB_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
   NEXT_PUBLIC_ADMOB_BANNER_UNIT_ID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
   NEXT_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
   ```

#### B. Google AdSense (Web)

For web app:

1. **Create AdSense Account**:
   - Go to https://www.google.com/adsense/
   - Sign up and get approved

2. **Get Ad Unit ID**:
   - Create ad unit in AdSense dashboard

3. **Update Component**:
   ```typescript
   // In AdMobIntegration.tsx, add AdSense support:
   if (type === 'banner' && typeof window !== 'undefined') {
     const script = document.createElement('script');
     script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adUnitId}`;
     script.async = true;
     script.crossOrigin = 'anonymous';
     document.head.appendChild(script);
   }
   ```

#### C. Update AdPlacement Component

Update `/apps/web/src/components/nomad/AdPlacement.tsx`:

```typescript
import { AdMobIntegration } from './AdMobIntegration';

// Replace mock ad with:
{type === 'banner' && (
  <AdMobIntegration
    adUnitId={process.env.NEXT_PUBLIC_ADMOB_BANNER_UNIT_ID || ''}
    type="banner"
    className="w-full"
  />
)}
```

---

## ?? Environment Variables Template

Create `.env.local` in `/apps/web/`:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Nutrition APIs (Optional)
NEXT_PUBLIC_EDAMAM_APP_ID=your_edamam_app_id
NEXT_PUBLIC_EDAMAM_API_KEY=your_edamam_api_key
NEXT_PUBLIC_NUTRITIONIX_APP_ID=your_nutritionix_app_id
NEXT_PUBLIC_NUTRITIONIX_API_KEY=your_nutritionix_api_key

# Wearables (Optional)
NEXT_PUBLIC_GOOGLE_FIT_CLIENT_ID=your_google_fit_client_id
GOOGLE_FIT_CLIENT_SECRET=your_google_fit_client_secret

# Ads (Optional)
NEXT_PUBLIC_ADMOB_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
NEXT_PUBLIC_ADMOB_BANNER_UNIT_ID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
NEXT_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID=ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
```

---

## ? Verification Checklist

### Database
- [ ] Migration applied successfully
- [ ] All tables created
- [ ] RLS policies enabled
- [ ] Realtime enabled for chat/activities

### Real-time
- [ ] Realtime hooks imported correctly
- [ ] Channels connecting in browser console
- [ ] Messages appearing in real-time

### External APIs
- [ ] Nutrition APIs returning data
- [ ] Google Fit OAuth flow working
- [ ] Barcode scanning working

### Ads
- [ ] AdMob/AdSense displaying (or fallback)
- [ ] Ad clicks tracking
- [ ] No errors in console

---

## ?? Testing

### Test Database
```sql
-- Test user profile creation
INSERT INTO user_profiles (id, name) 
VALUES (gen_random_uuid(), 'Test User');

-- Test meal plan
INSERT INTO meal_plans (user_id, date, meal_type, recipe_name)
VALUES ('user-uuid', CURRENT_DATE, 'breakfast', 'Test Meal');
```

### Test Real-time
1. Open two browser windows
2. Send message in one
3. Verify it appears in the other

### Test APIs
```typescript
// Test nutrition lookup
const data = await getNutritionData('chicken breast');
console.log(data);

// Test barcode
const barcode = await getNutritionFromBarcode('3017620422003');
console.log(barcode);
```

---

## ?? Next Steps

1. **Authentication**: Set up Supabase Auth flows
2. **Image Uploads**: Configure Supabase Storage for recipe images
3. **Push Notifications**: Set up Capacitor/local notifications
4. **Analytics**: Integrate PostHog/Mixpanel
5. **Error Tracking**: Configure Sentry
6. **Testing**: Write unit/integration tests

---

## ?? Troubleshooting

### Migration Fails
- Check Supabase connection
- Verify user has permissions
- Check for existing tables

### Real-time Not Working
- Verify Realtime enabled in Supabase Dashboard
- Check RLS policies allow read
- Verify channel name matches

### API Errors
- Check API keys in `.env.local`
- Verify API quotas not exceeded
- Check network requests in browser DevTools

### Ads Not Showing
- Verify AdMob/AdSense account approved
- Check ad unit IDs correct
- Ensure fallback house ads working

---

## ?? Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Edamam API](https://developer.edamam.com/edamam-docs-nutrition-api)
- [Google Fit API](https://developers.google.com/fit/rest)
- [AdMob Docs](https://admob.google.com/home/resources/)
