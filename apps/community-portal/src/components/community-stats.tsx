'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, MessageCircle, Heart, Award, Calendar } from 'lucide-react'

const stats = [
  {
    title: "Active Members",
    value: "12,847",
    change: "+12%",
    trend: "up",
    icon: Users,
    description: "Members online this week"
  },
  {
    title: "Posts This Week",
    value: "1,234",
    change: "+8%",
    trend: "up",
    icon: MessageCircle,
    description: "New posts and discussions"
  },
  {
    title: "Total Recipes",
    value: "8,456",
    change: "+15%",
    trend: "up",
    icon: Heart,
    description: "Community-shared recipes"
  },
  {
    title: "Events This Month",
    value: "23",
    change: "+3",
    trend: "up",
    icon: Calendar,
    description: "Cooking events and workshops"
  }
]

const topContributors = [
  {
    name: "Chef Maria",
    recipes: 156,
    likes: 1247,
    avatar: "/avatars/chef-maria.jpg",
    verified: true
  },
  {
    name: "Baker Sarah",
    recipes: 134,
    likes: 892,
    avatar: "/avatars/baker-sarah.jpg",
    verified: false
  },
  {
    name: "Chef James",
    recipes: 98,
    likes: 756,
    avatar: "/avatars/chef-james.jpg",
    verified: true
  }
]

export function CommunityStats() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Community Stats</span>
          </CardTitle>
          <CardDescription>
            Real-time community activity and engagement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{stat.title}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{stat.value}</p>
                <Badge 
                  variant={stat.trend === 'up' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Top Contributors</span>
          </CardTitle>
          <CardDescription>
            Most active community members this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topContributors.map((contributor, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {contributor.name[0]}
                      </span>
                    </div>
                    {contributor.verified && (
                      <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-xs text-primary-foreground">✓</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{contributor.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {contributor.recipes} recipes • {contributor.likes} likes
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  #{index + 1}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}