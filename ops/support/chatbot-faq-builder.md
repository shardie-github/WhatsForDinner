# Chatbot FAQ Builder — Canadian Venture Operations

**Goal:** Build an automated chatbot that handles common customer questions 24/7

---

## 🎯 Overview

This guide covers building a simple chatbot using free/low-cost tools that can handle common FAQs, route complex questions to human support, and reduce support ticket volume.

**Recommended Stack:**
- **Free:** Google Dialogflow + Zapier + Supabase
- **Paid:** Crisp Chat, Intercom, or Drift

---

## 📋 Common FAQs for "What's for Dinner?" App

### Category 1: Getting Started

**Q: How do I create my first meal plan?**  
A: Click "Create Meal Plan" on the home screen, select your dietary preferences, and our AI will suggest recipes. You can customize any meal before saving.

**Q: Do I need to create an account?**  
A: Yes, a free account lets you save meal plans, sync across devices, and access premium features. Sign up takes 30 seconds.

**Q: Is the app free?**  
A: Yes! We offer a free plan with basic meal planning. Premium plans ($9.99/month) unlock grocery lists, recipe scaling, and advanced dietary filters.

---

### Category 2: Features

**Q: Can I import my own recipes?**  
A: Yes! Go to Settings → My Recipes → Import. We support PDF, image, or manual entry.

**Q: Does the app sync with Canadian grocery stores?**  
A: Yes! We integrate with Loblaws, Metro, Sobeys, and more. Add items to your grocery list and we'll show you where to buy them.

**Q: Can I plan meals for the whole family?**  
A: Absolutely! Set household size in Settings, and we'll scale recipes automatically. You can also create separate meal plans for different dietary needs.

---

### Category 3: Billing

**Q: How do I cancel my subscription?**  
A: Go to Settings → Billing → Cancel Subscription. You'll retain access until the end of your billing period.

**Q: Do you offer refunds?**  
A: Yes, we offer a 30-day money-back guarantee. Contact support@yourdomain.com with your receipt.

**Q: What payment methods do you accept?**  
A: We accept all major credit cards (Visa, Mastercard, Amex) and Apple Pay/Google Pay.

---

### Category 4: Technical

**Q: The app is slow / crashing**  
A: Try these steps: 1) Close and reopen the app, 2) Update to the latest version, 3) Clear app cache (Settings → Storage), 4) Restart your device. If issues persist, contact support.

**Q: I can't log in**  
A: Try resetting your password: Login → Forgot Password. Check your spam folder for the reset email. If you still can't log in, contact support.

**Q: My data isn't syncing**  
A: Ensure you're logged in and have internet connection. Go to Settings → Sync → Force Sync. If data is still missing, contact support.

---

## 🚀 Setup: Google Dialogflow (Free)

### Step 1: Create Dialogflow Agent

1. **Go to Dialogflow:** https://dialogflow.cloud.google.com/
2. **Create Agent:**
   - Name: "WhatsForDinner Support Bot"
   - Language: English (Canada)
   - Time Zone: Eastern Time

---

### Step 2: Create Intents

**Intent 1: "getting_started"**

**Training Phrases:**
- "How do I get started?"
- "How do I create a meal plan?"
- "I'm new, help me"
- "How does this app work?"

**Response:**
```
Welcome to What's for Dinner! Here's how to get started:

1. Create a free account (30 seconds)
2. Set your dietary preferences
3. Click "Create Meal Plan"
4. Our AI will suggest recipes based on your preferences

Need help? Reply "support" to talk to a human.
```

**Intent 2: "pricing"**

**Training Phrases:**
- "How much does it cost?"
- "Is it free?"
- "What's the price?"
- "Do you have a free trial?"

**Response:**
```
We offer a free plan with basic meal planning. Premium plans start at $9.99 CAD/month and include:

- Unlimited meal plans
- Grocery list generation
- Recipe scaling
- Advanced dietary filters
- Priority support

Start free, upgrade anytime. Reply "pricing" for more details.
```

**Intent 3: "billing"**

**Training Phrases:**
- "How do I cancel?"
- "I want a refund"
- "Change payment method"
- "Billing question"

**Response:**
```
For billing questions:

- Cancel: Settings → Billing → Cancel Subscription
- Refunds: Contact support@yourdomain.com (30-day guarantee)
- Payment: We accept credit cards and Apple/Google Pay

Reply "support" to connect with a human for billing help.
```

---

### Step 3: Integrate with Website

**Option A: Dialogflow Web Demo**

1. Go to Dialogflow → Integrations → Web Demo
2. Copy embed code
3. Add to website: `apps/web/src/components/chatbot/ChatbotWidget.tsx`

**Option B: Custom Widget (Recommended)**

```tsx
// apps/web/src/components/chatbot/ChatbotWidget.tsx
'use client';

import { useState } from 'react';

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{text: string, from: 'user' | 'bot'}>>([]);
  
  const sendMessage = async (text: string) => {
    // Call Dialogflow API
    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    const data = await response.json();
    
    setMessages([...messages, 
      { text, from: 'user' },
      { text: data.reply, from: 'bot' }
    ]);
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat widget UI */}
    </div>
  );
}
```

---

### Step 4: API Route (Next.js)

```typescript
// apps/web/src/app/api/chatbot/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { message } = await req.json();
  
  // Call Dialogflow API
  const response = await fetch(
    `https://dialogflow.googleapis.com/v2/projects/${process.env.DIALOGFLOW_PROJECT_ID}/agent/sessions/${sessionId}:detectIntent`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DIALOGFLOW_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        queryInput: { text: { text: message, languageCode: 'en-CA' } },
      }),
    }
  );
  
  const data = await response.json();
  return NextResponse.json({ reply: data.queryResult.fulfillmentText });
}
```

---

## 🔄 Fallback to Human Support

**Zapier Integration:**

1. **Trigger:** Dialogflow → Intent = "escalate_to_human"
2. **Action:** Supabase → Create Support Ticket
3. **Action:** Slack → Post to #support channel
4. **Action:** Email → Notify support team

---

## 📊 Chatbot Analytics

**Track These Metrics:**
- Messages handled per day
- Escalation rate (chatbot → human)
- Most common questions
- User satisfaction (thumbs up/down)

**Dialogflow Analytics:**
- Go to Dialogflow → Analytics
- View intent performance
- Optimize responses based on data

---

## ✅ Checklist

- [ ] Dialogflow agent created
- [ ] Common FAQs added as intents
- [ ] Responses written and tested
- [ ] Website widget integrated
- [ ] API route created
- [ ] Escalation to human support configured
- [ ] Analytics dashboard set up

---

## 📚 Resources

- [Dialogflow Documentation](https://cloud.google.com/dialogflow/docs)
- [Free Chatbot Alternatives](https://www.crisp.chat/) - Crisp Chat (free tier)
- [Zapier Dialogflow Integration](https://zapier.com/apps/dialogflow/integrations)

---

**Last Updated:** 2025-01-XX  
**Next Review:** Monthly (add new FAQs based on support tickets)
