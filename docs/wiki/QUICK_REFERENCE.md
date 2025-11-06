# Wiki System Quick Reference

Quick reference guide for the What's for Dinner wiki and AI chat bot system.

---

## 🗂️ File Structure

```
/workspace/
├── docs/wiki/                    # Wiki content (markdown)
│   ├── README.md                 # Main wiki index
│   ├── getting-started/         # Getting started guides
│   ├── meal-planning/           # Meal planning guides
│   ├── pantry/                   # Pantry management
│   ├── recipes/                  # Recipe guides
│   ├── grocery-lists/            # Shopping lists
│   ├── integrations/             # Store integrations
│   ├── nutrition/                # Nutrition tracking
│   ├── community/                # Community features
│   ├── account/                  # Account settings
│   ├── advanced/                 # Advanced features
│   ├── troubleshooting/          # Help & support
│   ├── faqs/                     # FAQs
│   ├── AUTO_UPDATE_GUIDE.md      # Auto-update guide
│   ├── IMPLEMENTATION_GUIDE.md    # Full setup guide
│   └── QUICK_REFERENCE.md         # This file
│
├── supabase/migrations/
│   └── 999_create_knowledge_base.sql  # Database schema
│
├── apps/web/src/
│   ├── app/
│   │   ├── wiki/
│   │   │   └── page.tsx          # Main wiki page
│   │   ├── admin/wiki/
│   │   │   └── page.tsx          # Admin interface
│   │   └── api/
│   │       ├── chat/
│   │       │   └── route.ts      # Chat bot API
│   │       └── admin/wiki/
│   │           └── sync-markdown/
│   │               └── route.ts  # Markdown sync API
│   └── components/wiki/
│       └── ChatBot.tsx           # Chat bot component
│
└── apps/web/src/lib/wiki/
    └── auto-update.ts            # Auto-update system
```

---

## 🔑 Key Components

### 1. Database Tables

- `knowledge_base_articles` - Wiki articles
- `knowledge_base_categories` - Article categories
- `chat_conversations` - Chat conversations
- `chat_messages` - Chat messages
- `article_feedback` - User feedback
- `article_views` - View tracking
- `search_queries` - Search analytics
- `knowledge_base_updates` - Update logs

### 2. Routes

- `/wiki` - Main wiki page
- `/wiki/article/[slug]` - Article view
- `/wiki/category/[slug]` - Category listing
- `/admin/wiki` - Admin interface
- `/api/chat` - Chat bot API
- `/api/admin/wiki/sync-markdown` - Sync API

### 3. Components

- `WikiPage` - Main wiki viewer
- `ChatBot` - AI chat assistant
- `WikiAdmin` - Admin interface

---

## 🚀 Quick Start

### 1. Setup Database

```bash
supabase migration up 999_create_knowledge_base
```

### 2. Sync Content

```bash
# Via admin interface
curl -X POST http://localhost:3000/api/admin/wiki/sync-markdown

# Or use admin UI: /admin/wiki → "Sync Markdown Files"
```

### 3. Add Chat Bot

```tsx
import ChatBot from '@/components/wiki/ChatBot';

// In your layout
<ChatBot isOpen={showChat} onClose={() => setShowChat(false)} />
```

---

## 📝 Common Tasks

### Create Article

**Via Admin:**
1. Go to `/admin/wiki`
2. Click "New Article"
3. Fill in details
4. Save as draft or publish

**Via Markdown:**
1. Create `.md` file in `/docs/wiki/`
2. Run sync: `/api/admin/wiki/sync-markdown`
3. Review and publish

### Update Article

**Via Admin:**
1. Go to `/admin/wiki`
2. Click edit icon
3. Update content
4. Save

**Via Markdown:**
1. Edit `.md` file
2. Run sync
3. Article auto-updates

### Auto-Generate from Feature

```typescript
import { wikiAutoUpdate } from '@/lib/wiki/auto-update';

await wikiAutoUpdate.generateFromFeature({
  featureName: 'Feature Name',
  category: 'features',
  tags: ['tag1', 'tag2'],
  content: '...'
});
```

---

## 🔍 Search & Navigation

### Search Articles

```sql
-- Full-text search
SELECT * FROM knowledge_base_articles
WHERE search_vector @@ to_tsquery('english', 'meal planning')
AND status = 'published';
```

### Semantic Search (with embeddings)

```sql
-- Vector similarity search
SELECT * FROM knowledge_base_articles
WHERE embedding <-> $1::vector < 0.8
ORDER BY embedding <-> $1::vector
LIMIT 5;
```

---

## 🤖 Chat Bot

### Chat Flow

