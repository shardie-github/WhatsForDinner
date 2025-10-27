'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, Share2, Bookmark, Clock } from 'lucide-react'

const featuredPosts = [
  {
    id: 1,
    title: "The Ultimate Guide to Perfect Pasta",
    description: "Learn the secrets to making restaurant-quality pasta at home with these professional techniques.",
    author: {
      name: "Chef Maria",
      avatar: "/avatars/chef-maria.jpg",
      verified: true
    },
    image: "/images/pasta-guide.jpg",
    category: "Cooking Tips",
    readTime: "8 min read",
    likes: 1247,
    comments: 89,
    tags: ["pasta", "italian", "cooking", "guide"],
    publishedAt: "2 hours ago"
  },
  {
    id: 2,
    title: "10 Essential Knife Skills Every Home Cook Should Master",
    description: "Master these fundamental knife techniques to improve your cooking efficiency and safety.",
    author: {
      name: "Chef James",
      avatar: "/avatars/chef-james.jpg",
      verified: true
    },
    image: "/images/knife-skills.jpg",
    category: "Techniques",
    readTime: "12 min read",
    likes: 892,
    comments: 56,
    tags: ["knife", "techniques", "safety", "basics"],
    publishedAt: "4 hours ago"
  },
  {
    id: 3,
    title: "Fermentation 101: Making Your Own Sourdough Starter",
    description: "A complete beginner's guide to creating and maintaining a healthy sourdough starter.",
    author: {
      name: "Baker Sarah",
      avatar: "/avatars/baker-sarah.jpg",
      verified: false
    },
    image: "/images/sourdough.jpg",
    category: "Baking",
    readTime: "15 min read",
    likes: 1563,
    comments: 134,
    tags: ["sourdough", "fermentation", "baking", "bread"],
    publishedAt: "6 hours ago"
  }
]

export function FeaturedPosts() {
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
        <h2 className="text-2xl font-bold">Featured Posts</h2>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <div className="grid gap-6">
        {featuredPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="bg-background/80">
                  {post.category}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-background/80 hover:bg-background/90"
                onClick={() => toggleBookmark(post.id)}
              >
                <Bookmark 
                  className={`h-4 w-4 ${
                    bookmarked.includes(post.id) ? 'fill-current' : ''
                  }`} 
                />
              </Button>
            </div>
            
            <CardHeader>
              <div className="flex items-center space-x-2 mb-2">
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
                </div>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{post.publishedAt}</span>
              </div>
              
              <CardTitle className="text-xl">{post.title}</CardTitle>
              <CardDescription className="text-base">
                {post.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
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
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}