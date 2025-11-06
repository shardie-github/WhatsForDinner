# Wiki Implementation Guide
## Complete Setup for User Platform Wiki & AI Chat Bot

This guide walks you through implementing the complete wiki and AI chat bot system for What's for Dinner.

---

## 📋 Overview

The wiki system includes:

1. **Knowledge Base Database** - Supabase schema for articles, categories, chat
2. **Wiki Viewer** - User-facing wiki interface with search
3. **AI Chat Bot** - Integrated chat assistant powered by knowledge base
4. **Auto-Update System** - Automatic content sync from features and markdown
5. **Admin Interface** - Content management for wiki articles

---

## 🗄️ Step 1: Database Setup

### Run Migration

```bash
# Apply knowledge base migration
supabase migration up 999_create_knowledge_base
```

This creates:
- `knowledge_base_articles` - Wiki articles
- `knowledge_base_categories` - Article categories
- `chat_conversations` - Chat bot conversations
- `chat_messages` - Chat messages
- `article_feedback` - User feedback
- `article_views` - View tracking
- `search_queries` - Search analytics
- `knowledge_base_updates` - Update logs

### Verify Setup

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'knowledge_base%';

-- Check categories were created
SELECT * FROM knowledge_base_categories;
```

---

## 📝 Step 2: Initial Content

### Option A: Sync Markdown Files

1. **Create Wiki Content**

   Wiki content is stored in `/docs/wiki/` as markdown files:
   ```
   docs/wiki/
     ├── README.md
     ├── getting-started/README.md
     ├── meal-planning/README.md
     ├── pantry/README.md
     └── ...
   ```

2. **Sync to Database**

   Run the sync API endpoint (as admin):
   ```bash
   curl -X POST http://localhost:3000/api/admin/wiki/sync-markdown
   ```

   Or use the admin interface:
   - Go to `/admin/wiki`
   - Click "Sync Markdown Files"

### Option B: Manual Entry

Use the admin interface to create articles:
- Go to `/admin/wiki`
- Click "New Article"
- Fill in title, content, category
- Save as draft or publish

---

## 🎨 Step 3: Wiki Viewer Setup

### Routes

The wiki viewer is already set up at:
- `/wiki` - Main wiki page with search and categories
- `/wiki/article/[slug]` - Individual article view
- `/wiki/category/[slug]` - Category listing

### Components

Key components:
- `apps/web/src/app/wiki/page.tsx` - Main wiki page
- `apps/web/src/components/wiki/ChatBot.tsx` - Chat bot component

### Integration

Add wiki link to navigation:
```tsx
<Link href="/wiki">Help & Wiki</Link>
```

---

## 🤖 Step 4: AI Chat Bot Setup

### API Endpoint

The chat API is at `/api/chat/route.ts`:

```typescript
POST /api/chat
{
  "message": "How do I plan meals?",
  "conversation_id": "uuid",
  "context": "wiki"
}
```

### OpenAI Configuration

Set up OpenAI API key:

```bash
# .env.local
OPENAI_API_KEY=your_key_here
```

### Embeddings

Generate embeddings for semantic search:

```typescript
import { wikiAutoUpdate } from '@/lib/wiki/auto-update';

// After creating/updating article
await wikiAutoUpdate.generateEmbedding(articleId);
```

---

## 🔄 Step 5: Auto-Update System

### Feature Release Hook

When releasing a new feature, auto-generate documentation:

```typescript
import { wikiAutoUpdate } from '@/lib/wiki/auto-update';

export async function onFeatureRelease(feature: Feature) {
  await wikiAutoUpdate.generateFromFeature({
    featureName: feature.name,
    featureDescription: feature.description,
    category: feature.category,
    tags: feature.tags,
    content: feature.documentation,
    screenshots: feature.screenshots
  });
}
```

### Markdown Sync

Set up periodic sync (optional):

```typescript
// In a scheduled job or API endpoint
import { wikiAutoUpdate } from '@/lib/wiki/auto-update';
import fs from 'fs';
import path from 'path';

