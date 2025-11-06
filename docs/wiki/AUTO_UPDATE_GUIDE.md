# Wiki Auto-Update System Guide

This guide explains how the wiki automatically updates as features are added and content evolves.

---

## 🔄 How Auto-Updates Work

The wiki knowledge base automatically updates in several scenarios:

### 1. Feature Releases

When a new feature is released, the system can auto-generate documentation:

```typescript
import { wikiAutoUpdate } from '@/lib/wiki/auto-update';

// When releasing a new feature
await wikiAutoUpdate.generateFromFeature({
  featureName: 'Shared Tables',
  featureDescription: 'Collaborative meal planning for families',
  category: 'community',
  tags: ['collaboration', 'family', 'meal-planning'],
  content: markdownContent,
  screenshots: ['screenshot1.png', 'screenshot2.png']
});
```

### 2. Chat Bot Learning

When the chat bot answers a question that isn't in the knowledge base:

1. Chat bot provides answer
2. System logs the interaction
3. Suggests creating an article (human review)
4. After approval, article is created

### 3. Markdown Sync

Sync markdown files from `/docs/wiki/` to the knowledge base:

```typescript
// Sync a markdown file
await wikiAutoUpdate.syncFromMarkdown(
  '/docs/wiki/meal-planning/README.md',
  markdownContent,
  {
    category: 'meal-planning',
    tags: ['planning', 'tutorial']
  }
);
```

### 4. User Contributions

Users can contribute content through:
- Chat bot feedback
- Support tickets
- Feature requests
- Tutorial submissions

---

## 📝 Content Structure

### Markdown Files

Wiki content is stored in `/docs/wiki/` as markdown files:

```
docs/wiki/
  ├── README.md (index)
  ├── getting-started/
  │   └── README.md
  ├── meal-planning/
  │   └── README.md
  └── ...
```

### Frontmatter (Optional)

Articles can include frontmatter:

```markdown
---
title: Creating Meal Plans
category: meal-planning
tags: [planning, tutorial, ai]
excerpt: Learn how to create meal plans with AI
status: published
---

# Creating Meal Plans
...
```

---

## 🤖 AI Integration

### Chat Bot Knowledge Base

The chat bot uses the same knowledge base:

1. **Search:** User asks question
2. **Find Articles:** Search knowledge base
3. **Generate Answer:** AI generates answer from articles
4. **Learn:** If no articles found, log for review

### Embeddings

Articles are automatically embedded for semantic search:

```typescript
// Generate embedding after article creation
await wikiAutoUpdate.generateEmbedding(articleId);
```

---

## 🔧 Setup

### 1. Database Migration

Run the knowledge base migration:

```bash
supabase migration up 999_create_knowledge_base
```

### 2. Initial Content

Sync existing markdown files:

```typescript
// Script to sync all markdown files
import { wikiAutoUpdate } from './lib/wiki/auto-update';
import fs from 'fs';
import path from 'path';

async function syncAllMarkdown() {
  const wikiDir = path.join(process.cwd(), 'docs/wiki');
  const files = fs.readdirSync(wikiDir, { recursive: true });
  
  for (const file of files) {
    if (file.endsWith('.md')) {
      const content = fs.readFileSync(path.join(wikiDir, file), 'utf-8');
      await wikiAutoUpdate.syncFromMarkdown(file, content, {});
    }
  }
}
```

### 3. Auto-Update Hooks

Set up hooks for automatic updates:

**Feature Release Hook:**
```typescript
// In feature release script
export async function onFeatureRelease(feature: Feature) {
  await wikiAutoUpdate.generateFromFeature({
    featureName: feature.name,
    featureDescription: feature.description,
    category: feature.category,
    tags: feature.tags,
    content: feature.documentation
  });
}
```

**Chat Learning Hook:**
```typescript
// In chat API route
export async function onChatResponse(query: string, response: string, articleIds: string[]) {
  await wikiAutoUpdate.learnFromChat(query, response, articleIds);
}
```

---

## 📊 Monitoring

### Update Logs

All updates are logged in `knowledge_base_updates`:

```sql
SELECT 
  update_type,
  source,
  changes,
  created_at
FROM knowledge_base_updates
ORDER BY created_at DESC
LIMIT 20;
```

### Analytics

Track what content is being accessed:

- Article views
- Search queries
- Chat interactions
- Feedback ratings

---

## 🎯 Best Practices

### 1. Content Quality

- **Clear & Concise:** Easy to understand
- **Visual:** Include screenshots/videos
- **Up-to-Date:** Regular reviews
- **Searchable:** Good keywords

### 2. Auto-Generation

- **Draft First:** Auto-generated articles start as drafts
- **Human Review:** Always review before publishing
- **Iterative:** Update based on feedback

### 3. Chat Bot Learning

- **Monitor Logs:** Review unanswered questions
- **Create Articles:** Turn common questions into articles
- **Improve Answers:** Update based on feedback

---

## 🚀 Workflow

### Daily Workflow

1. **Monitor:** Check update logs
2. **Review:** Review draft articles
3. **Publish:** Publish approved articles
4. **Improve:** Update based on feedback

### Weekly Workflow

1. **Sync:** Sync markdown files
2. **Analyze:** Review search analytics
3. **Create:** Create articles for common questions
4. **Update:** Update outdated content

---

## 🔗 Integration Points

### Feature Release

```typescript
// When releasing feature
await onFeatureRelease({
  name: 'New Feature',
  description: '...',
  category: 'features',
  documentation: '...'
});
```

### Chat Bot

Already integrated in `/api/chat/route.ts`

### Admin Interface

Create admin interface for:
- Reviewing drafts
- Publishing articles
- Managing categories
- Viewing analytics

---

## 📝 Example: Adding New Feature

1. **Create Feature:**
   ```typescript
   // Feature code
   ```

2. **Auto-Generate Docs:**
   ```typescript
   await wikiAutoUpdate.generateFromFeature({
     featureName: 'Feature Name',
     category: 'features',
     content: '...'
   });
   ```

3. **Review Draft:**
   - Check auto-generated article
   - Edit if needed
   - Add screenshots

4. **Publish:**
   - Approve article
   - Chat bot can now answer questions
   - Users can find it in wiki

---

## 🆘 Troubleshooting

### Articles Not Syncing

- Check database connection
- Verify migration ran
- Check file paths

### Chat Bot Not Finding Articles

- Verify articles are published
- Check search vector is generated
- Regenerate embeddings

### Auto-Update Not Working

- Check API keys
- Verify hooks are set up
- Review logs for errors

---

**For More Help:**
- Check [Wiki README](./README.md)
- Contact support
- Review [Database Schema](../supabase/migrations/999_create_knowledge_base.sql)
