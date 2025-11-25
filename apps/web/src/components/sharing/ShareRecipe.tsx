'use client';

import { useState } from 'react';
import { Share2, Copy, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/ux/toast';
import { trackSocialShare } from '@/lib/viral-loops';

interface ShareRecipeProps {
  recipeId: number;
  recipeTitle: string;
}

export default function ShareRecipe({ recipeId, recipeTitle }: ShareRecipeProps) {
  const [sharing, setSharing] = useState(false);

  const shareUrl = `${window.location.origin}/recipes/${recipeId}`;
  const shareText = `Check out this recipe: ${recipeTitle} from What's for Dinner!`;

  const handleShare = async (platform: string) => {
    setSharing(true);
    
    try {
      // Track share event
      await trackSocialShare({
        recipeId,
        platform,
        shareUrl,
      });

      const encodedUrl = encodeURIComponent(shareUrl);
      const encodedText = encodeURIComponent(shareText);

      let shareLink = '';

      switch (platform) {
        case 'twitter':
          shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
          break;
        case 'facebook':
          shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
          break;
        case 'email':
          shareLink = `mailto:?subject=${encodeURIComponent(recipeTitle)}&body=${encodedText}%20${encodedUrl}`;
          break;
        case 'copy':
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Recipe link copied to clipboard!');
          setSharing(false);
          return;
        default:
          if (navigator.share) {
            await navigator.share({
              title: recipeTitle,
              text: shareText,
              url: shareUrl,
            });
            setSharing(false);
            return;
          }
      }

      if (shareLink) {
        window.open(shareLink, '_blank', 'width=600,height=400');
      }
    } catch (err) {
      console.error('Failed to share recipe:', err);
      toast.error('Failed to share recipe. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Share:</span>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('copy')}
          disabled={sharing}
          aria-label="Copy recipe link"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('twitter')}
          disabled={sharing}
          aria-label="Share on Twitter"
        >
          <Share2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('facebook')}
          disabled={sharing}
          aria-label="Share on Facebook"
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('email')}
          disabled={sharing}
          aria-label="Share via email"
        >
          <Mail className="h-4 w-4" />
        </Button>
        {navigator.share && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare('native')}
            disabled={sharing}
            aria-label="Share recipe"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
