# CRM Integration Guide — Canadian Venture Operations

**Goal:** Integrate lead capture, customer data, and sales pipeline into a unified CRM system

---

## 🎯 Overview

This guide covers integrating multiple tools (Notion, Airtable, Google Sheets, Supabase) into a cohesive CRM system for tracking leads, customers, and revenue.

**Recommended Stack:**
- **Free Tier:** Notion + Google Sheets + Zapier
- **Paid Tier:** Airtable + HubSpot + Zapier

---

## 📋 CRM Options Comparison

### Option 1: Notion CRM (Recommended for Solo/Small Team)

**Pros:**
- ✅ Free personal plan
- ✅ Beautiful interface
- ✅ Flexible database structure
- ✅ Easy to customize

**Cons:**
- ❌ Limited automation (needs Zapier)
- ❌ No built-in email sequences
- ❌ Limited reporting

**Setup Time:** 2 hours  
**Monthly Cost:** $0 (free) or $12 CAD (Plus)

---

### Option 2: Airtable CRM

**Pros:**
- ✅ Free tier (1,200 records)
- ✅ Powerful automation
- ✅ Rich field types
- ✅ Good mobile app

**Cons:**
- ❌ Can get expensive ($24 CAD/month for Plus)
- ❌ Steeper learning curve

**Setup Time:** 3 hours  
**Monthly Cost:** $0 (free) or $24 CAD (Plus)

---

### Option 3: Google Sheets + Apps Script

**Pros:**
- ✅ Free
- ✅ Familiar interface
- ✅ Easy to share
- ✅ Integrates with everything

**Cons:**
- ❌ No built-in CRM features
- ❌ Manual work required
- ❌ Limited automation

**Setup Time:** 1 hour  
**Monthly Cost:** $0

---

## 🚀 Recommended Setup: Notion CRM

### Step 1: Create CRM Database

1. **Go to Notion** → Create new page → Database → Table

2. **Add Columns:**

   | Column Name | Type | Options |
   |------------|------|---------|
   | Name | Title | - |
   | Email | Email | - |
   | Phone | Phone | - |
   | Company | Text | - |
   | Source | Select | Website, Social Media, Referral, Paid Ads, Other |
   | Status | Select | New Lead, Contacted, Qualified, Proposal Sent, Negotiation, Customer, Lost |
   | Value | Number | Format: CAD |
   | Priority | Select | High, Medium, Low |
   | Notes | Text | - |
   | Created | Date | - |
   | Last Contacted | Date | - |
   | Next Follow-up | Date | - |
   | Tags | Multi-select | Hot Lead, Cold Lead, VIP, Trial User |

3. **Create Views:**
   - **All Leads** (default)
   - **New Leads** (filter: Status = "New Lead")
   - **Hot Leads** (filter: Priority = "High" OR Status = "Qualified")
   - **Customers** (filter: Status = "Customer")
   - **Follow-ups Today** (filter: Next Follow-up = Today)

---

### Step 2: Integrate with Lead Capture

**Zapier Integration:**

1. **Trigger:** Google Forms / Typeform → New Submission
2. **Action:** Notion → Create Database Item
   - Map all form fields to CRM columns
   - Set Status: "New Lead"
   - Set Created: `{{form.Timestamp}}`

3. **Test & Activate**

---

### Step 3: Integrate with Stripe (Sales Tracking)

**Zapier Integration:**

1. **Trigger:** Stripe → New Payment
2. **Action:** Notion → Update Database Item
   - Find by Email: `{{stripe.Customer Email}}`
   - Update Status: "Customer"
   - Update Value: `{{stripe.Amount}}`
   - Update Notes: "Converted: {{stripe.Created}}"

---

### Step 4: Integrate with Support Tickets

**Zapier Integration:**

1. **Trigger:** Typeform → New Support Submission
2. **Action:** Notion → Create/Update Database Item
   - Find by Email: `{{form.Email}}`
   - Update Notes: "Support ticket: {{form.Subject}}"
   - Update Last Contacted: Today

---

### Step 5: Set Up Automated Follow-ups

**Zapier Integration:**

1. **Trigger:** Schedule → Every Day at 9 AM
2. **Action:** Notion → Filter Database Items
   - Filter: Next Follow-up = Today AND Status ≠ "Customer"
3. **Action:** Gmail → Send Email
   - Personalize with CRM data
   - Update "Last Contacted" in CRM

---

## 📊 Reporting Dashboard

### Google Sheets Dashboard

1. **Create Sheet:** "CRM Analytics"

2. **Add Data via Zapier:**
   - Trigger: Notion → Database Item Updated
   - Action: Google Sheets → Add Row
   - Columns: Date, Name, Status, Value, Source

3. **Create Charts:**
   - **Pipeline Value:** SUM of Value where Status ≠ "Customer"
   - **Conversion Rate:** (Customers / Total Leads) * 100
   - **Leads by Source:** Pie chart
   - **Revenue by Month:** Line chart

---

## 🔄 Advanced: Airtable CRM Setup

### Step 1: Create Base

1. **Go to Airtable** → Create new base → "CRM"

2. **Create Tables:**

   **Leads Table:**
   - Name, Email, Phone, Source, Status, Value, Created, Notes

   **Deals Table:**
   - Name, Customer (link to Leads), Value, Stage, Close Date, Probability

   **Activities Table:**
   - Customer (link to Leads), Type (Call, Email, Meeting), Date, Notes

3. **Link Tables:**
   - Leads → Deals (one-to-many)
   - Leads → Activities (one-to-many)

---

### Step 2: Automation

**Airtable Automation:**

1. **When:** New record in Leads
2. **Action:** Send email (via Zapier integration)
3. **Action:** Create activity record

---

## 🔒 Privacy & Compliance

- ✅ **Data Storage:** Encrypted (Supabase/Notion/Airtable)
- ✅ **Access Control:** Team members only
- ✅ **Export:** Users can request data export
- ✅ **Deletion:** Users can request deletion
- ✅ **Audit Log:** Track all CRM touches

---

## 💰 Cost Breakdown (CAD)

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Notion | Free (personal) | $12/month (Plus) |
| Airtable | 1,200 records | $24/month (Plus) |
| Google Sheets | Free | Free |
| Zapier | 100 tasks/month | $29.99/month (Starter) |

**Recommended:** Start with Notion (free) + Zapier (free), upgrade as needed

---

## ✅ Checklist

- [ ] CRM database created
- [ ] Lead capture integrated
- [ ] Stripe sales integrated
- [ ] Support tickets integrated
- [ ] Follow-up automation set up
- [ ] Dashboard created
- [ ] Team access configured
- [ ] Privacy compliance verified

---

## 📚 Resources

- [Notion CRM Templates](https://www.notion.so/templates/crm)
- [Zapier CRM Integrations](https://zapier.com/apps/crm/integrations)
- [Airtable CRM Guide](https://airtable.com/guides/crm)

---

**Last Updated:** 2025-01-XX  
**Next Review:** Quarterly (optimize workflows)
