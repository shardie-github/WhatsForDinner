import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseClient';
import { z } from 'zod';

const FeedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'general', 'praise', 'complaint']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  email: z.string().email().optional(),
  attachments: z.array(z.any()).optional(),
  metadata: z.object({
    userAgent: z.string(),
    url: z.string(),
    timestamp: z.string(),
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    page: z.string(),
    feature: z.string().optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = FeedbackSchema.parse(body);

    const supabase = createClient();

    // Insert feedback into database
    const { data: feedback, error } = await supabase
      .from('feedback')
      .insert([
        {
          type: validatedData.type,
          priority: validatedData.priority,
          title: validatedData.title,
          description: validatedData.description,
          email: validatedData.email,
          user_id: validatedData.metadata.userId,
          session_id: validatedData.metadata.sessionId,
          page: validatedData.metadata.page,
          feature: validatedData.metadata.feature,
          user_agent: validatedData.metadata.userAgent,
          url: validatedData.metadata.url,
          status: 'new',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      );
    }

    // Handle file attachments if any
    if (validatedData.attachments && validatedData.attachments.length > 0) {
      // In a real implementation, you would upload files to a storage service
      // and store the URLs in the database
      console.log('File attachments received:', validatedData.attachments.length);
    }

    // Send notification to support team for high priority feedback
    if (validatedData.priority === 'urgent' || validatedData.priority === 'high') {
      await sendUrgentNotification(feedback.id, validatedData);
    }

    // Auto-route based on feedback type
    await routeFeedback(feedback.id, validatedData);

    // Send confirmation email if email provided
    if (validatedData.email) {
      await sendConfirmationEmail(validatedData.email, feedback.id);
    }

    return NextResponse.json({
      success: true,
      feedbackId: feedback.id,
      message: 'Feedback submitted successfully',
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid feedback data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendUrgentNotification(feedbackId: string, feedback: any) {
  // Send urgent notification to support team
  // This could be Slack, email, or any other notification system
  console.log(`URGENT FEEDBACK: ${feedbackId} - ${feedback.title}`);
  
  // Example Slack notification
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Urgent Feedback Received`,
          attachments: [
            {
              color: feedback.priority === 'urgent' ? 'danger' : 'warning',
              fields: [
                { title: 'ID', value: feedbackId, short: true },
                { title: 'Type', value: feedback.type, short: true },
                { title: 'Priority', value: feedback.priority, short: true },
                { title: 'Title', value: feedback.title, short: false },
                { title: 'Description', value: feedback.description, short: false },
                { title: 'Page', value: feedback.metadata.page, short: true },
                { title: 'User', value: feedback.metadata.userId || 'Anonymous', short: true },
              ],
            },
          ],
        }),
      });
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }
}

async function routeFeedback(feedbackId: string, feedback: any) {
  // Auto-route feedback to appropriate team based on type and content
  const supabase = createClient();

  let assignedTeam = 'general';
  let assignedAgent = null;

  // Route based on feedback type
  switch (feedback.type) {
    case 'bug':
      assignedTeam = 'engineering';
      break;
    case 'feature':
      assignedTeam = 'product';
      break;
    case 'complaint':
      assignedTeam = 'customer-success';
      break;
    case 'praise':
      assignedTeam = 'marketing';
      break;
    default:
      assignedTeam = 'general';
  }

  // Route based on priority
  if (feedback.priority === 'urgent') {
    assignedTeam = 'engineering'; // Urgent issues go to engineering
  }

  // Route based on content keywords
  const content = `${feedback.title} ${feedback.description}`.toLowerCase();
  if (content.includes('billing') || content.includes('payment') || content.includes('subscription')) {
    assignedTeam = 'billing';
  } else if (content.includes('mobile') || content.includes('app')) {
    assignedTeam = 'mobile';
  } else if (content.includes('api') || content.includes('integration')) {
    assignedTeam = 'platform';
  }

  // Update feedback with routing information
  await supabase
    .from('feedback')
    .update({
      assigned_team: assignedTeam,
      assigned_agent: assignedAgent,
      status: 'assigned',
      updated_at: new Date().toISOString(),
    })
    .eq('id', feedbackId);

  console.log(`Feedback ${feedbackId} routed to ${assignedTeam} team`);
}

async function sendConfirmationEmail(email: string, feedbackId: string) {
  // Send confirmation email to user
  // This would integrate with your email service (Resend, SendGrid, etc.)
  console.log(`Sending confirmation email to ${email} for feedback ${feedbackId}`);
  
  // Example with Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'support@whatsfordinner.com',
          to: email,
          subject: 'Thank you for your feedback!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Thank you for your feedback!</h2>
              <p>We've received your feedback and our team will review it shortly.</p>
              <p><strong>Feedback ID:</strong> ${feedbackId}</p>
              <p>We'll keep you updated on the progress and get back to you soon.</p>
              <p>Best regards,<br>The What's for Dinner Team</p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        console.error('Failed to send confirmation email');
      }
    } catch (error) {
      console.error('Email sending error:', error);
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');

    let query = supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) {
      query = query.eq('status', status);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }

    const { data: feedback, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      feedback,
      pagination: {
        page,
        limit,
        hasMore: feedback.length === limit,
      },
    });

  } catch (error) {
    console.error('Fetch feedback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}