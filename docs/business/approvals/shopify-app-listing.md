# Shopify App Store Listing Requirements

**What's for Dinner? — Shopify App Store Submission**

## Overview

This document contains all required information for Shopify App Store submission, including app details, functionality, pricing, and support information.

**Note**: This listing is optional and applies only if **What's for Dinner?** integrates with Shopify stores or offers a Shopify app for merchants.

---

## App Information

### Basic Details
- **App Name**: What's for Dinner? Meal Planning
- **App Handle**: `whats-for-dinner-meal-planning`
- **Category**: Food & Beverage, Lifestyle
- **App Type**: Public App (available to all merchants)

### App Icon
- **Format**: 1200x1200px PNG
- **Requirements**: 
  - No text in icon
  - Simple, recognizable design
  - Represents meal planning/recipes

### Screenshots (Required)
- **Desktop**: 1200x630px (minimum 3, recommended 5)
- **Mobile**: 800x600px (optional)

**Screenshot Checklist**:
1. ✅ Dashboard (meal planning interface)
2. ✅ Grocery list integration (Shopify products)
3. ✅ Recipe display (ingredients, instructions)
4. ✅ Settings (preferences, dietary restrictions)
5. ✅ Analytics (meal planning stats)

---

## App Listing

### App Title (50 characters max)
**What's for Dinner? Meal Planning**

### Tagline (80 characters max)
**AI-powered meal planning integrated with your Shopify store**

### Short Description (160 characters max)
**Help customers plan meals and shop groceries seamlessly. AI-powered meal suggestions synced with your Shopify product catalog.**

### Full Description (5,000 characters max)

```
What's for Dinner? Meal Planning — The Shopify app that helps your customers plan meals and shop groceries seamlessly.

🎯 THE PROBLEM
Your customers struggle with meal planning. They spend 40+ minutes daily deciding what to cook, leading to decision fatigue, food waste, and lost sales opportunities.

✨ THE SOLUTION
What's for Dinner? integrates with your Shopify store to offer AI-powered meal planning that drives grocery sales and improves customer experience.

🚀 KEY FEATURES

• MEAL PLANNING FOR CUSTOMERS
  Customers can plan meals using your product catalog. AI-powered suggestions based on dietary preferences, cooking skill level, and available products.

• GROCERY LIST INTEGRATION
  Auto-generated grocery lists sync with your Shopify store. Customers can add items to cart with one click.

• PRODUCT RECOMMENDATIONS
  Suggest complementary products based on meal plans. Increase average order value (AOV) through smart recommendations.

• RECIPE LIBRARY
  Curated recipes that use your products. Showcase your products in recipe context, driving sales.

• SOLO-FRIENDLY PORTIONS
  Perfect for individual shoppers. Portion sizing for 1-2 people, reducing food waste and increasing customer satisfaction.

• CANADIAN-FOCUSED
  Built for Canadian grocery stores and dietary preferences. Supports GST/HST pricing, Canadian product catalogs.

💡 MERCHANT BENEFITS

✅ Increase Sales
  - Drive grocery sales through meal planning
  - Increase AOV with product recommendations
  - Reduce cart abandonment (planned purchases)

✅ Improve Customer Experience
  - Help customers plan meals effortlessly
  - Reduce decision fatigue
  - Build customer loyalty

✅ Reduce Food Waste
  - Smart meal planning reduces waste
  - Customers buy what they need
  - Sustainable shopping practices

📱 CUSTOMER FEATURES

• AI-Powered Meal Suggestions
  Personalized meal suggestions based on preferences, dietary restrictions, and available products.

• Grocery List Sync
  Auto-generated grocery lists sync with your Shopify store. One-click add to cart.

• Recipe Discovery
  Browse recipes that use your products. See ingredients, instructions, and nutritional information.

• Meal Planning Calendar
  Plan meals for the week ahead. Sync with grocery shopping schedule.

🔒 PRIVACY & SECURITY

• PIPEDA-Compliant Privacy
  Customer data handled according to PIPEDA standards. Canadian data residency.

• Secure Integration
  OAuth 2.0 integration with Shopify. No sensitive data stored.

• Data Minimization
  Collect only necessary data for app functionality.

💰 PRICING

• Free Plan: Basic meal planning (up to 100 customers)
• Starter Plan: CAD $29/month — Full features (up to 1,000 customers)
• Pro Plan: CAD $99/month — Advanced features, unlimited customers

All prices include GST/HST (13% Ontario). Annual plans save 17%.

📧 SUPPORT

Questions? Contact us at support@whats-for-dinner.ca
Privacy Policy: https://whats-for-dinner.ca/privacy
Terms of Service: https://whats-for-dinner.ca/terms

---

Install What's for Dinner? Meal Planning today and help your customers plan meals while driving sales.
```

---

## App Functionality

### Core Features
1. **Meal Planning Interface**: Customers can plan meals using merchant's product catalog
2. **Grocery List Integration**: Auto-generated grocery lists sync with Shopify store
3. **Product Recommendations**: Suggest complementary products based on meal plans
4. **Recipe Library**: Curated recipes using merchant's products
5. **Analytics Dashboard**: Track meal planning usage, sales impact

### Technical Integration
- **API**: Shopify Admin API, Storefront API
- **Webhooks**: Order creation, product updates
- **OAuth**: Shopify OAuth 2.0 authentication
- **Data Storage**: Supabase (Canadian data residency)

