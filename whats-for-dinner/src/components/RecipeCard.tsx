'use client'

import { useState } from 'react'
import { Recipe } from '@/lib/validation'

interface RecipeCardProps {
  recipe: Recipe
  onSave?: () => void
  onRemove?: () => void
  canSave?: boolean
  isFavorite?: boolean
}

export default function RecipeCard({ 
  recipe, 
  onSave, 
  onRemove, 
  canSave = false,
  isFavorite = false 
}: RecipeCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {recipe.title}
        </h3>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {recipe.cookTime}
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {recipe.calories} cal
          </span>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Ingredients:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4"
        >
          {showDetails ? 'Hide' : 'Show'} Instructions
        </button>

        {showDetails && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
            <ol className="text-sm text-gray-600 space-y-2">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="flex space-x-2">
          {canSave && !isFavorite && (
            <button
              onClick={onSave}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm font-medium"
            >
              Save Recipe
            </button>
          )}
          {isFavorite && onRemove && (
            <button
              onClick={onRemove}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-sm font-medium"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  )
}