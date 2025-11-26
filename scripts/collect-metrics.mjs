#!/usr/bin/env node
/**
 * Collect Metrics Script
 * 
 * Runs all metric queries and outputs results to console and file
 * Usage: node scripts/collect-metrics.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function collectMetrics() {
  console.log('📊 Collecting metrics...\n');

  const results = {
    timestamp: new Date().toISOString(),
    activeUsers: null,
    activation: null,
    retention: null,
    revenue: null,
    unitEconomics: null,
    funnel: null,
    channels: null,
  };

  try {
    // Active Users
    console.log('1. Fetching active users (DAU/WAU/MAU)...');
    const { data: activeUsers, error: activeUsersError } = await supabase.rpc(
      'get_active_users',
      {
        period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: new Date().toISOString(),
      }
    );
    if (activeUsersError) {
      console.error('   ⚠️  Error:', activeUsersError.message);
    } else {
      console.log('   ✅ Active Users:', activeUsers?.length || 0, 'data points');
      results.activeUsers = activeUsers;
      if (activeUsers && activeUsers.length > 0) {
        console.log(`   📈 Latest: DAU=${activeUsers[0].dau}, WAU=${activeUsers[0].wau}, MAU=${activeUsers[0].mau}`);
      }
    }

    // Activation Rate
    console.log('\n2. Fetching activation rate...');
    const { data: activation, error: activationError } = await supabase.rpc('get_activation_rate');
    if (activationError) {
      console.error('   ⚠️  Error:', activationError.message);
    } else {
      console.log('   ✅ Activation Rate:', activation?.[0]?.activation_rate?.toFixed(1) || 'N/A', '%');
      results.activation = activation?.[0] || null;
    }

    // Retention Rate
    console.log('\n3. Fetching retention rate...');
    const { data: retention, error: retentionError } = await supabase.rpc(
      'get_retention_rate',
      {
        cohort_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        cohort_end: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }
    );
    if (retentionError) {
      console.error('   ⚠️  Error:', retentionError.message);
    } else {
      console.log('   ✅ Retention Rate:', retention?.[0]?.retention_7d?.toFixed(1) || 'N/A', '% (7-day)');
      results.retention = retention?.[0] || null;
    }

    // Revenue Metrics
    console.log('\n4. Fetching revenue metrics...');
    const { data: revenue, error: revenueError } = await supabase.rpc('get_revenue_metrics');
    if (revenueError) {
      console.error('   ⚠️  Error:', revenueError.message);
    } else {
      console.log('   ✅ MRR: $' + (revenue?.[0]?.mrr?.toFixed(2) || '0.00'));
      console.log('   ✅ ARPU: $' + (revenue?.[0]?.arpu?.toFixed(2) || '0.00') + '/month');
      console.log('   ✅ Paying Users:', revenue?.[0]?.paying_users || 0);
      results.revenue = revenue?.[0] || null;
    }

    // Unit Economics
    console.log('\n5. Fetching unit economics...');
    const { data: unitEconomics, error: unitEconomicsError } = await supabase.rpc('get_unit_economics');
    if (unitEconomicsError) {
      console.error('   ⚠️  Error:', unitEconomicsError.message);
    } else {
      const ue = unitEconomics?.[0];
      if (ue) {
        console.log('   ✅ Gross Margin:', ue.gross_margin_pct?.toFixed(1) || 'N/A', '%');
        console.log('   ✅ Avg LTV: $' + (ue.avg_ltv?.toFixed(2) || '0.00'));
        console.log('   ✅ Estimated CAC: $' + (ue.estimated_cac?.toFixed(2) || '0.00'));
        if (ue.ltv_cac_ratio) {
          console.log('   ✅ LTV:CAC Ratio:', ue.ltv_cac_ratio?.toFixed(2) || 'N/A', ':1');
        }
      }
      results.unitEconomics = unitEconomics?.[0] || null;
    }

    // Conversion Funnel
    console.log('\n6. Fetching conversion funnel...');
    const { data: funnel, error: funnelError } = await supabase.rpc(
      'get_conversion_funnel',
      {
        period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: new Date().toISOString(),
      }
    );
    if (funnelError) {
      console.error('   ⚠️  Error:', funnelError.message);
    } else {
      const f = funnel?.[0];
      if (f) {
        console.log('   ✅ Funnel:', f.signups, 'signups →', f.activated, 'activated →', f.paying, 'paying');
      }
      results.funnel = funnel?.[0] || null;
    }

    // Channel Metrics
    console.log('\n7. Fetching channel metrics...');
    const { data: channels, error: channelsError } = await supabase.rpc(
      'get_channel_metrics',
      {
        period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: new Date().toISOString(),
      }
    );
    if (channelsError) {
      console.error('   ⚠️  Error:', channelsError.message);
    } else {
      console.log('   ✅ Channels:', channels?.length || 0);
      results.channels = channels || [];
    }

    // Save to file
    const outputPath = join(process.cwd(), 'yc', 'METRICS_COLLECTED.md');
    const metricsContent = `# Metrics Collected: What's for Dinner

**Last Updated**: ${new Date().toISOString().split('T')[0]}  
**Collected At**: ${new Date().toISOString()}

---

## Actual Metrics (From Database)

### User Metrics

**Current** (as of ${new Date().toISOString().split('T')[0]}):
- **Total Users**: ${results.revenue ? 'See database' : '[TBD]'}
- **DAU (Daily Active Users)**: ${results.activeUsers?.[0]?.dau || '[TBD]'}
- **WAU (Weekly Active Users)**: ${results.activeUsers?.[0]?.wau || '[TBD]'}
- **MAU (Monthly Active Users)**: ${results.activeUsers?.[0]?.mau || '[TBD]'}

---

### Engagement Metrics

**Current**:
- **Activation Rate**: ${results.activation?.activation_rate?.toFixed(1) || '[TBD]'}% (signups → first recipe within 7 days)
- **7-Day Retention**: ${results.retention?.retention_7d?.toFixed(1) || '[TBD]'}%
- **30-Day Retention**: ${results.retention?.retention_30d?.toFixed(1) || '[TBD]'}%

---

### Revenue Metrics

**Current**:
- **MRR (Monthly Recurring Revenue)**: $${results.revenue?.mrr?.toFixed(2) || '[TBD]'}
- **ARR (Annual Recurring Revenue)**: $${results.revenue ? (results.revenue.mrr * 12).toFixed(2) : '[TBD]'}
- **ARPU (Average Revenue Per User)**: $${results.revenue?.arpu?.toFixed(2) || '[TBD]'}/month
- **Paying Users**: ${results.revenue?.paying_users || '[TBD]'}

---

### Unit Economics

**Current**:
- **CAC (Customer Acquisition Cost)**: $${results.unitEconomics?.estimated_cac?.toFixed(2) || '[TBD]'}
- **LTV (Lifetime Value)**: $${results.unitEconomics?.avg_ltv?.toFixed(2) || '[TBD]'}
- **LTV:CAC Ratio**: ${results.unitEconomics?.ltv_cac_ratio ? results.unitEconomics.ltv_cac_ratio.toFixed(2) + ':1' : '[TBD]'}
- **Payback Period**: ${results.unitEconomics?.payback_period_months?.toFixed(1) || '[TBD]'} months
- **Gross Margin**: ${results.unitEconomics?.gross_margin_pct?.toFixed(1) || '[TBD]'}%

---

### Conversion Funnel (Last 30 Days)

**Current**:
- **Visitors**: ${results.funnel?.visitors || '[TBD]'}
- **Signups**: ${results.funnel?.signups || '[TBD]'} (${results.funnel?.signup_rate?.toFixed(1) || '[TBD]'}% signup rate)
- **Activated**: ${results.funnel?.activated || '[TBD]'} (${results.funnel?.activation_rate?.toFixed(1) || '[TBD]'}% activation rate)
- **Engaged (3+ recipes)**: ${results.funnel?.engaged || '[TBD]'} (${results.funnel?.engagement_rate?.toFixed(1) || '[TBD]'}% engagement rate)
- **Paying**: ${results.funnel?.paying || '[TBD]'} (${results.funnel?.conversion_rate?.toFixed(1) || '[TBD]'}% conversion rate)

---

## Raw Data

\`\`\`json
${JSON.stringify(results, null, 2)}
\`\`\`

---

**Note**: Run \`node scripts/collect-metrics.mjs\` to update this file with latest metrics.
`;

    writeFileSync(outputPath, metricsContent);
    console.log(`\n✅ Metrics saved to: ${outputPath}`);

    console.log('\n📊 Summary:');
    console.log('   DAU:', results.activeUsers?.[0]?.dau || 'N/A');
    console.log('   WAU:', results.activeUsers?.[0]?.wau || 'N/A');
    console.log('   MAU:', results.activeUsers?.[0]?.mau || 'N/A');
    console.log('   MRR: $' + (results.revenue?.mrr?.toFixed(2) || '0.00'));
    console.log('   Activation:', results.activation?.activation_rate?.toFixed(1) || 'N/A', '%');
    console.log('   Retention:', results.retention?.retention_7d?.toFixed(1) || 'N/A', '%');

  } catch (error) {
    console.error('❌ Error collecting metrics:', error);
    process.exit(1);
  }
}

collectMetrics();
