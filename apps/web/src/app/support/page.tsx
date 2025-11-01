import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support - What\'s for Dinner?',
  description: 'Get help and support for What\'s for Dinner?',
};

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Support Center</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Get Help</h2>
          <div className="bg-card rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Email Support</h3>
              <p className="text-muted-foreground mb-2">
                For general inquiries, feature requests, or technical support:
              </p>
              <a 
                href="mailto:support@whats-for-dinner.com" 
                className="text-primary hover:underline"
              >
                support@whats-for-dinner.com
              </a>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Business Hours</h3>
              <p className="text-muted-foreground">
                Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                We aim to respond within 24 hours during business days.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="bg-card rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">
                How do I add ingredients to my pantry?
              </summary>
              <p className="mt-2 text-muted-foreground">
                Click the "Add Ingredient" button in the pantry section, enter the ingredient name and quantity, then save.
              </p>
            </details>

            <details className="bg-card rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">
                How are recipes generated?
              </summary>
              <p className="mt-2 text-muted-foreground">
                Our AI analyzes the ingredients in your pantry and your dietary preferences to generate personalized recipe suggestions.
              </p>
            </details>

            <details className="bg-card rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">
                Can I customize my dietary preferences?
              </summary>
              <p className="mt-2 text-muted-foreground">
                Yes! Go to your profile settings to set dietary restrictions, cuisine preferences, and cooking time limits.
              </p>
            </details>

            <details className="bg-card rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">
                How do I upgrade my subscription?
              </summary>
              <p className="mt-2 text-muted-foreground">
                Visit the <a href="/pricing" className="text-primary hover:underline">Pricing</a> page and select a plan. You can upgrade at any time.
              </p>
            </details>

            <details className="bg-card rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">
                Is my data secure?
              </summary>
              <p className="mt-2 text-muted-foreground">
                Yes. We use industry-standard encryption, secure authentication, and follow GDPR/CCPA compliance. See our <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a> for details.
              </p>
            </details>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Report an Issue</h2>
          <div className="bg-card rounded-lg p-6">
            <p className="text-muted-foreground mb-4">
              Found a bug or experiencing an issue? Please email us at:
            </p>
            <a 
              href="mailto:bugs@whats-for-dinner.com" 
              className="text-primary hover:underline font-semibold"
            >
              bugs@whats-for-dinner.com
            </a>
            <p className="text-sm text-muted-foreground mt-4">
              Please include: browser type, steps to reproduce, and any error messages you see.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Legal & Compliance</h2>
          <div className="bg-card rounded-lg p-6 space-y-2">
            <a href="/terms-of-service" className="block text-primary hover:underline">
              Terms of Service
            </a>
            <a href="/privacy-policy" className="block text-primary hover:underline">
              Privacy Policy
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
