# Google Merchant Center Readiness

**What's for Dinner? — Google Merchant Center Setup**

## Overview

This document outlines the requirements and setup process for Google Merchant Center integration, enabling **What's for Dinner?** to appear in Google Shopping results and optimize product listings.

**Note**: This applies if **What's for Dinner?** sells physical products (e.g., meal kits, cookbooks) or offers merchant services. For app-only businesses, this may not be applicable.

---

## Merchant Center Account Setup

### Account Information
- **Business Name**: What's for Dinner?
- **Website**: https://whats-for-dinner.ca
- **Country**: Canada
- **Currency**: CAD (Canadian Dollar)
- **Language**: English (Canadian), French (Quebec)

### Contact Information
- **Email**: support@whats-for-dinner.ca
- **Phone**: [Your Phone Number]
- **Address**: [Your Business Address - Ontario, Canada]

### Tax Information
- **GST/HST Registration**: [GST/HST Number - if registered]
- **Tax Rate**: 13% (Ontario HST)
- **Tax Collection**: Handled by Stripe/Payment processor

---

## Product Feed Requirements

### Feed Format
- **Format**: XML, CSV, or Google Sheets
- **Update Frequency**: Daily (automated via API)
- **Encoding**: UTF-8

### Required Product Attributes

#### Basic Information
- **id**: Unique product identifier (e.g., `meal-plan-starter`)
- **title**: Product name (e.g., "Starter Meal Plan - Monthly Subscription")
- **description**: Product description (500+ characters)
- **link**: Product URL (e.g., `https://whats-for-dinner.ca/pricing`)
- **image_link**: Product image URL (minimum 100x100px, recommended 800x800px)
- **condition**: `new` (for digital products/subscriptions)

#### Pricing & Availability
- **price**: Price in CAD (e.g., `9.99 CAD`)
- **availability**: `in stock` (for subscriptions), `preorder` (for waitlist)
- **availability_date**: For preorders (ISO 8601 format)

#### Product Categories
- **google_product_category**: `Software > Applications > Mobile Applications`
- **product_type**: `Meal Planning App Subscription`

#### Additional Attributes
- **brand**: `What's for Dinner?`
- **gtin**: Not applicable (digital products)
- **mpn**: Not applicable (digital products)
- **identifier_exists**: `FALSE` (for digital products)

### Sample Product Feed Entry

```xml
<item>
  <id>meal-plan-starter</id>
  <title>Starter Meal Plan - Monthly Subscription</title>
  <description>AI-powered meal planning app with Canadian grocery integration. Save time and money on meal planning. Includes unlimited meal suggestions, grocery list generation, and Canadian store integration.</description>
  <link>https://whats-for-dinner.ca/pricing</link>
  <image_link>https://whats-for-dinner.ca/images/starter-plan.png</image_link>
  <condition>new</condition>
  <availability>in stock</availability>
  <price>9.99 CAD</price>
  <google_product_category>Software > Applications > Mobile Applications</google_product_category>
  <product_type>Meal Planning App Subscription</product_type>
  <brand>What's for Dinner?</brand>
  <identifier_exists>FALSE</identifier_exists>
</item>
```

---

## Product Images

### Requirements
- **Format**: JPG, PNG, or GIF
- **Size**: Minimum 100x100px, recommended 800x800px
- **Aspect Ratio**: Square (1:1)
- **Background**: White or transparent
- **No Text**: No text overlays on product images

### Image Checklist
- ✅ High-quality product images
- ✅ Square aspect ratio (1:1)
- ✅ White background
- ✅ No text overlays
- ✅ Optimized file size (<1MB)

---

## Shipping & Returns

### Shipping Information
- **Shipping Method**: Digital delivery (instant)
- **Shipping Cost**: Free (digital products)
- **Shipping Regions**: Canada (all provinces)

### Returns Policy
- **Returns**: 30-day money-back guarantee
- **Returns URL**: `https://whats-for-dinner.ca/returns`
- **Refund Policy**: Full refund within 30 days of purchase

---

## Feed Automation

### API Integration
- **Google Merchant Center API**: Automated feed updates
- **Update Frequency**: Daily (or real-time for inventory changes)
- **Authentication**: OAuth 2.0

### Feed Generation Script
```javascript
// Example: Generate product feed for Google Merchant Center
const products = [
  {
    id: 'meal-plan-starter',
    title: 'Starter Meal Plan - Monthly Subscription',
    description: '...',
    price: '9.99 CAD',
    availability: 'in stock',
    link: 'https://whats-for-dinner.ca/pricing',
    image_link: 'https://whats-for-dinner.ca/images/starter-plan.png'
  },
  // ... more products
];

// Generate XML feed
const feed = generateMerchantCenterFeed(products);
```

---

## Compliance & Policies

### Google Shopping Policies
- ✅ **Accurate Product Information**: All product details are accurate
- ✅ **Clear Pricing**: Pricing clearly stated in CAD
- ✅ **Return Policy**: 30-day money-back guarantee clearly stated
- ✅ **Contact Information**: Support email and contact info provided

### Canadian Compliance
- ✅ **PIPEDA Compliance**: Privacy policy PIPEDA-compliant
- ✅ **CASL Compliance**: Email marketing CASL-compliant (opt-in)
- ✅ **GST/HST**: Pricing includes GST/HST (13% Ontario)

---

## Performance Optimization

### Feed Optimization
- **Title Optimization**: Include keywords (meal planning, Canadian)
- **Description Optimization**: Include benefits, features, Canadian focus
- **Image Optimization**: High-quality images, optimized file size
- **Category Accuracy**: Correct Google product category

### Shopping Campaign Setup
- **Campaign Type**: Shopping campaigns
- **Budget**: Start with CAD $50-100/month
- **Targeting**: Canada (all provinces)
- **Bidding**: Maximize conversions (or target CPA)

---

## Verification & Testing

### Website Verification
- **Method**: HTML file upload or meta tag
- **Status**: ✅ Verified (if applicable)

### Feed Testing
- **Test Feed**: Submit test feed before going live
- **Validation**: Check for errors, warnings
- **Approval**: Wait for Google approval (typically 24-48 hours)

### Common Issues
- **Missing Required Attributes**: Ensure all required fields are present
- **Invalid Prices**: Ensure prices are in CAD format (e.g., `9.99 CAD`)
- **Image Issues**: Ensure images meet size/format requirements
- **Link Issues**: Ensure product links are accessible

---

## Monitoring & Maintenance

### Feed Health
- **Daily Monitoring**: Check feed status, errors, warnings
- **Performance Metrics**: Track impressions, clicks, conversions
- **Optimization**: Update titles, descriptions, images based on performance

### Updates Required
- **Price Changes**: Update feed when prices change
- **Availability Changes**: Update feed when products go out of stock
- **New Products**: Add new products to feed

---

## Conclusion

**Merchant Center Readiness**: ✅ **READY** (if selling products/subscriptions)

**Note**: This applies primarily if **What's for Dinner?** sells physical products or merchant services. For app-only businesses, Google Merchant Center may not be applicable.

**Next Steps**: 
1. Create Google Merchant Center account
2. Set up product feed (XML/CSV)
3. Submit feed for review
4. Monitor performance and optimize

---

*Last Updated: [Auto-generated via CI]*
