import { Suspense } from 'react'
import { CommunityHeader } from '@/components/community-header'
import { FeaturedPosts } from '@/components/featured-posts'
import { CommunityStats } from '@/components/community-stats'
import { RecentPosts } from '@/components/recent-posts'
import { CommunityEvents } from '@/components/community-events'
import { Leaderboard } from '@/components/leaderboard'

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background">
      <CommunityHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Suspense fallback={<div>Loading featured posts...</div>}>
              <FeaturedPosts />
            </Suspense>
            
            <Suspense fallback={<div>Loading recent posts...</div>}>
              <RecentPosts />
            </Suspense>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-8">
            <Suspense fallback={<div>Loading stats...</div>}>
              <CommunityStats />
            </Suspense>
            
            <Suspense fallback={<div>Loading events...</div>}>
              <CommunityEvents />
            </Suspense>
            
            <Suspense fallback={<div>Loading leaderboard...</div>}>
              <Leaderboard />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}