1. User sends message
2. Search knowledge base
3. Generate answer from articles
4. Return answer with sources
5. Log for learning

### API Usage

```typescript
POST /api/chat
{
  "message": "How do I plan meals?",
  "conversation_id": "uuid",
  "context": "wiki"
}

Response:
{
  "response": "Answer text...",
  "article_ids": ["uuid1", "uuid2"],
  "sources": [
    { "title": "Article Title", "slug": "article-slug" }
  ]
}
```

---

## 📊 Analytics

### Track Views

```typescript
// Automatically tracked when user clicks article
await supabase.from('article_views').insert({
  article_id: articleId,
  session_id: sessionId
});
```

### Track Searches

```typescript
await supabase.from('search_queries').insert({
  query: searchQuery,
  session_id: sessionId
});
```

### Get Popular Articles

```sql
SELECT * FROM knowledge_base_articles
WHERE status = 'published'
ORDER BY view_count DESC
LIMIT 10;
```

---

## 🔄 Auto-Update

### Feature Release

```typescript
// When releasing feature
await wikiAutoUpdate.generateFromFeature({
  featureName: 'New Feature',
  category: 'features',
  content: '...'
});
```

### Markdown Sync

```typescript
await wikiAutoUpdate.syncFromMarkdown(
  '/docs/wiki/meal-planning/README.md',
  markdownContent,
  { category: 'meal-planning' }
);
```

### Generate Embeddings

```typescript
await wikiAutoUpdate.generateEmbedding(articleId);
```

---

## 🎨 Styling

### Categories

Default categories:
- Getting Started
- Meal Planning
- Pantry Management
- Recipes
- Grocery Lists
- Shopping & Integrations
- Nutrition & Health
- Community Features
- Account & Settings
- Advanced Features
- Troubleshooting
- FAQs

### Article Status

- `draft` - Not published
- `published` - Live and searchable
- `archived` - Hidden from search

---

## 🛠️ Admin Tasks

### Review Drafts

1. Go to `/admin/wiki`
2. Filter by "Drafts"
3. Review articles
4. Click checkmark to publish

### Sync Markdown

1. Go to `/admin/wiki`
2. Click "Sync Markdown Files"
3. Wait for sync to complete
4. Review new/updated articles

### Delete Article

1. Go to `/admin/wiki`
2. Find article
3. Click trash icon
4. Confirm deletion

---

## 📱 User Experience

### Wiki Page

- Search bar at top
- Category grid
- Popular articles
- Quick action cards

### Article Page

- Article content
- Related articles
- Feedback buttons
- Share options

### Chat Bot

- Floating button (bottom-right)
- Chat interface
- Message history
- Source links
- Feedback buttons

---

## 🔐 Permissions

### Public Access

- Read published articles
- Search articles
- Use chat bot
- Provide feedback

### Admin Access

- Create/edit articles
- Publish articles
- Delete articles
- Sync markdown
- View analytics

---

## 🆘 Troubleshooting

### Articles Not Showing

```sql
-- Check status
SELECT id, title, status FROM knowledge_base_articles
WHERE slug = 'article-slug';

-- Fix if needed
UPDATE knowledge_base_articles
SET status = 'published'
WHERE id = 'article-id';
```

### Search Not Working

```sql
-- Regenerate search vector
UPDATE knowledge_base_articles
SET search_vector = 
  setweight(to_tsvector('english', title), 'A') ||
  setweight(to_tsvector('english', excerpt), 'B') ||
  setweight(to_tsvector('english', content), 'C');
```

### Chat Bot Not Responding

1. Check OpenAI API key
2. Verify API endpoint works
3. Check article exists
4. Review API logs

---

## 📚 Documentation

- **Main Guide:** `/docs/wiki/README.md`
- **Implementation:** `/docs/wiki/IMPLEMENTATION_GUIDE.md`
- **Auto-Update:** `/docs/wiki/AUTO_UPDATE_GUIDE.md`
- **Database Schema:** `/supabase/migrations/999_create_knowledge_base.sql`

---

## 🎯 Best Practices

1. **Content**
   - Clear and concise
   - Include screenshots
   - Regular updates
   - Good keywords

2. **Search**
   - Generate embeddings
   - Use good tags
   - Write clear titles
   - Add excerpts

3. **Chat Bot**
   - Monitor unanswered questions
   - Create articles for common questions
   - Improve based on feedback

4. **Analytics**
   - Review popular articles
   - Track search queries
   - Monitor chat interactions
   - Update based on data

---

**For detailed information, see the full [Implementation Guide](./IMPLEMENTATION_GUIDE.md)**