### App Requirements
- **Shopify Plan**: Works with all Shopify plans (Basic, Shopify, Advanced)
- **Permissions**: `read_products`, `write_orders`, `read_customers` (optional)
- **Compatibility**: Shopify 2.0 themes, Shopify Plus

---

## Privacy & Security

### Privacy Policy URL
`https://whats-for-dinner.ca/privacy`

### Data Collection
- **Customer Data**: Meal plans, preferences (collected with consent)
- **Merchant Data**: Product catalog, orders (required for app functionality)
- **Analytics**: Usage data (opt-in, anonymized)

### Data Security
- **Encryption**: HTTPS in transit, encryption at rest
- **Access Control**: Role-based access control (RBAC)
- **Data Residency**: Canadian data residency (Supabase Canada)
- **Compliance**: PIPEDA-compliant data handling

### Permissions Justification
- **read_products**: Required to display products in meal planning interface
- **write_orders**: Required to add items to cart (optional, can be read-only)
- **read_customers**: Optional (for personalized recommendations)

---

## Support Information

### Support Email
`support@whats-for-dinner.ca`

### Support URL
`https://whats-for-dinner.ca/support`

### Documentation URL
`https://whats-for-dinner.ca/docs/shopify`

### Response Time
- **Standard**: Within 24 hours
- **Urgent**: Within 4 hours (for critical issues)

---

## Pricing & Billing

### Pricing Tiers

#### Free Plan
- **Price**: CAD $0/month
- **Features**: Basic meal planning (up to 100 customers)
- **Limitations**: Limited recipes, no analytics

#### Starter Plan
- **Price**: CAD $29/month (CAD $290/year)
- **Features**: Full meal planning (up to 1,000 customers)
- **Includes**: All recipes, grocery list integration, analytics

#### Pro Plan
- **Price**: CAD $99/month (CAD $990/year)
- **Features**: Advanced features (unlimited customers)
- **Includes**: Custom recipes, advanced analytics, priority support

### Billing Model
- **Recurring Charge**: Monthly or annual subscription
- **Usage Charge**: Optional (per customer, per order)
- **Trial**: 14-day free trial (no credit card required)

### GST/HST
- **Tax Rate**: 13% (Ontario)
- **Included**: All prices include GST/HST
- **Remittance**: Handled by What's for Dinner? (registered for GST/HST)

---

## Review Information

### Testing Instructions
```
What's for Dinner? Meal Planning integrates with Shopify stores to offer meal planning features.

Testing Steps:
1. Install app from Shopify App Store
2. Configure app settings (product catalog, preferences)
3. Test meal planning interface (customer view)
4. Test grocery list integration (add to cart)
5. Test product recommendations
6. Review analytics dashboard

Key Features:
- Meal planning using merchant's product catalog
- Grocery list sync with Shopify store
- Product recommendations
- Recipe library
- Analytics dashboard

All features work seamlessly with Shopify. Privacy policy and terms of service are accessible in-app.
```

### Demo Store
- **URL**: `https://demo-whats-for-dinner.myshopify.com`
- **Credentials**: Provided upon request

---

## Shopify App Store Policies Compliance

### Policy: App Functionality
- ✅ App works as described
- ✅ No misleading claims
- ✅ Features match description

### Policy: Privacy & Data
- ✅ Privacy policy provided
- ✅ Data collection disclosed
- ✅ PIPEDA-compliant data handling

### Policy: Pricing & Billing
- ✅ Pricing clearly stated
- ✅ Billing model transparent
- ✅ Trial period available

### Policy: Support
- ✅ Support contact provided
- ✅ Documentation available
- ✅ Response time stated

---

## Submission Checklist

### Pre-Submission
- ✅ App icon (1200x1200px)
- ✅ Screenshots (desktop, minimum 3)
- ✅ App title (50 characters)
- ✅ Tagline (80 characters)
- ✅ Short description (160 characters)
- ✅ Full description (5,000 characters)
- ✅ Privacy policy URL
- ✅ Support email
- ✅ Pricing tiers defined
- ✅ App functionality documented

### Post-Submission
- ✅ Monitor Shopify Partner Dashboard for review status
- ✅ Respond to review feedback within 24 hours
- ✅ Prepare for potential rejection (have fixes ready)

---

## Common Rejection Reasons & Mitigations

### Rejection: "App Functionality Issues"
- **Issue**: App doesn't work as described
- **Mitigation**: Test thoroughly, ensure all features work

### Rejection: "Privacy Policy Missing"
- **Issue**: Privacy policy not provided or incomplete
- **Mitigation**: Ensure privacy policy is PIPEDA-compliant, accessible

### Rejection: "Pricing Unclear"
- **Issue**: Pricing not clearly stated
- **Mitigation**: Clearly state pricing, billing model, trial period

---

## Conclusion

**Submission Readiness**: ✅ **READY** (if Shopify app is developed)

**Note**: This listing applies only if **What's for Dinner?** offers a Shopify app for merchants. If not, this document serves as a template for future Shopify integration.

**Next Steps**: 
1. Develop Shopify app (if not already done)
2. Submit to Shopify App Store
3. Monitor review status
4. Respond to feedback promptly

---

*Last Updated: [Auto-generated via CI]*
