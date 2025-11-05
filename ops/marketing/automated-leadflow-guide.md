# Automated Lead Flow Guide — Canadian Venture Operations

**Goal:** Capture leads → Route to CRM → Automate follow-up → Convert to customers

---

## 🎯 Overview

This guide walks through setting up a fully automated lead capture and nurturing system using no-code/low-code tools (Zapier/Make, Supabase, Notion, Google Sheets).

**Time to Set Up:** 2-3 hours  
**Monthly Cost:** ~$30 CAD (free tiers available)

---

## 📋 Step-by-Step Setup

### Step 1: Lead Capture Form

**Option A: Google Forms** (Free)
1. Create Google Form: `forms.google.com`
2. Add fields:
   - Name (required)
   - Email (required)
   - Phone (optional)
   - How did you hear about us? (dropdown)
   - Message (optional)
3. Enable "Collect email addresses"
4. Add UTM tracking: `?utm_source=website&utm_medium=form`
5. Embed form on website or share link

**Option B: Typeform** (Free tier: 10 forms/month)
1. Create Typeform account
2. Build form with same fields as above
3. Enable Zapier integration
4. Embed or share link

**Option C: Native Form (Supabase + Next.js)**
- Use existing form at `/contact` or `/signup`
- Store submissions in Supabase `leads` table
- Trigger webhook on insert

---

### Step 2: CRM Setup (Notion)

1. **Create Notion Database**
   - Go to Notion → New → Database → Table
   - Name: "Lead CRM"
   - Add columns:
     - `Name` (Title)
     - `Email` (Email)
     - `Phone` (Phone)
     - `Source` (Select: Website, Social Media, Referral, Other)
     - `Status` (Select: New Lead, Contacted, Qualified, Customer, Lost)
     - `Notes` (Text)
     - `Created` (Date)
     - `Last Contacted` (Date)
     - `Value` (Number) - Estimated customer value

2. **Get Database ID**
   - Copy database URL
   - Extract ID (between `/` and `?`)
   - Example: `notion.so/workspace/DATABASE_ID?v=...`

3. **Set Up Views**
   - "New Leads" (filter: Status = "New Lead")
   - "Hot Leads" (filter: Status = "Qualified")
   - "Customers" (filter: Status = "Customer")

---

### Step 3: Automation (Zapier)

**Zap 1: Form → Notion → Email**

1. **Trigger:** Google Forms / Typeform → New Submission
2. **Action 1:** Notion → Create Database Item
   - Database: Your CRM database ID
   - Name: `{{form.Name}}`
   - Email: `{{form.Email}}`
   - Source: `{{form.UTM_Source}}`
   - Status: "New Lead"
   - Created: `{{form.Timestamp}}`

3. **Action 2:** Gmail → Send Email
   - To: `{{form.Email}}`
   - Subject: "Thanks for reaching out, {{form.Name}}!"
   - Body Template:
     ```
     Hi {{form.Name}},

     Thanks for your interest in What's for Dinner?

     We'll get back to you within 24 hours.

     In the meantime, check out our free meal planning tips:
     [Link to blog post]

     Best,
     The Team
     ```

4. **Action 3:** Slack → Post Message (optional)
   - Channel: `#leads`
   - Message: `🎯 New lead: {{form.Name}} ({{form.Email}})`

5. **Test & Activate**

---

### Step 4: Lead Scoring (Advanced)

**Zap 2: Auto-Score Leads**

1. **Trigger:** Notion → New Database Item
2. **Filter:** Status = "New Lead"
3. **Action:** Zapier Code → Score Lead
   ```javascript
   // Simple scoring logic
   let score = 0;
   
   if (input.email.includes('@company.com')) score += 10; // Corporate email
   if (input.source === 'Referral') score += 5;
   if (input.message.length > 100) score += 3; // Engaged
   
   return { score };
   ```
4. **Action:** Notion → Update Item (add score field)

