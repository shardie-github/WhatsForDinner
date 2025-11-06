-- ============================================================================
-- KNOWLEDGE BASE SCHEMA
-- For Wiki & AI Chat Bot Integration
-- ============================================================================

-- Knowledge base articles table
CREATE TABLE IF NOT EXISTS knowledge_base_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null, -- Markdown content
  excerpt text, -- Short summary for search results
  category text not null,
  subcategory text,
  tags text[] default '{}',
  author_id uuid references auth.users(id),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  view_count int default 0,
  helpful_count int default 0,
  not_helpful_count int default 0,
  search_vector tsvector, -- Full-text search vector
  embedding vector(1536), -- OpenAI embeddings for semantic search
  metadata jsonb default '{}', -- Additional metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz,
  version int default 1
);

-- Categories table for organizing articles
CREATE TABLE IF NOT EXISTS knowledge_base_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  parent_id uuid references knowledge_base_categories(id) on delete cascade,
  icon text, -- Icon name or emoji
  order_index int default 0,
  created_at timestamptz default now()
);

-- Chat bot conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id text not null, -- For anonymous users
  title text, -- Auto-generated from first message
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  metadata jsonb default '{}'
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references chat_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  article_ids uuid[] default '{}', -- Articles referenced in response
  sources jsonb default '[]', -- Sources used for answer
  helpful boolean, -- User feedback
  created_at timestamptz default now(),
  metadata jsonb default '{}'
);

-- User feedback on articles
CREATE TABLE IF NOT EXISTS article_feedback (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references knowledge_base_articles(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  helpful boolean not null,
  comment text,
  created_at timestamptz default now(),
  unique(article_id, user_id)
);

-- Article views tracking
CREATE TABLE IF NOT EXISTS article_views (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references knowledge_base_articles(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  viewed_at timestamptz default now(),
  time_spent_seconds int,
  scroll_depth int -- Percentage scrolled
);

-- Search queries table (for improving search)
CREATE TABLE IF NOT EXISTS search_queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  query text not null,
  results_count int,
  clicked_article_id uuid references knowledge_base_articles(id) on delete set null,
  created_at timestamptz default now()
);

-- Auto-update logs (track what content was auto-updated)
CREATE TABLE IF NOT EXISTS knowledge_base_updates (
  id uuid primary key default gen_random_uuid(),
  update_type text not null check (update_type in ('feature_added', 'chat_learned', 'user_contribution', 'auto_sync')),
  article_id uuid references knowledge_base_articles(id) on delete set null,
  source text, -- 'chat_bot', 'feature_release', 'user_contribution', etc.
  changes jsonb, -- What changed
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_kb_articles_category ON knowledge_base_articles(category);
CREATE INDEX IF NOT EXISTS idx_kb_articles_status ON knowledge_base_articles(status);
CREATE INDEX IF NOT EXISTS idx_kb_articles_slug ON knowledge_base_articles(slug);
CREATE INDEX IF NOT EXISTS idx_kb_articles_search ON knowledge_base_articles USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_kb_articles_tags ON knowledge_base_articles USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_kb_articles_embedding ON knowledge_base_articles USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_article_feedback_article ON article_feedback(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_article ON article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_query ON search_queries(query);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_knowledge_base_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.content, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'B');
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update search vector
CREATE TRIGGER update_kb_articles_search_vector
  BEFORE INSERT OR UPDATE ON knowledge_base_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_base_search_vector();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_kb_articles_updated_at
  BEFORE UPDATE ON knowledge_base_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE knowledge_base_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published articles
CREATE POLICY "Anyone can read published articles"
  ON knowledge_base_articles FOR SELECT
  USING (status = 'published');

-- Policy: Authenticated users can read all their own articles
CREATE POLICY "Users can read own articles"
  ON knowledge_base_articles FOR SELECT
  USING (auth.uid() = author_id);

-- Policy: Only admins can insert/update articles
CREATE POLICY "Admins can manage articles"
  ON knowledge_base_articles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Anyone can read categories
CREATE POLICY "Anyone can read categories"
  ON knowledge_base_categories FOR SELECT
  USING (true);

-- Policy: Users can manage their own conversations
CREATE POLICY "Users can manage own conversations"
  ON chat_conversations FOR ALL
  USING (user_id = auth.uid() OR session_id = current_setting('app.session_id', true));

-- Policy: Users can manage messages in their conversations
CREATE POLICY "Users can manage own messages"
  ON chat_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
      AND (chat_conversations.user_id = auth.uid() OR chat_conversations.session_id = current_setting('app.session_id', true))
    )
  );

-- Policy: Anyone can provide feedback
CREATE POLICY "Anyone can provide feedback"
  ON article_feedback FOR ALL
  USING (true);

-- Policy: Anyone can view articles (for analytics)
CREATE POLICY "Anyone can track views"
  ON article_views FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can search (logged anonymously)
CREATE POLICY "Anyone can search"
  ON search_queries FOR INSERT
  WITH CHECK (true);

-- Insert default categories
INSERT INTO knowledge_base_categories (name, slug, description, icon, order_index) VALUES
  ('Getting Started', 'getting-started', 'New user guides and onboarding', '🚀', 1),
  ('Meal Planning', 'meal-planning', 'Creating and managing meal plans', '📅', 2),
  ('Pantry Management', 'pantry', 'Managing your pantry and ingredients', '🥫', 3),
  ('Recipes', 'recipes', 'Finding, saving, and using recipes', '🍳', 4),
  ('Grocery Lists', 'grocery-lists', 'Creating and managing shopping lists', '🛒', 5),
  ('Shopping & Integrations', 'integrations', 'Store integrations and online ordering', '🔗', 6),
  ('Nutrition & Health', 'nutrition', 'Nutrition tracking and dietary preferences', '🥗', 7),
  ('Community Features', 'community', 'Sharing and community features', '👥', 8),
  ('Account & Settings', 'account', 'Account management and preferences', '⚙️', 9),
  ('Advanced Features', 'advanced', 'Advanced tips and strategies', '🎯', 10),
  ('Troubleshooting', 'troubleshooting', 'Common issues and solutions', '🔧', 11),
  ('FAQs', 'faqs', 'Frequently asked questions', '❓', 12)
ON CONFLICT (slug) DO NOTHING;
