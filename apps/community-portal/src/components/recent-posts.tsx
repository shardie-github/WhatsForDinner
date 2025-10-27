'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, Share2, Bookmark, Clock, MoreHorizontal } from 'lucide-react'

const recentPosts = [
  {
    id: 1,
    title: "Quick 15-minute stir fry recipe",
    description: "Perfect for busy weeknights when you need something fast and delicious.",
    author: {
      name: "Quick Cook",
      avatar: "/avatars/quick-cook.jpg",
      verified: false
    },
    category: "Quick Meals",
    readTime: "3 min read",
    likes: 45,
    comments: 12,
    tags: ["stir-fry", "quick", "asian", "vegetables"],
    publishedAt: "30 min ago"
  },
  {
    id: 2,
    title: "My grandmother's secret cookie recipe",
    description: "After years of begging, she finally shared her famous chocolate chip cookie recipe with me.",
    author: {
      name: "Family Baker",
      avatar: "/avatars/family-baker.jpg",
      verified: true
    },
    category: "Baking",
    readTime: "5 min read",
    likes: 78,
    comments: 23,
    tags: ["cookies", "family", "chocolate", "secret"],
    publishedAt: "1 hour ago"
  },
  {
    id: 3,
    title: "Tips for perfect rice every time",
    description: "Learn the water-to-rice ratio and cooking techniques for fluffy, perfect rice.",
    author: {
      name: "Rice Master",
      avatar: "/avatars/rice-master.jpg",
      verified: false
    },
    category: "Cooking Tips",
    readTime: "4 min read",
    likes: 32,
    comments: 8,
    tags: ["rice", "tips", "basics", "cooking"],
    publishedAt: "2 hours ago"
  },
  {
    id: 4,
    title: "Homemade pasta sauce that beats store-bought",
    description: "This simple recipe will make you never want to buy jarred sauce again.",
    author: {
      name: "Sauce Expert",
      avatar: "/avatars/sauce-expert.jpg",
      verified: true
    },
    category: "Sauces",
    readTime: "6 min read",
    likes: 91,
    comments: 34,
    tags: ["pasta", "sauce", "homemade", "italian"],
    publishedAt: "3 hours ago"
  },
  {
    id: 5,
    title: "Vegetarian meal prep ideas for the week",
    description: "Easy, nutritious meals you can prepare in advance for busy schedules.",
    author: {
      name: "Meal Prep Pro",
      avatar: "/avatars/meal-prep-pro.jpg",
      verified: false
    },
    category: "Meal Prep",
    readTime: "7 min read",
    likes: 67,
    comments: 19,
    tags: ["meal-prep", "vegetarian", "healthy", "planning"],
    publishedAt: "4 hours ago"
  }
]

export function RecentPosts() {
  const [bookmarked, setBookmarked] = useState<number[]>([])

  const toggleBookmark = (postId: number) => {
    setBookmarked(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recent Posts</h2>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {recentPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium">{post.author.name}</span>
                    {post.author.verified && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        ✓
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{post.publishedAt}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleBookmark(post.id)}
                  >
                    <Bookmark 
                      className={`h-4 w-4 ${
                        bookmarked.includes(post.id) ? 'fill-current' : ''
                      }`} 
                    />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <CardTitle className="text-lg mb-2">{post.title}</CardTitle>
                  <CardDescription className="text-base">
                    {post.description}
                  </CardDescription>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}