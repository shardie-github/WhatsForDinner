/**
 * Marketplace Purchase Handler
 * Automatic commission calculation - zero effort
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const COMMISSION_RATE = parseFloat(process.env.MARKETPLACE_COMMISSION_RATE || '10');

export async function POST(request: NextRequest) {
  try {
    const { productId, sellerId, amount, buyerId } = await request.json();

    if (!productId || !sellerId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient();

    // Calculate commission
    const commission = amount * (COMMISSION_RATE / 100);
    const sellerPayout = amount - commission;

    // Create transaction
    const { data: transaction, error: txError } = await supabase
      .from('marketplace_transactions')
      .insert({
        product_id: productId,
        seller_id: sellerId,
        buyer_id: buyerId,
        amount,
        commission_rate: COMMISSION_RATE,
        commission,
        seller_payout: sellerPayout,
        status: 'completed',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (txError) throw txError;

    // Create commission record
    await supabase.from('marketplace_commissions').insert({
      transaction_id: transaction.id,
      amount: commission,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    // Create payout record for seller
    await supabase.from('marketplace_payouts').insert({
      transaction_id: transaction.id,
      seller_id: sellerId,
      amount: sellerPayout,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      transaction,
      commission,
      sellerPayout,
    });
  } catch (error) {
    console.error('Marketplace purchase error:', error);
    return NextResponse.json(
      { error: 'Failed to process purchase' },
      { status: 500 }
    );
  }
}
