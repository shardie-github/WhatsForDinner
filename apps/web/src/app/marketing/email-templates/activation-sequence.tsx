/**
 * Activation Email Sequence
 * 
 * Series of emails to drive user activation and conversion
 */

export const ActivationEmailSequence = [
  {
    delay: 0, // Immediate
    template: 'welcome',
    subject: "Welcome to What's For Dinner! 🍽️",
  },
  {
    delay: 1, // 1 day
    template: 'first-meal',
    subject: 'Ready to plan your first meal? 🎯',
  },
  {
    delay: 3, // 3 days
    template: 'features',
    subject: 'Discover these time-saving features ⚡',
  },
  {
    delay: 7, // 1 week
    template: 'success-stories',
    subject: 'See how others are saving time 💪',
  },
  {
    delay: 14, // 2 weeks
    template: 'upgrade-nudge',
    subject: 'Unlock unlimited meal suggestions 🚀',
  },
];

export const FirstMealEmailTemplate = {
  subject: 'Ready to plan your first meal? 🎯',
  
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <h2 style="color: #111827;">Hi {{name}},</h2>
  
  <p>You signed up a day ago, but we noticed you haven't planned your first meal yet.</p>
  
  <p><strong>It only takes 30 seconds:</strong></p>
  
  <div style="background: #f3f4f6; border-radius: 6px; padding: 20px; margin: 20px 0;">
    <p style="margin: 0;"><strong>Step 1:</strong> Tell us what's in your pantry</p>
    <p style="margin: 10px 0 0 0;"><strong>Step 2:</strong> Get instant AI meal suggestions</p>
    <p style="margin: 10px 0 0 0;"><strong>Step 3:</strong> Generate your grocery list</p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="{{appUrl}}/meal-planner" 
       style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600;">
      Plan Your First Meal →
    </a>
  </div>

  <p style="color: #6b7280; font-size: 14px;">
    💡 <strong>Tip:</strong> The more pantry items you add, the better our suggestions get!
  </p>

  <p style="margin-top: 30px;">
    Questions? Just reply to this email - we're here to help!
  </p>

  <p>Best,<br>The What's For Dinner Team</p>

</body>
</html>
  `,
};

export const FeaturesEmailTemplate = {
  subject: 'Discover these time-saving features ⚡',
  
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <h2 style="color: #111827;">Hi {{name}},</h2>
  
  <p>You've been using What's For Dinner for a few days now. Here are some powerful features you might not know about:</p>
  
  <div style="margin: 20px 0;">
    <h3 style="color: #2563eb;">🛒 Smart Grocery Lists</h3>
    <p>Automatically organize your shopping list by aisle. Save time at the store!</p>
    <a href="{{appUrl}}/grocery" style="color: #2563eb;">Try it now →</a>
  </div>

  <div style="margin: 20px 0;">
    <h3 style="color: #2563eb;">👨‍👩‍👧‍👦 Family Collaboration</h3>
    <p>Share meal plans with your household. Everyone can add preferences and see what's for dinner.</p>
    <a href="{{appUrl}}/family" style="color: #2563eb;">Invite family →</a>
  </div>

  <div style="margin: 20px 0;">
    <h3 style="color: #2563eb;">📊 Nutrition Tracking</h3>
    <p>See calories, macros, and nutrition info for every meal. Hit your health goals effortlessly.</p>
    <a href="{{appUrl}}/nutrition" style="color: #2563eb;">View dashboard →</a>
  </div>

  <p style="margin-top: 30px;">
    Want to unlock unlimited meal suggestions and advanced features?
  </p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="{{appUrl}}/pricing" 
       style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600;">
      Upgrade to Premium →
    </a>
  </div>

  <p>Best,<br>The What's For Dinner Team</p>

</body>
</html>
  `,
};

export const UpgradeNudgeEmailTemplate = {
  subject: 'Unlock unlimited meal suggestions 🚀',
  
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <h2 style="color: #111827;">Hi {{name}},</h2>
  
  <p>You've been using What's For Dinner for 2 weeks - that's awesome! 🎉</p>
  
  <p>You're currently on the <strong>Free plan</strong> with 5 meal suggestions per week. Many users like you upgrade to Premium to get:</p>
  
  <ul style="line-height: 2;">
    <li>✨ <strong>Unlimited</strong> meal suggestions</li>
    <li>📊 Advanced nutrition tracking</li>
    <li>👨‍👩‍👧‍👦 Family collaboration features</li>
    <li>🎯 Custom meal prep guides</li>
    <li>📅 Calendar integration</li>
    <li>⚡ Priority support</li>
  </ul>

  <div style="background: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0;">
    <p style="margin: 0;"><strong>Special Offer:</strong> Get your first month for just $4.99 (50% off)</p>
    <p style="margin: 10px 0 0 0; font-size: 14px;">Use code: <strong>FIRSTMONTH</strong></p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="{{appUrl}}/pricing?code=FIRSTMONTH" 
       style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600;">
      Upgrade Now - 50% Off →
    </a>
  </div>

  <p style="color: #6b7280; font-size: 14px; text-align: center;">
    No credit card required • Cancel anytime • 30-day money-back guarantee
  </p>

  <p style="margin-top: 30px;">
    Questions? Reply to this email - we're here to help!
  </p>

  <p>Best,<br>The What's For Dinner Team</p>

</body>
</html>
  `,
};
