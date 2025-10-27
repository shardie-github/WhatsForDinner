'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Medal, Award, TrendingUp, Heart, MessageCircle } from 'lucide-react'

const leaderboardData = [
  {
    rank: 1,
    name: "Chef Maria",
    avatar: "/avatars/chef-maria.jpg",
    verified: true,
    points: 1247,
    recipes: 156,
    likes: 3247,
    comments: 892,
    badge: "Master Chef",
    badgeColor: "bg-yellow-500",
    change: "+12%"
  },
  {
    rank: 2,
    name: "Baker Sarah",
    avatar: "/avatars/baker-sarah.jpg",
    verified: false,
    points: 1089,
    recipes: 134,
    likes: 2891,
    comments: 756,
    badge: "Baking Expert",
    badgeColor: "bg-orange-500",
    change: "+8%"
  },
  {
    rank: 3,
    name: "Chef James",
    avatar: "/avatars/chef-james.jpg",
    verified: true,
    points: 956,
    recipes: 98,
    likes: 2156,
    comments: 634,
    badge: "Recipe Master",
    badgeColor: "bg-blue-500",
    change: "+15%"
  },
  {
    rank: 4,
    name: "Quick Cook",
    avatar: "/avatars/quick-cook.jpg",
    verified: false,
    points: 823,
    recipes: 87,
    likes: 1923,
    comments: 445,
    badge: "Speed Chef",
    badgeColor: "bg-green-500",
    change: "+5%"
  },
  {
    rank: 5,
    name: "Family Baker",
    avatar: "/avatars/family-baker.jpg",
    verified: true,
    points: 789,
    recipes: 76,
    likes: 1876,
    comments: 523,
    badge: "Family Recipes",
    badgeColor: "bg-purple-500",
    change: "+3%"
  },
  {
    rank: 6,
    name: "Rice Master",
    avatar: "/avatars/rice-master.jpg",
    verified: false,
    points: 654,
    recipes: 65,
    likes: 1456,
    comments: 389,
    badge: "Grain Expert",
    badgeColor: "bg-amber-500",
    change: "+7%"
  },
  {
    rank: 7,
    name: "Sauce Expert",
    avatar: "/avatars/sauce-expert.jpg",
    verified: true,
    points: 612,
    recipes: 54,
    likes: 1234,
    comments: 312,
    badge: "Sauce Master",
    badgeColor: "bg-red-500",
    change: "+9%"
  },
  {
    rank: 8,
    name: "Meal Prep Pro",
    avatar: "/avatars/meal-prep-pro.jpg",
    verified: false,
    points: 578,
    recipes: 43,
    likes: 1098,
    comments: 267,
    badge: "Prep Specialist",
    badgeColor: "bg-teal-500",
    change: "+4%"
  }
]

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />
    default:
      return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
  }
}

export function Leaderboard() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Community Leaderboard</span>
          </CardTitle>
          <CardDescription>
            Top contributors this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboardData.map((user) => (
              <div key={user.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankIcon(user.rank)}
                  </div>
                  
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    {user.verified && (
                      <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-xs text-primary-foreground">✓</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${user.badgeColor} text-white border-0`}
                      >
                        {user.badge}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{user.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{user.comments}</span>
                      </div>
                      <span>{user.recipes} recipes</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold">{user.points}</p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-500">{user.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your rank: #12</span>
              <span className="text-muted-foreground">Points: 456</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}