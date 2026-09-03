/**
 * Welcome Email Template
 * 
 * First email in onboarding sequence
 * Optimized for engagement and conversion
 */

export const WelcomeEmailTemplate = {
  subject: "Welcome to What's For Dinner! 🍽️",
  
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">What's For Dinner</h1>
    <p style="color: #6b7280; margin: 5px 0 0 0;">AI-Powered Meal Planning</p>
  </div>

  <!-- Main Content -->
  <div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #111827; margin-top: 0;">Welcome, {{name}}! 👋</h2>
    
    <p>We're thrilled to have you join thousands of families who are saving time and eating better with What's For Dinner.</p>
    
    <p><strong>Here's what you can do right now:</strong></p>
    
    <div style="background: white; border-radius: 6px; padding: 20px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #2563eb;">🚀 Quick Start (2 minutes)</h3>
      <ol style="margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 10px;">Add your pantry items</li>
        <li style="margin-bottom: 10px;">Get your first AI meal suggestion</li>
        <li style="margin-bottom: 10px;">Generate your grocery list</li>
      </ol>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{appUrl}}/onboarding" 
         style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600;">
        Start Planning Meals →
      </a>
    </div>

    <!-- Value Props -->
    <div style="margin-top: 30px;">
      <h3 style="color: #111827;">What makes us different:</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>✨ <strong>AI-powered</strong> - Get personalized suggestions in seconds</li>
        <li>⏱️ <strong>Time-saving</strong> - Save 2+ hours per week</li>
        <li>🌱 <strong>Waste-reducing</strong> - Use what you have, buy what you need</li>
        <li>👨‍👩‍👧‍👦 <strong>Family-friendly</strong> - Keep everyone happy</li>
      </ul>
    </div>
  </div>

  <!-- Help Section -->
  <div style="text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px; margin-bottom: 20px;">
    <p style="margin: 0 0 10px 0;"><strong>Need help getting started?</strong></p>
    <p style="margin: 0;">
      <a href="{{appUrl}}/help" style="color: #2563eb; text-decoration: none;">Visit our Help Center</a> • 
      <a href="{{appUrl}}/demo" style="color: #2563eb; text-decoration: none;">Watch Demo Video</a>
    </p>
  </div>

  <!-- Footer -->
  <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px;">
    <p>You're receiving this because you signed up for What's For Dinner.</p>
    <p>
      <a href="{{unsubscribeUrl}}" style="color: #6b7280;">Unsubscribe</a> • 
      <a href="{{appUrl}}/privacy" style="color: #6b7280;">Privacy Policy</a>
    </p>
    <p style="margin-top: 20px;">© 2025 What's For Dinner. All rights reserved.</p>
  </div>

</body>
</html>
  `,
  
  text: `
Welcome to What's For Dinner! 🍽️

Hi {{name}},

We're thrilled to have you join thousands of families who are saving time and eating better.

QUICK START (2 minutes):
1. Add your pantry items
2. Get your first AI meal suggestion  
3. Generate your grocery list

Start planning: {{appUrl}}/onboarding

WHAT MAKES US DIFFERENT:
✨ AI-powered - Get personalized suggestions in seconds
⏱️ Time-saving - Save 2+ hours per week
🌱 Waste-reducing - Use what you have, buy what you need
👨‍👩‍👧‍👦 Family-friendly - Keep everyone happy

Need help? Visit {{appUrl}}/help or watch our demo: {{appUrl}}/demo

---
© 2025 What's For Dinner
Unsubscribe: {{unsubscribeUrl}}
  `,
};
