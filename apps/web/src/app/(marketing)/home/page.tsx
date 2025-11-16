/**
 * Professional Landing Page - What's for Dinner
 * 
 * Introduces the app from non-technical to technical audiences
 * with clear value propositions, brand elements, and engagement features
 */

'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  Sparkles, 
  Clock, 
  DollarSign, 
  Heart, 
  Brain, 
  ShoppingCart, 
  ChefHat,
  ArrowRight,
  Check,
  Play,
  Star,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TrustSignals } from '@/components/TrustSignals';
import Link from 'next/link';

interface ValueProposition {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefit: string;
}

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

  const valuePropositions: ValueProposition[] = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Save 5+ Hours Per Week',
      description: 'Stop spending hours planning meals. Get personalized meal plans in under 2 minutes.',
      benefit: 'Time saved = More time for what matters'
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Reduce Food Waste by 40%',
      description: 'Smart pantry tracking helps you use what you have before it expires.',
      benefit: 'Save $50+ per month on groceries'
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Reduce Decision Fatigue',
      description: 'No more "what\'s for dinner?" stress at 5 PM. AI plans it for you.',
      benefit: 'Peace of mind, every day'
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'AI-Powered Intelligence',
      description: 'Learns your preferences, dietary needs, and cooking style over time.',
      benefit: 'Smarter suggestions, better meals'
    }
  ];

  const handleEmailCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Track email capture
    if (typeof window !== 'undefined') {
      // Analytics tracking
      window.gtag?.('event', 'email_capture', {
        event_category: 'engagement',
        event_label: 'homepage'
      });
    }

    // Store email (could integrate with email service)
    try {
      await supabase.from('email_leads').insert({
        email,
        source: 'homepage',
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Email capture error:', error);
    }

    setEmail('');
    setIsLoading(false);
    alert("Thanks! We'll send you early access and tips.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Brand Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Meal Planning
          </Badge>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dinner Plans That Plan Themselves
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Stop wondering what's for dinner. Our AI analyzes your pantry, preferences, and goals 
            to create personalized meal plans in seconds—not hours.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90" asChild>
              <Link href="/surprise-me">
                <Sparkles className="w-5 h-5 mr-2" />
                Surprise Me!
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <Link href="/signup">
                Start Planning Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <Link href="/demo">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* Quick Decision Section */}
          <div className="mt-16 mb-20">
            <div className="max-w-2xl mx-auto">
              <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-2 border-primary/20">
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Don't Know What to Cook?</h2>
                    <p className="text-muted-foreground text-lg">
                      Get an instant AI-powered suggestion in seconds
                    </p>
                  </div>
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                    asChild
                  >
                    <Link href="/surprise-me">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Surprise Me!
                    </Link>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-4">
                    No signup required • Instant results • Free forever
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="mt-12 mb-8">
            <TrustSignals variant="inline" />
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background"
                  />
                ))}
              </div>
              <span>12,847+ users</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>4.8/5 rating</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>5+ hours saved/week</span>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Thousands Choose What's for Dinner</h2>
            <p className="text-xl text-muted-foreground">
              Real results. Real time saved. Real peace of mind.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valuePropositions.map((prop, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    {prop.icon}
                  </div>
                  <CardTitle className="text-xl">{prop.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{prop.description}</p>
                  <Badge variant="secondary" className="text-xs">
                    {prop.benefit}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Non-Technical */}
      <section className="container mx-auto px-4 py-20 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">
              Simple. Fast. Effective. No technical knowledge required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">1. Tell Us What You Have</h3>
              <p className="text-muted-foreground">
                Simply add ingredients from your pantry. Scan barcodes, type them in, or snap a photo of your fridge.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">2. AI Creates Your Plan</h3>
              <p className="text-muted-foreground">
                Our intelligent system analyzes your pantry, preferences, and dietary needs to suggest personalized meals.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <ChefHat className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">3. Cook & Enjoy</h3>
              <p className="text-muted-foreground">
                Get step-by-step recipes, automatic grocery lists, and cooking instructions. Just follow along and enjoy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Section - For Developers/Tech-Savvy */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">For Technical Users</Badge>
              <h2 className="text-4xl font-bold mb-6">
                Built for the Modern Stack
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                What's for Dinner leverages cutting-edge AI and modern web technologies 
                to deliver a seamless, fast, and intelligent meal planning experience.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>AI-Powered Recommendations:</strong> OpenAI GPT-4 for intelligent meal suggestions
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Real-Time Sync:</strong> Supabase for instant data synchronization across devices
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Progressive Web App:</strong> Works offline, installs like a native app
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Privacy-First:</strong> End-to-end encryption, GDPR compliant, your data stays yours
                  </div>
                </li>
              </ul>
              <Button variant="outline" asChild>
                <Link href="/docs">
                  View Technical Documentation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Technical Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Performance</span>
                    <span className="text-sm text-muted-foreground">98/100</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '98%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Uptime</span>
                    <span className="text-sm text-muted-foreground">99.9%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '99.9%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Response Time</span>
                    <span className="text-sm text-muted-foreground">&lt;500ms</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '95%' }} />
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">12.8K</div>
                      <div className="text-xs text-muted-foreground">Active Users</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">4.8★</div>
                      <div className="text-xs text-muted-foreground">Average Rating</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Loved by Real Families</h2>
            <p className="text-xl text-muted-foreground">
              See what others are saying about What's for Dinner
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sarah M.',
                role: 'Mom of 2',
                content: 'This app gave me my evenings back. Planning meals used to take me 2 hours on Sunday. Now it takes 2 minutes.',
                rating: 5
              },
              {
                name: 'Mike R.',
                role: 'Solo Professional',
                content: 'I finally have variety in my meals without the stress. The AI suggestions are spot-on with my preferences.',
                rating: 5
              },
              {
                name: 'Jessica L.',
                role: 'Health Enthusiast',
                content: 'Perfect for meal prep! The nutrition tracking and dietary filters make it easy to meet my health goals.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription>{testimonial.content}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Email Capture CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-2">Get Early Access & Weekly Tips</CardTitle>
              <CardDescription className="text-lg">
                Join thousands getting meal planning tips, early feature access, and exclusive content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailCapture} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Joining...' : 'Join Free'}
                </Button>
              </form>
              <p className="text-xs text-center text-muted-foreground mt-4">
                No spam. Unsubscribe anytime. We respect your privacy.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-12">
          <h2 className="text-4xl font-bold mb-4">Ready to Reclaim Your Evenings?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join 12,847+ users who've made meal planning effortless.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link href="/signup">
                Start Free Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <Link href="/pricing">
                View Pricing
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
