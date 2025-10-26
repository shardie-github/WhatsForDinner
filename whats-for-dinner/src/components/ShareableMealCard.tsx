'use client'

import { useState, useEffect } from 'react'
import { UGCGrowth, MealCard } from '@/lib/ugcGrowth'

interface ShareableMealCardProps {
  recipeData: {
    recipe_name: string
    cooking_time: number
    difficulty_level: 'easy' | 'medium' | 'hard'
    cuisine_type: string
    dietary_tags: string[]
    nutrition_info: {
      calories: number
      protein: number
      carbs: number
      fat: number
    }
    image_url?: string
  }
  userId: string
  onShare?: (shareId: string) => void
}

export default function ShareableMealCard({ recipeData, userId, onShare }: ShareableMealCardProps) {
  const [mealCard, setMealCard] = useState<MealCard | null>(null)
  const [shareSuggestions, setShareSuggestions] = useState<any>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [customMessage, setCustomMessage] = useState('')
  const [isSharing, setIsSharing] = useState(false)
  const [shareUrls, setShareUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    createMealCard()
    loadShareSuggestions()
  }, [])

  const createMealCard = async () => {
    try {
      const card = await UGCGrowth.createMealCard(userId, recipeData)
      setMealCard(card)
    } catch (error) {
      console.error('Error creating meal card:', error)
    }
  }

  const loadShareSuggestions = async () => {
    try {
      const suggestions = await UGCGrowth.generateShareSuggestions(userId, recipeData)
      setShareSuggestions(suggestions)
      setSelectedPlatforms(suggestions.optimal_platforms)
    } catch (error) {
      console.error('Error loading share suggestions:', error)
    }
  }

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    )
  }

  const handleShare = async () => {
    if (!mealCard || selectedPlatforms.length === 0) return

    setIsSharing(true)
    try {
      await UGCGrowth.shareToSocial(mealCard.id, selectedPlatforms, customMessage)
      
      // Generate share URLs for the selected platforms
      const { share_urls } = await UGCGrowth.createShareableMealCardData(recipeData)
      setShareUrls(share_urls)
      
      if (onShare) {
        onShare(mealCard.id)
      }
      
      alert('Content shared successfully!')
    } catch (error) {
      console.error('Error sharing content:', error)
      alert('Failed to share content')
    } finally {
      setIsSharing(false)
    }
  }

  const openShareUrl = (platform: string) => {
    const url = shareUrls[platform]
    if (url) {
      window.open(url, '_blank', 'width=600,height=400')
    }
  }

  if (!mealCard || !shareSuggestions) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Meal Card Preview */}
      <div className="relative">
        <img
          src={mealCard.image_url}
          alt={mealCard.recipe_name}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full px-3 py-1 text-sm font-medium">
          {mealCard.difficulty_level.toUpperCase()}
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{mealCard.title}</h2>
        <p className="text-gray-600 mb-4">{mealCard.description}</p>

        {/* Recipe Details */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{mealCard.cooking_time}</div>
            <div className="text-sm text-gray-600">minutes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{mealCard.nutrition_info.calories}</div>
            <div className="text-sm text-gray-600">calories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{mealCard.cuisine_type}</div>
            <div className="text-sm text-gray-600">cuisine</div>
          </div>
        </div>

        {/* Dietary Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {mealCard.dietary_tags.map((tag, index) => (
            <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>

        {/* Nutrition Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3">Nutrition per serving</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium">{mealCard.nutrition_info.protein}g</div>
              <div className="text-gray-600">Protein</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{mealCard.nutrition_info.carbs}g</div>
              <div className="text-gray-600">Carbs</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{mealCard.nutrition_info.fat}g</div>
              <div className="text-gray-600">Fat</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{mealCard.cooking_time}min</div>
              <div className="text-gray-600">Cook Time</div>
            </div>
          </div>
        </div>

        {/* Share Options */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Share this recipe</h3>
          
          {/* Custom Message */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom message (optional)
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a personal message..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 h-20"
            />
          </div>

          {/* Platform Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select platforms
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['twitter', 'facebook', 'linkedin', 'instagram', 'pinterest', 'whatsapp'].map(platform => (
                <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform)}
                    onChange={() => handlePlatformToggle(platform)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm capitalize">{platform}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Suggested Content */}
          {shareSuggestions && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Suggested content</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-600">Title:</label>
                  <p className="text-sm text-gray-800">{shareSuggestions.suggested_titles[0]}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Description:</label>
                  <p className="text-sm text-gray-800">{shareSuggestions.suggested_descriptions[0]}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Hashtags:</label>
                  <div className="flex flex-wrap gap-1">
                    {shareSuggestions.suggested_hashtags.slice(0, 5).map((tag: string, index: number) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Share Button */}
          <button
            onClick={handleShare}
            disabled={isSharing || selectedPlatforms.length === 0}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSharing ? 'Sharing...' : `Share to ${selectedPlatforms.length} platform${selectedPlatforms.length !== 1 ? 's' : ''}`}
          </button>

          {/* Share URLs (if shared) */}
          {Object.keys(shareUrls).length > 0 && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Share links generated!</h4>
              <div className="space-y-2">
                {Object.entries(shareUrls).map(([platform, url]) => (
                  <div key={platform} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{platform}</span>
                    <button
                      onClick={() => openShareUrl(platform)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Open
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
