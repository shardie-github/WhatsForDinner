interface SkeletonLoaderProps {
  className?: string
}

export function SkeletonLoader({ className = '' }: SkeletonLoaderProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  )
}

export function RecipeCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <SkeletonLoader className="h-6 w-3/4 mb-2" />
        <div className="flex items-center space-x-4 mb-4">
          <SkeletonLoader className="h-4 w-20" />
          <SkeletonLoader className="h-4 w-16" />
        </div>
        <div className="mb-4">
          <SkeletonLoader className="h-4 w-24 mb-2" />
          <div className="space-y-1">
            <SkeletonLoader className="h-3 w-full" />
            <SkeletonLoader className="h-3 w-4/5" />
            <SkeletonLoader className="h-3 w-3/4" />
          </div>
        </div>
        <SkeletonLoader className="h-4 w-32 mb-4" />
        <SkeletonLoader className="h-8 w-full" />
      </div>
    </div>
  )
}

export function PantryItemSkeleton() {
  return (
    <div className="px-6 py-4 flex items-center justify-between">
      <SkeletonLoader className="h-6 w-32" />
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <SkeletonLoader className="w-8 h-8 rounded-full" />
          <SkeletonLoader className="w-8 h-4" />
          <SkeletonLoader className="w-8 h-8 rounded-full" />
        </div>
        <SkeletonLoader className="w-5 h-5" />
      </div>
    </div>
  )
}

export function InputPromptSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <SkeletonLoader className="h-4 w-48 mb-2" />
        <div className="flex space-x-2">
          <SkeletonLoader className="flex-1 h-10" />
          <SkeletonLoader className="w-16 h-10" />
        </div>
      </div>
      <div>
        <SkeletonLoader className="h-4 w-32 mb-2" />
        <div className="flex flex-wrap gap-2">
          <SkeletonLoader className="h-6 w-16 rounded-full" />
          <SkeletonLoader className="h-6 w-20 rounded-full" />
          <SkeletonLoader className="h-6 w-14 rounded-full" />
        </div>
      </div>
      <div>
        <SkeletonLoader className="h-4 w-48 mb-2" />
        <SkeletonLoader className="w-full h-10" />
      </div>
      <SkeletonLoader className="w-full h-12" />
    </div>
  )
}