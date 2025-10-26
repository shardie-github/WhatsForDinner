import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseClient';
import { z } from 'zod';

const TranslationSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  locale: z.string().min(2).max(5),
  namespace: z.string().min(1),
  context: z.string().optional(),
  plural: z.string().optional(),
  variables: z.record(z.any()).optional(),
  translator: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale');
    const namespace = searchParams.get('namespace');
    const key = searchParams.get('key');

    const supabase = createClient();

    let query = supabase
      .from('translations')
      .select('*')
      .order('created_at', { ascending: false });

    if (locale) {
      query = query.eq('locale', locale);
    }
    if (namespace) {
      query = query.eq('namespace', namespace);
    }
    if (key) {
      query = query.eq('key', key);
    }

    const { data: translations, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch translations' },
        { status: 500 }
      );
    }

    return NextResponse.json({ translations });

  } catch (error) {
    console.error('Fetch translations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = TranslationSchema.parse(body);

    const supabase = createClient();

    // Check if translation already exists
    const { data: existing } = await supabase
      .from('translations')
      .select('id')
      .eq('key', validatedData.key)
      .eq('locale', validatedData.locale)
      .eq('namespace', validatedData.namespace)
      .single();

    if (existing) {
      // Update existing translation
      const { data, error } = await supabase
        .from('translations')
        .update({
          value: validatedData.value,
          context: validatedData.context,
          plural: validatedData.plural,
          variables: validatedData.variables,
          translator: validatedData.translator,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({ translation: data });
    } else {
      // Create new translation
      const { data, error } = await supabase
        .from('translations')
        .insert([
          {
            ...validatedData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({ translation: data });
    }

  } catch (error) {
    console.error('Translation save error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid translation data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Translation ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from('translations')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ translation: data });

  } catch (error) {
    console.error('Translation update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Translation ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { error } = await supabase
      .from('translations')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Translation delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}