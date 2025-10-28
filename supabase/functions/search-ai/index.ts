/**
 * AI Search Edge Function
 * Runs hybrid semantic + keyword queries using embeddings
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  query: string;
  namespace?: string;
  limit?: number;
  threshold?: number;
  includeMetadata?: boolean;
}

interface SearchResult {
  id: string;
  content: string;
  metadata: any;
  similarity: number;
  namespace: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query, namespace, limit = 10, threshold = 0.7, includeMetadata = true }: SearchRequest = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Perform hybrid search (semantic + keyword)
    const results = await performHybridSearch(
      supabaseClient,
      query,
      namespace,
      limit,
      threshold,
      includeMetadata
    );

    return new Response(
      JSON.stringify({
        query,
        results,
        total: results.length,
        namespace: namespace || 'all'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Search error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

/**
 * Perform hybrid semantic + keyword search
 */
async function performHybridSearch(
  supabaseClient: any,
  query: string,
  namespace: string | undefined,
  limit: number,
  threshold: number,
  includeMetadata: boolean
): Promise<SearchResult[]> {
  try {
    // Generate embedding for semantic search
    const embedding = await generateEmbedding(query);
    
    // Build the search query
    let searchQuery = supabaseClient
      .from('ai_embeddings')
      .select(`
        id,
        content,
        metadata,
        namespace,
        similarity:embedding
      `)
      .order('embedding', { 
        ascending: false,
        referencedTable: 'ai_embeddings',
        referencedColumn: 'embedding'
      })
      .limit(limit);

    // Add namespace filter if specified
    if (namespace) {
      searchQuery = searchQuery.eq('namespace', namespace);
    }

    // Execute the search
    const { data: semanticResults, error: semanticError } = await searchQuery;

    if (semanticError) {
      console.error('Semantic search error:', semanticError);
      throw semanticError;
    }

    // Perform keyword search as fallback/enhancement
    const keywordResults = await performKeywordSearch(
      supabaseClient,
      query,
      namespace,
      limit
    );

    // Combine and rank results
    const combinedResults = combineSearchResults(
      semanticResults || [],
      keywordResults,
      query,
      threshold
    );

    // Filter by threshold and limit
    const filteredResults = combinedResults
      .filter(result => result.similarity >= threshold)
      .slice(0, limit);

    return filteredResults;

  } catch (error) {
    console.error('Hybrid search failed:', error);
    throw error;
  }
}

/**
 * Generate embedding using OpenAI API
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float'
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;

  } catch (error) {
    console.error('Failed to generate embedding:', error);
    throw error;
  }
}

/**
 * Perform keyword search as fallback
 */
async function performKeywordSearch(
  supabaseClient: any,
  query: string,
  namespace: string | undefined,
  limit: number
): Promise<SearchResult[]> {
  try {
    // Split query into keywords
    const keywords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    
    if (keywords.length === 0) {
      return [];
    }

    // Build keyword search query
    let keywordQuery = supabaseClient
      .from('ai_embeddings')
      .select('id, content, metadata, namespace')
      .or(keywords.map(keyword => `content.ilike.%${keyword}%`).join(','))
      .limit(limit);

    if (namespace) {
      keywordQuery = keywordQuery.eq('namespace', namespace);
    }

    const { data: keywordResults, error: keywordError } = await keywordQuery;

    if (keywordError) {
      console.error('Keyword search error:', keywordError);
      return [];
    }

    // Calculate keyword similarity scores
    return (keywordResults || []).map(result => ({
      ...result,
      similarity: calculateKeywordSimilarity(query, result.content)
    }));

  } catch (error) {
    console.error('Keyword search failed:', error);
    return [];
  }
}

/**
 * Combine semantic and keyword search results
 */
function combineSearchResults(
  semanticResults: any[],
  keywordResults: SearchResult[],
  query: string,
  threshold: number
): SearchResult[] {
  const resultMap = new Map<string, SearchResult>();

  // Add semantic results
  semanticResults.forEach(result => {
    resultMap.set(result.id, {
      id: result.id,
      content: result.content,
      metadata: result.metadata,
      similarity: result.similarity || 0,
      namespace: result.namespace
    });
  });

  // Add or update with keyword results
  keywordResults.forEach(result => {
    const existing = resultMap.get(result.id);
    if (existing) {
      // Boost similarity if keyword match exists
      existing.similarity = Math.max(existing.similarity, result.similarity * 0.8);
    } else {
      resultMap.set(result.id, result);
    }
  });

  // Convert to array and sort by similarity
  return Array.from(resultMap.values())
    .sort((a, b) => b.similarity - a.similarity);
}

/**
 * Calculate keyword similarity score
 */
function calculateKeywordSimilarity(query: string, content: string): number {
  const queryWords = query.toLowerCase().split(/\s+/);
  const contentWords = content.toLowerCase().split(/\s+/);
  
  const querySet = new Set(queryWords);
  const contentSet = new Set(contentWords);
  
  const intersection = new Set([...querySet].filter(word => contentSet.has(word)));
  const union = new Set([...querySet, ...contentSet]);
  
  return intersection.size / union.size;
}

/**
 * Health check endpoint
 */
async function healthCheck() {
  return new Response(
    JSON.stringify({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'ai-search'
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}