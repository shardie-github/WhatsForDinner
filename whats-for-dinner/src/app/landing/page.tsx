'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ChefHat, 
  Zap, 
  Users, 
  Crown, 
  Check, 
  Star,
  ArrowRight,
  Sparkles,
  Shield,
  BarChart3
} from 'lucide-react'

const features = [
  {
    icon: ChefHat,
    title: 'AI-Powered Recipes',
    description: 'Get personalized meal suggestions based on your pantry ingredients and dietary preferences using advanced AI technology.'
  },
  {
    icon: Zap,
    title: 'Instant Generation',
    description: 'Generate multiple recipe options in seconds, complete with ingredients, instructions, and nutritional information.'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Share recipes and pantry lists with family members or team members for seamless meal planning.'
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'Track your cooking patterns, popular ingredients, and get insights to improve your meal planning.'
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is protected with enterprise-grade security and privacy controls.'
  },
  {
    icon: Sparkles,
    title: 'Adaptive Learning',
    description: 'The AI learns from your preferences and feedback to provide increasingly better recommendations.'
  }
]

const plans = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for trying out the service',
    features: [
      '3 AI meals per day',
      '1 pantry list',
      'Basic recipes',
      'Community support'
    ],
    cta: 'Get Started Free',
    popular: false
  },
  {
    name: 'Pro',
    price: 9.99,
    period: 'month',
    description: 'For individuals who love cooking',
    features: [
      'Unlimited AI meals',
      'Unlimited pantry lists',
      'AI nutrition summaries',
      'Advanced recipe filtering',
      'Export recipes',
      'Priority support'
    ],
    cta: 'Start Pro Trial',
    popular: true
  },
  {
    name: 'Family',
    price: 19.99,
    period: 'month',
    description: 'Perfect for families and teams',
    features: [
      'Everything in Pro',
      'Up to 5 family members',
      'Shared pantry lists',
      'Family meal planning',
      'Team analytics',
      'Priority support'
    ],
    cta: 'Start Family Trial',
    popular: false
  }
]

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Food Blogger',
    content: 'What\'s for Dinner has revolutionized how I plan meals. The AI suggestions are spot-on and save me hours every week.',
    rating: 5
  },
  {
    name: 'Mike Chen',
    role: 'Busy Parent',
    content: 'As a working parent, I love how quickly I can get dinner ideas based on what\'s actually in my fridge.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'Nutritionist',
    content: 'The nutritional analysis feature helps my clients make better food choices while keeping meals interesting.',
    rating: 5
  }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                What's for Dinner?
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/auth" className="text-gray-600 hover:text-gray-900">
                Sign In
              </Link>
              <Link href="/auth">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Never Wonder
              <span className="text-blue-600"> What's for Dinner</span>
              Again
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Get AI-powered meal suggestions based on your pantry ingredients. 
              Save time, reduce waste, and discover amazing new recipes every day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="text-lg px-8 py-4">
                  Start Cooking Smarter
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Smart Meal Planning
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed to make cooking easier and more enjoyable
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your needs. Upgrade or downgrade anytime.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-gray-500">/{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-3" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Home Cooks Everywhere
            </h2>
            <p className="text-xl text-gray-600">
              See what our users are saying about their experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Meal Planning?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of users who are already cooking smarter with AI-powered meal suggestions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 text-white border-white hover:bg-white hover:text-blue-600">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <ChefHat className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">What's for Dinner?</span>
              </Link>
              <p className="text-gray-400">
                AI-powered meal planning that makes cooking easier and more enjoyable.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white">Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/status" className="hover:text-white">Status</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-white">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 What's for Dinner? All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}