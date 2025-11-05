"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InViewReveal from "@/components/motion/InViewReveal";
import StaggerList from "@/components/motion/StaggerList";

const features = [
  {
    title: "Lightning Fast",
    description: "Optimized for performance with edge-ready architecture",
    icon: "⚡",
  },
  {
    title: "Accessible",
    description: "WCAG 2.2 AA compliant with keyboard navigation support",
    icon: "♿",
  },
  {
    title: "Mobile First",
    description: "Beautiful experience on all devices with PWA support",
    icon: "📱",
  },
  {
    title: "SEO Optimized",
    description: "Metadata, structured data, and social sharing ready",
    icon: "🔍",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container">
        <InViewReveal>
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              Features
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Everything you need
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built with modern best practices and production-ready standards
            </p>
          </div>
        </InViewReveal>
        <StaggerList className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <InViewReveal key={index} delay={index * 0.1}>
              <Card className="h-full">
                <CardHeader>
                  <div className="mb-2 text-4xl">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </InViewReveal>
          ))}
        </StaggerList>
      </div>
    </section>
  );
}
