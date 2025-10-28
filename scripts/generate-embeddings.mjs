/**
 * Generate Embeddings CLI Utility
 * Syncs product copy, docs, or user data via OpenAI Embeddings v3
 * Stores embeddings in Supabase for semantic search
 */

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

class EmbeddingsGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.supabase = createClient(
      process.env.SUPABASE_URL || `https://${process.env.SUPABASE_PROJECT_REF || 'ghqyxhbyyirveptgwoqm'}.supabase.co`,
      process.env.SUPABASE_ANON_KEY || ''
    );
  }

  /**
   * Generate embeddings for various content types
   */
  async generateEmbeddings(options = {}) {
    const {
      contentTypes = ['docs', 'api', 'code'],
      batchSize = 10,
      dryRun = false
    } = options;

    console.log('🧠 Starting embeddings generation...');
    console.log(`Content types: ${contentTypes.join(', ')}`);
    console.log(`Batch size: ${batchSize}`);
    console.log(`Dry run: ${dryRun}`);

    try {
      // Ensure embeddings table exists
      await this.ensureEmbeddingsTable();

      for (const contentType of contentTypes) {
        console.log(`\n📝 Processing ${contentType} content...`);
        await this.processContentType(contentType, batchSize, dryRun);
      }

      console.log('\n✅ Embeddings generation completed!');
    } catch (error) {
      console.error('❌ Embeddings generation failed:', error);
      throw error;
    }
  }

  /**
   * Ensure embeddings table exists
   */
  async ensureEmbeddingsTable() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ai_embeddings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        namespace TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding VECTOR(1536),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create index for vector similarity search
      CREATE INDEX IF NOT EXISTS ai_embeddings_embedding_idx 
      ON ai_embeddings USING ivfflat (embedding vector_cosine_ops);

      -- Create index for namespace filtering
      CREATE INDEX IF NOT EXISTS ai_embeddings_namespace_idx 
      ON ai_embeddings (namespace);

      -- Enable RLS
      ALTER TABLE ai_embeddings ENABLE ROW LEVEL SECURITY;

      -- Create policy for authenticated users
      CREATE POLICY IF NOT EXISTS "Allow authenticated users to read embeddings"
      ON ai_embeddings FOR SELECT
      TO authenticated
      USING (true);

      CREATE POLICY IF NOT EXISTS "Allow service role to manage embeddings"
      ON ai_embeddings FOR ALL
      TO service_role
      USING (true);
    `;

    try {
      const { error } = await this.supabase.rpc('exec_sql', { sql: createTableSQL });
      if (error) {
        console.error('Error creating embeddings table:', error);
        throw error;
      }
      console.log('✅ Embeddings table ensured');
    } catch (error) {
      console.error('Failed to create embeddings table:', error);
      throw error;
    }
  }

  /**
   * Process specific content type
   */
  async processContentType(contentType, batchSize, dryRun) {
    const contentItems = await this.collectContent(contentType);
    console.log(`Found ${contentItems.length} items for ${contentType}`);

    // Process in batches
    for (let i = 0; i < contentItems.length; i += batchSize) {
      const batch = contentItems.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(contentItems.length / batchSize)}`);

      if (!dryRun) {
        await this.processBatch(contentType, batch);
      } else {
        console.log('Dry run - would process:', batch.map(item => item.title || item.path));
      }
    }
  }

  /**
   * Collect content based on type
   */
  async collectContent(contentType) {
    const items = [];

    switch (contentType) {
      case 'docs':
        items.push(...await this.collectDocumentation());
        break;
      case 'api':
        items.push(...await this.collectAPIDocumentation());
        break;
      case 'code':
        items.push(...await this.collectCodeDocumentation());
        break;
      case 'user-data':
        items.push(...await this.collectUserData());
        break;
      default:
        console.warn(`Unknown content type: ${contentType}`);
    }

    return items;
  }

  /**
   * Collect documentation files
   */
  async collectDocumentation() {
    const items = [];
    const docPatterns = [
      '**/*.md',
      'docs/**/*.md',
      'DOCS/**/*.md',
      'REPORTS/**/*.md'
    ];

    for (const pattern of docPatterns) {
      const files = await glob(pattern, { cwd: process.cwd() });
      
      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const title = this.extractTitle(content) || path.basename(file, '.md');
          
          items.push({
            path: file,
            title,
            content: this.cleanMarkdown(content),
            type: 'documentation'
          });
        } catch (error) {
          console.warn(`Failed to read ${file}:`, error.message);
        }
      }
    }

    return items;
  }

  /**
   * Collect API documentation
   */
  async collectAPIDocumentation() {
    const items = [];
    
    // Look for OpenAPI specs, API routes, etc.
    const apiPatterns = [
      'apps/web/app/api/**/*.ts',
      'apps/web/app/api/**/*.js',
      '**/openapi.json',
      '**/swagger.json'
    ];

    for (const pattern of apiPatterns) {
      const files = await glob(pattern, { cwd: process.cwd() });
      
      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const title = this.extractAPITitle(content) || path.basename(file);
          
          items.push({
            path: file,
            title,
            content: this.cleanCodeContent(content),
            type: 'api'
          });
        } catch (error) {
          console.warn(`Failed to read ${file}:`, error.message);
        }
      }
    }

    return items;
  }

  /**
   * Collect code documentation
   */
  async collectCodeDocumentation() {
    const items = [];
    
    // Look for TypeScript/JavaScript files with JSDoc comments
    const codePatterns = [
      'packages/**/*.ts',
      'packages/**/*.tsx',
      'apps/web/src/**/*.ts',
      'apps/web/src/**/*.tsx'
    ];

    for (const pattern of codePatterns) {
      const files = await glob(pattern, { cwd: process.cwd() });
      
      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const jsdoc = this.extractJSDoc(content);
          
          if (jsdoc.length > 0) {
            items.push({
              path: file,
              title: this.extractFunctionName(content) || path.basename(file),
              content: jsdoc,
              type: 'code'
            });
          }
        } catch (error) {
          console.warn(`Failed to read ${file}:`, error.message);
        }
      }
    }

    return items;
  }

  /**
   * Collect user data (placeholder - would need proper data access)
   */
  async collectUserData() {
    // This would typically query user-generated content from the database
    // For now, return empty array as this requires careful privacy consideration
    console.log('⚠️  User data collection not implemented - requires privacy review');
    return [];
  }

  /**
   * Process a batch of content items
   */
  async processBatch(contentType, items) {
    try {
      // Generate embeddings for the batch
      const embeddings = await this.generateEmbeddingsBatch(items);
      
      // Store in Supabase
      const records = items.map((item, index) => ({
        namespace: contentType,
        content: item.content,
        embedding: embeddings[index],
        metadata: {
          path: item.path,
          title: item.title,
          type: item.type
        }
      }));

      const { error } = await this.supabase
        .from('ai_embeddings')
        .upsert(records, { 
          onConflict: 'namespace,content',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Error storing embeddings:', error);
        throw error;
      }

      console.log(`✅ Stored ${records.length} embeddings for ${contentType}`);
    } catch (error) {
      console.error('Failed to process batch:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for a batch of content
   */
  async generateEmbeddingsBatch(items) {
    try {
      const texts = items.map(item => item.content);
      
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts,
        encoding_format: 'float'
      });

      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error('Failed to generate embeddings:', error);
      throw error;
    }
  }

  /**
   * Extract title from markdown content
   */
  extractTitle(content) {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : null;
  }

  /**
   * Extract API title from code content
   */
  extractAPITitle(content) {
    // Look for route definitions, function names, etc.
    const patterns = [
      /export\s+(?:async\s+)?function\s+(\w+)/,
      /export\s+const\s+(\w+)\s*=/,
      /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1] || match[2];
      }
    }

    return null;
  }

  /**
   * Extract function name from code
   */
  extractFunctionName(content) {
    const patterns = [
      /function\s+(\w+)/,
      /const\s+(\w+)\s*=\s*(?:async\s+)?\(/,
      /export\s+(?:async\s+)?function\s+(\w+)/
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Extract JSDoc comments from code
   */
  extractJSDoc(content) {
    const jsdocRegex = /\/\*\*[\s\S]*?\*\//g;
    const matches = content.match(jsdocRegex);
    return matches ? matches.join('\n\n') : '';
  }

  /**
   * Clean markdown content
   */
  cleanMarkdown(content) {
    return content
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]+`/g, '') // Remove inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/\n\s*\n/g, '\n') // Remove extra newlines
      .trim();
  }

  /**
   * Clean code content
   */
  cleanCodeContent(content) {
    return content
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Search embeddings
   */
  async searchEmbeddings(query, namespace = null, limit = 10) {
    try {
      // Generate embedding for the query
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
        encoding_format: 'float'
      });

      const queryEmbedding = response.data[0].embedding;

      // Search in Supabase
      let query_builder = this.supabase
        .from('ai_embeddings')
        .select('*')
        .order('embedding', { 
          ascending: false,
          referencedTable: 'ai_embeddings',
          referencedColumn: 'embedding'
        })
        .limit(limit);

      if (namespace) {
        query_builder = query_builder.eq('namespace', namespace);
      }

      const { data, error } = await query_builder;

      if (error) {
        console.error('Error searching embeddings:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to search embeddings:', error);
      throw error;
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new EmbeddingsGenerator();
  
  const args = process.argv.slice(2);
  const options = {
    contentTypes: args.includes('--docs') ? ['docs'] : 
                  args.includes('--api') ? ['api'] :
                  args.includes('--code') ? ['code'] :
                  ['docs', 'api', 'code'],
    dryRun: args.includes('--dry-run'),
    batchSize: parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1]) || 10
  };

  generator.generateEmbeddings(options).catch(console.error);
}

export default EmbeddingsGenerator;