---

### Step 5: Follow-Up Sequences

**Zap 3: Drip Email Campaign**

1. **Trigger:** Notion → Database Item Updated
2. **Filter:** Status = "New Lead" AND Created > 24 hours ago
3. **Action:** Gmail → Send Email
   - Subject: "Quick question about meal planning"
   - Body: Personalized follow-up with case study

**Zap 4: Re-engagement**

1. **Trigger:** Notion → Database Item Updated
2. **Filter:** Status = "Contacted" AND Last Contacted > 7 days ago
3. **Action:** Gmail → Send Email
   - Subject: "Still interested in meal planning?"
   - Body: Offer discount or free trial

---

### Step 6: Conversion Tracking

**Zap 5: Sale → Update CRM**

1. **Trigger:** Stripe → New Payment
2. **Action:** Notion → Update Database Item
   - Find by Email: `{{stripe.Customer Email}}`
   - Update Status: "Customer"
   - Update Value: `{{stripe.Amount}}`
   - Update Notes: "Converted on {{stripe.Created}}"

---

## 📊 Dashboard Setup

### Google Sheets Dashboard

1. **Create Sheet:** "Lead Analytics"
2. **Columns:**
   - Date
   - Source
   - Status
   - Value
   - Conversion Time (days)

3. **Zap:** Notion → Google Sheets
   - Trigger: New/Updated CRM item
   - Action: Add row to sheet

4. **Add Charts:**
   - Leads by Source (Pie chart)
   - Conversion Rate (Line chart)
   - Revenue by Source (Bar chart)

---

## 🔄 Manual Fallback (If Automation Fails)

### Weekly Manual Process

1. **Export Leads** (if Zapier down)
   - Google Forms → Responses → Download CSV
   - Import to Notion manually

2. **Bulk Email** (if drip fails)
   - Export "New Leads" from Notion
   - Use Mailchimp/Brevo (free tier) for bulk send

3. **Track Conversions** (if Stripe webhook fails)
   - Stripe Dashboard → Export payments CSV
   - Match emails to CRM
   - Update status manually

---

## 📈 Optimization Tips

1. **A/B Test Email Subject Lines**
   - Test 2 variants per campaign
   - Track open rates

2. **Personalize Follow-ups**
   - Use lead's name, company, source
   - Reference their specific message

3. **Automate Lead Qualification**
   - Use Zapier filters to route high-value leads
   - Send to sales team via Slack

4. **Track Lead Sources**
   - Always include UTM parameters
   - Analyze which sources convert best

5. **Set Up Alerts**
   - Slack notification for high-value leads
   - Email alert if form submissions spike

---

## 🔒 Privacy & Compliance (PIPEDA)

- ✅ **Consent:** Capture at form submission ("I agree to be contacted")
- ✅ **Storage:** All data in Supabase/Notion (encrypted)
- ✅ **Access:** Users can request data via `/api/privacy/export`
- ✅ **Deletion:** Users can request deletion via `/api/privacy/delete`
- ✅ **Audit Log:** Track all lead touches in CRM notes

---

## 💰 Cost Breakdown (CAD)

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Google Forms | Free | $0 |
| Notion | Free (personal) | $0 |
| Zapier | Free (100 tasks/month) | $0 |
| Gmail | Free | $0 |
| **Total** | | **$0** |

**Paid Upgrade (if needed):**
- Zapier Starter: $29.99 CAD/month (750 tasks)
- Notion Plus: $12 CAD/month (unlimited blocks)

---

## ✅ Checklist

- [ ] Lead capture form created
- [ ] Notion CRM database set up
- [ ] Zapier account connected
- [ ] Automation zaps tested
- [ ] Email templates written
- [ ] Dashboard created
- [ ] Privacy compliance verified
- [ ] Manual fallback documented

---

**Last Updated:** 2025-01-XX  
**Next Review:** Monthly (optimize conversion rates)
