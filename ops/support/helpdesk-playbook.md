# Helpdesk Playbook — Canadian Venture Operations

**Goal:** Provide consistent, efficient customer support with minimal manual intervention

---

## 🎯 Support Philosophy

- **Response Time:** < 2 hours for high priority, < 24 hours for all tickets
- **Resolution Time:** < 48 hours for most issues
- **Tone:** Friendly, helpful, Canadian-friendly
- **Escalation:** Clear path for technical/complex issues

---

## 📋 Support Ticket Classification

### Priority Levels

| Priority | Response Time | Examples |
|----------|---------------|----------|
| **High** | < 2 hours | App down, payment failed, data loss |
| **Medium** | < 12 hours | Feature request, bug report, account issue |
| **Low** | < 48 hours | General question, feedback, feature inquiry |

### Status Categories

- **Open:** New ticket, awaiting response
- **In Progress:** Being worked on
- **Waiting on Customer:** Need user input
- **Resolved:** Issue fixed, awaiting confirmation
- **Closed:** Confirmed resolved

---

## 🚀 Automated Support Setup

### Step 1: Support Form (Typeform/Google Forms)

**Fields:**
- Email (required)
- Subject (required)
- Priority (dropdown: High, Medium, Low)
- Category (dropdown: Bug, Feature Request, Account, Billing, Other)
- Message (required)
- Attachments (optional)

**Zapier Integration:**
1. **Trigger:** Typeform → New Submission
2. **Action:** Supabase → Insert Row (support_tickets table)
3. **Action:** Gmail → Send Confirmation Email
4. **Action:** Slack → Post to #support channel

---

### Step 2: Support Ticket Database (Supabase)

**Table Schema:**
```sql
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Waiting on Customer', 'Resolved', 'Closed')),
  assigned_to TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  notes TEXT
);
```

---

### Step 3: Auto-Routing Rules

**Zapier Automation:**

1. **High Priority Tickets:**
   - Trigger: Supabase → New Row (priority = "High")
   - Action: Slack → Post to #urgent-support channel
   - Action: Gmail → Send to support@yourdomain.com with "URGENT" tag

2. **Billing Issues:**
   - Trigger: Supabase → New Row (category = "Billing")
   - Action: Stripe → Lookup Customer
   - Action: Notion → Add to "Billing Issues" page

3. **Feature Requests:**
   - Trigger: Supabase → New Row (category = "Feature Request")
   - Action: GitHub → Create Issue (label: "user-request")
   - Action: Notion → Add to "Product Backlog" database

---

## 📝 Response Templates

### Template 1: Ticket Received

**Subject:** Ticket #{{ticket.id}} - {{ticket.subject}}

**Body:**
```
Hi {{ticket.name}},

Thanks for reaching out! We've received your support request (Ticket #{{ticket.id}}).

Priority: {{ticket.priority}}
Category: {{ticket.category}}

We'll respond within:
- High Priority: 2 hours
- Medium Priority: 12 hours
- Low Priority: 48 hours

You can track your ticket status here: [link to support portal]

Best,
Support Team
```

---

### Template 2: Resolution

**Subject:** RE: Ticket #{{ticket.id}} - {{ticket.subject}}

**Body:**
```
Hi {{ticket.name}},

Great news! We've resolved your issue.

{{resolution_details}}

Can you confirm this is working for you? If not, just reply to this email and we'll take another look.

Thanks for your patience!

Best,
Support Team
```

---

### Template 3: Need More Info

**Subject:** RE: Ticket #{{ticket.id}} - Need More Information

**Body:**
```
Hi {{ticket.name}},

Thanks for your ticket. To help us resolve this faster, could you provide:

{{questions}}

Once we have this info, we'll get back to you within 24 hours.

Best,
Support Team
```

---

## 🔄 Common Issues & Solutions

### Issue: "I can't log in"

**Solution:**
1. Check Supabase auth logs
2. Verify email exists
3. Send password reset link
4. If still failing, check for account lockout

**Response Template:**
```
Hi {{name}},

I've reset your password. Please check your email for the reset link.

If you still can't log in, please try:
1. Clear browser cache
2. Try incognito/private mode
3. Check spam folder for reset email

If none of these work, let me know and I'll investigate further.

Best,
Support Team
```

---

### Issue: "Payment failed"

**Solution:**
1. Check Stripe dashboard for payment details
2. Verify card is valid
3. Check for subscription status
4. Offer manual payment option if needed

**Response Template:**
```
Hi {{name}},

I see your payment failed. Common reasons:
- Expired card
- Insufficient funds
- Bank declined transaction

I've sent you a secure payment link to update your card: [link]

If you continue to have issues, we can process payment manually via e-transfer.

Best,
Support Team
```

---

### Issue: "Feature request"

**Solution:**
1. Log in GitHub as issue
2. Add to product backlog
3. Thank user for feedback
4. Set expectation (if planned, mention timeline)

**Response Template:**
```
Hi {{name}},

Thanks for the great suggestion! I've added it to our product backlog.

We review feature requests monthly and prioritize based on user demand. I'll keep you updated if this gets prioritized.

In the meantime, here are some workarounds: [link to docs]

Best,
Support Team
```

---

## 📊 Support Metrics Dashboard

### Weekly Review

Track these metrics weekly:

| Metric | Target | Current |
|--------|--------|---------|
| Average Response Time | < 12 hours | Track |
| Average Resolution Time | < 48 hours | Track |
| Tickets Opened | Track trend | Track |
| Tickets Resolved | Track trend | Track |
| Customer Satisfaction | > 4.5/5 | Track |

---

## 🚨 Escalation Process

### Level 1: Support Team
- Standard tickets
- Common issues
- Documentation questions

### Level 2: Technical Lead
- Escalated from Level 1
- Complex bugs
- Integration issues

### Level 3: Founder/CTO
- Critical bugs
- Security issues
- Strategic feedback

**Escalation Trigger:** Ticket open > 48 hours OR user requests escalation

---

## 🔒 Privacy & Compliance

- ✅ **Data Protection:** All tickets stored securely (Supabase encryption)
- ✅ **User Consent:** Implicit consent when submitting ticket
- ✅ **Data Retention:** Keep tickets for 2 years, then archive
- ✅ **Export:** Users can request ticket history export
- ✅ **Deletion:** Users can request ticket deletion (after resolution)

---

## ✅ Checklist

- [ ] Support form created
- [ ] Ticket database set up
- [ ] Auto-routing configured
- [ ] Response templates written
- [ ] Slack channel created (#support)
- [ ] Email templates set up
- [ ] Metrics dashboard created
- [ ] Escalation process documented

---

## 📚 Resources

- [Zendesk Alternative (Free)](https://www.crisp.chat/) - Free tier available
- [Help Scout](https://www.helpscout.com/) - Paid alternative
- [Supabase Realtime](https://supabase.com/docs/guides/realtime) - For live chat (optional)

---

**Last Updated:** 2025-01-XX  
**Next Review:** Monthly (optimize response times)
