import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseClient';
import { openai } from '@/lib/openaiClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId, sessionId, conversationHistory } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user context from database
    const supabase = createClient();
    let userContext = '';
    
    if (userId) {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (user) {
        userContext = `User: ${user.email}, Plan: ${user.subscription_plan || 'free'}`;
      }
    }

    // Build conversation context
    const conversationContext = conversationHistory
      .slice(-10) // Last 10 messages for context
      .map((msg: any) => `${msg.sender}: ${msg.content}`)
      .join('\n');

    // Create system prompt for support bot
    const systemPrompt = `You are a helpful AI support assistant for "What's for Dinner" - a meal planning and recipe app. 

User Context: ${userContext}

Key Features:
- Meal planning and recipe generation
- Pantry management
- Dietary preferences and restrictions
- Shopping lists
- Mobile and web apps
- Subscription plans (free, pro, enterprise)

Common Issues:
- Account problems (login, password reset, profile)
- App functionality (meal generation, pantry sync, calendar integration)
- Billing and subscription questions
- Technical issues (bugs, performance, compatibility)
- Feature requests and feedback

Guidelines:
1. Be helpful, friendly, and professional
2. Provide specific, actionable solutions
3. If you can't solve the issue, offer to escalate to a human agent
4. Ask clarifying questions when needed
5. Provide relevant quick replies for common questions
6. If it's a bug report, ask for steps to reproduce
7. If it's a feature request, acknowledge and explain the process

Current conversation:
${conversationContext}

Respond to the user's message and provide 3-5 relevant quick reply options.`;

    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';

    // Generate quick replies based on the message content
    const quickReplies = generateQuickReplies(message, response);

    // Log conversation for analytics
    await logConversation({
      userId,
      sessionId,
      userMessage: message,
      botResponse: response,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      response,
      quickReplies,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

function generateQuickReplies(userMessage: string, botResponse: string): string[] {
  const message = userMessage.toLowerCase();
  const response = botResponse.toLowerCase();

  // Common quick replies based on context
  if (message.includes('bug') || message.includes('error') || message.includes('not working')) {
    return [
      'Can you provide more details about the bug?',
      'What device/browser are you using?',
      'When did this start happening?',
      'Can you share a screenshot?',
      'I need to speak to a human agent',
    ];
  }

  if (message.includes('feature') || message.includes('request') || message.includes('suggest')) {
    return [
      'How would this feature help you?',
      'Is this for personal or business use?',
      'What\'s your use case?',
      'I want to vote for existing features',
      'I need to speak to a human agent',
    ];
  }

  if (message.includes('billing') || message.includes('payment') || message.includes('subscription')) {
    return [
      'I want to upgrade my plan',
      'I want to cancel my subscription',
      'I have a billing question',
      'I want a refund',
      'I need to speak to a human agent',
    ];
  }

  if (message.includes('account') || message.includes('login') || message.includes('password')) {
    return [
      'I forgot my password',
      'I can\'t log in',
      'I want to change my email',
      'I want to delete my account',
      'I need to speak to a human agent',
    ];
  }

  if (message.includes('mobile') || message.includes('app') || message.includes('ios') || message.includes('android')) {
    return [
      'The app is crashing',
      'I can\'t sync my data',
      'Push notifications not working',
      'App store issues',
      'I need to speak to a human agent',
    ];
  }

  // Default quick replies
  return [
    'I need more help with this',
    'Can you explain that differently?',
    'I want to speak to a human agent',
    'What are your business hours?',
    'How do I contact support directly?',
  ];
}

async function logConversation(data: {
  userId?: string;
  sessionId?: string;
  userMessage: string;
  botResponse: string;
  timestamp: string;
}) {
  try {
    const supabase = createClient();
    
    await supabase
      .from('support_conversations')
      .insert([
        {
          user_id: data.userId,
          session_id: data.sessionId,
          user_message: data.userMessage,
          bot_response: data.botResponse,
          created_at: data.timestamp,
        },
      ]);
  } catch (error) {
    console.error('Failed to log conversation:', error);
  }
}