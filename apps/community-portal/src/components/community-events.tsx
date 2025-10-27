'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Users, Clock, ExternalLink } from 'lucide-react'

const upcomingEvents = [
  {
    id: 1,
    title: "Virtual Cooking Class: Italian Cuisine",
    description: "Learn to make authentic Italian pasta and sauces with Chef Maria",
    date: "2024-01-15",
    time: "7:00 PM EST",
    location: "Online",
    attendees: 45,
    maxAttendees: 50,
    price: "Free",
    category: "Cooking Class",
    image: "/images/italian-cooking.jpg",
    host: "Chef Maria",
    verified: true
  },
  {
    id: 2,
    title: "Community Recipe Swap",
    description: "Bring your favorite family recipes and discover new ones from fellow food lovers",
    date: "2024-01-20",
    time: "2:00 PM EST",
    location: "Community Center",
    attendees: 23,
    maxAttendees: 30,
    price: "Free",
    category: "Social Event",
    image: "/images/recipe-swap.jpg",
    host: "Community Team",
    verified: true
  },
  {
    id: 3,
    title: "Baking Workshop: Artisan Breads",
    description: "Master the art of sourdough, focaccia, and other artisan breads",
    date: "2024-01-25",
    time: "10:00 AM EST",
    location: "Local Bakery",
    attendees: 12,
    maxAttendees: 15,
    price: "$25",
    category: "Workshop",
    image: "/images/bread-workshop.jpg",
    host: "Baker Sarah",
    verified: true
  },
  {
    id: 4,
    title: "Food Photography Meetup",
    description: "Learn food styling and photography techniques for social media",
    date: "2024-01-28",
    time: "3:00 PM EST",
    location: "Photography Studio",
    attendees: 8,
    maxAttendees: 12,
    price: "$15",
    category: "Educational",
    image: "/images/food-photography.jpg",
    host: "Photo Pro",
    verified: false
  }
]

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })
}

export function CommunityEvents() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Upcoming Events</span>
          </CardTitle>
          <CardDescription>
            Join our community events and cooking workshops
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-sm">{event.title}</h3>
                    {event.verified && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        ✓
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {event.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {event.category}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{event.attendees}/{event.maxAttendees}</span>
                  </div>
                  <Badge 
                    variant={event.price === "Free" ? "default" : "outline"}
                    className="text-xs"
                  >
                    {event.price}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="text-xs h-7">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                  <Button size="sm" className="text-xs h-7">
                    Join
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          <Button variant="outline" className="w-full mt-4">
            View All Events
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}