async function syncAllMarkdown() {
  const wikiDir = path.join(process.cwd(), 'docs/wiki');
  // ... sync all markdown files
}
```

---

## 👨‍💼 Step 6: Admin Interface

### Access

Admin interface at `/admin/wiki`:
- View all articles
- Review drafts
- Publish articles
- Delete articles
- Sync markdown files

### Permissions

Ensure admin role check:
```sql
-- Grant admin role
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'user-uuid';
```

---

## 🎯 Step 7: Chat Bot Integration

### Add to Layout

Add chat bot to your main layout:

```tsx
// apps/web/src/app/layout.tsx
import ChatBot from '@/components/wiki/ChatBot';

export default function Layout({ children }) {
  const [showChat, setShowChat] = useState(false);
  
  return (
    <>
      {children}
      <ChatBot isOpen={showChat} onClose={() => setShowChat(false)} />
      <button onClick={() => setShowChat(true)}>
        <MessageCircle />
      </button>
    </>
  );
}
```

### Floating Button

Add floating chat button (bottom-right):
```tsx
<button
  className="fixed bottom-4 right-4 z-50 bg-primary text-white rounded-full p-4 shadow-lg"
  onClick={() => setShowChat(true)}
>
  <MessageCircle className="w-6 h-6" />
</button>
```

---

## 📊 Step 8: Analytics & Monitoring

### Track Views

Views are automatically tracked when users click articles.

### Search Analytics

Search queries are logged in `search_queries` table.

### Chat Analytics

Chat interactions tracked in:
- `chat_conversations` - Conversation metadata
- `chat_messages` - Individual messages
- Feedback via `helpful` field

### Monitor Updates

```sql
-- Recent updates
SELECT * FROM knowledge_base_updates 
ORDER BY created_at DESC 
LIMIT 20;
```

---

## ✅ Testing Checklist

### Database
- [ ] Migration runs successfully
- [ ] Categories created
- [ ] RLS policies work
- [ ] Search vector updates automatically

### Wiki Viewer
- [ ] Main page loads
- [ ] Search works
- [ ] Categories display
- [ ] Articles load
- [ ] Views tracked

### Chat Bot
- [ ] Chat opens
- [ ] Messages send
- [ ] AI responds
- [ ] Sources linked
- [ ] Feedback works

### Admin
- [ ] Admin access works
- [ ] Articles can be created
- [ ] Drafts can be published
- [ ] Markdown sync works
- [ ] Articles can be deleted

### Auto-Update
- [ ] Feature release creates article
- [ ] Markdown sync works
- [ ] Embeddings generated
- [ ] Updates logged

---

## 🚀 Deployment

### Environment Variables

```bash
# Production .env
OPENAI_API_KEY=your_production_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Build

```bash
pnpm build
```

### Deploy

Deploy to Vercel or your platform:
- Wiki routes work automatically
- API routes work automatically
- Chat bot needs OpenAI API key

---

## 🔧 Troubleshooting

### Articles Not Showing

1. Check article status is 'published'
2. Verify RLS policies
3. Check database connection

### Chat Bot Not Responding

1. Verify OpenAI API key
2. Check API endpoint logs
3. Verify articles exist in database

### Search Not Working

1. Check search_vector is generated
2. Verify textSearch index exists
3. Regenerate search vectors if needed

### Embeddings Not Generated

1. Check OpenAI API key
2. Verify embedding model access
3. Check API rate limits

---

## 📚 Next Steps

1. **Add More Content**
   - Create articles for all features
   - Add screenshots and videos
   - Write tutorials

2. **Improve Search**
   - Generate embeddings for all articles
   - Tune search queries
   - Add synonyms

3. **Enhance Chat Bot**
   - Train on more data
   - Improve answer quality
   - Add more context

4. **Monitor & Improve**
   - Review search analytics
   - Update based on feedback
   - Expand knowledge base

---

## 🆘 Support

- **Wiki Documentation:** `/docs/wiki/`
- **Database Schema:** `/supabase/migrations/999_create_knowledge_base.sql`
- **Auto-Update Guide:** `/docs/wiki/AUTO_UPDATE_GUIDE.md`
- **Contact:** support@whatsfordinner.com

---

**The wiki system is now ready to use!** Users can search articles, ask the chat bot, and get help 24/7. Content automatically updates as features are added.
