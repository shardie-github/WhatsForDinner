'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AnimatedCard } from '@/components/ui/animated-card';
import Navbar from '@/components/Navbar';
import {
  Mail,
  Clock,
  HelpCircle,
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
} from 'lucide-react';

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const faqs = [
    {
      question: "How do I add ingredients to my pantry?",
      answer: "Click the 'Add Ingredient' button in the pantry section, enter the ingredient name and quantity, then save.",
    },
    {
      question: "How are recipes generated?",
      answer: "Our AI analyzes the ingredients in your pantry and your dietary preferences to generate personalized recipe suggestions.",
    },
    {
      question: "Can I customize my dietary preferences?",
      answer: "Yes! Go to your profile settings to set dietary restrictions, cuisine preferences, and cooking time limits.",
    },
    {
      question: "How do I upgrade my subscription?",
      answer: "Visit the Pricing page and select a plan. You can upgrade at any time.",
    },
    {
      question: "Is my data secure?",
      answer: "Yes. We use industry-standard encryption, secure authentication, and follow GDPR/CCPA compliance. See our Privacy Policy for details.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar user={null} />
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-5xl space-y-8">
        {/* Hero Section */}
        <AnimatedCard delay={0}>
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 mb-4">
              <HelpCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-foreground">
              How can we <span className="gradient-text">help you?</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions or reach out to our support team
            </p>
          </div>
        </AnimatedCard>

        {/* Quick Help Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <AnimatedCard delay={100}>
            <Card className="card-interactive border-2 h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Email Support</CardTitle>
                    <CardDescription>Get help from our team</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  For general inquiries, feature requests, or technical support:
                </p>
                <Button asChild className="w-full" size="lg">
                  <a href="mailto:support@whats-for-dinner.com">
                    <Mail className="mr-2 h-4 w-4" />
                    support@whats-for-dinner.com
                  </a>
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Monday - Friday: 9:00 AM - 6:00 PM EST</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  We aim to respond within 24 hours during business days.
                </p>
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={200}>
            <Card className="card-interactive border-2 h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Report an Issue</CardTitle>
                    <CardDescription>Found a bug or experiencing problems?</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Please include: browser type, steps to reproduce, and any error messages.
                </p>
                <Button asChild variant="outline" className="w-full" size="lg">
                  <a href="mailto:bugs@whats-for-dinner.com">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    bugs@whats-for-dinner.com
                  </a>
                </Button>
              </CardContent>
            </Card>
          </AnimatedCard>
        </div>

        {/* FAQ Section */}
        <AnimatedCard delay={300}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <HelpCircle className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <Card
                  key={index}
                  className="card-interactive border-2 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-accent/50 transition-colors text-left"
                  >
                    <span className="font-semibold text-base sm:text-lg pr-4">{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === index && (
                    <CardContent className="pt-0 pb-4 sm:pb-6 px-4 sm:px-6">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </AnimatedCard>

        {/* Legal Section */}
        <AnimatedCard delay={400}>
          <Card className="card-interactive border-2">
            <CardHeader>
              <CardTitle>Legal & Compliance</CardTitle>
              <CardDescription>Important documents and policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href="/terms-of-service"
                className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-all group"
              >
                <span className="font-medium group-hover:text-primary">Terms of Service</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground rotate-[-90deg] group-hover:text-primary" />
              </a>
              <a
                href="/privacy-policy"
                className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-all group"
              >
                <span className="font-medium group-hover:text-primary">Privacy Policy</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground rotate-[-90deg] group-hover:text-primary" />
              </a>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </div>
  );
}
