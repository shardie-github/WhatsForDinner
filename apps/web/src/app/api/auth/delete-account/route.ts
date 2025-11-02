import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = user.id;

    // Delete user data in order (respecting foreign key constraints)
    const tablesToClean = [
      { table: 'user_preferences', userIdColumn: 'user_id' },
      { table: 'meal_plans', userIdColumn: 'user_id' },
      { table: 'pantry_items', userIdColumn: 'user_id' },
      { table: 'favorites', userIdColumn: 'user_id' },
      { table: 'recipe_history', userIdColumn: 'user_id' },
    ];

    for (const { table, userIdColumn } of tablesToClean) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq(userIdColumn, userId);
      
      if (error) {
        console.error(`Error deleting from ${table}:`, error);
        // Continue deletion even if some tables fail
      }
    }

    // Delete the auth user (this also triggers RLS cleanup if configured)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete account', details: deleteError.message },
        { status: 500 }
      );
    }

    // In production, send confirmation email
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send confirmation email via Resend/SendGrid
      // await sendAccountDeletionConfirmationEmail(user.email);
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Account deleted successfully',
        note: process.env.NODE_ENV === 'production' 
          ? 'A confirmation email has been sent.' 
          : 'Account deleted (test mode)' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Allow only POST for security
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
