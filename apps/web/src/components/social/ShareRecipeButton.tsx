'use client';

import { useState } from 'react';
import { Share2, Copy, Check, Facebook, Twitter, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ShareRecipeButtonProps {
  recipeId: string;
  recipeTitle: string;
  recipeImage?: string;
}

export function ShareRecipeButton({
  recipeId,
  recipeTitle,
  recipeImage,
}: ShareRecipeButtonProps) {
  const [copied, setCopied] = useState(false);
  const supabase = createClientComponentClient();

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/recipes/${recipeId}`
    : '';

  const shareText = `Check out this recipe: ${recipeTitle} - What's for Dinner`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    let shareLink = '';

    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing, so copy link
        await handleCopy();
        return;
      default:
        return;
    }

    // Track share event
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('social_shares').insert({
        user_id: user.id,
        content_type: 'recipe',
        content_id: recipeId,
        platform: platform as any,
        share_url: shareUrl,
        share_text: shareText,
      });
    }

    // Open share window
    window.open(shareLink, '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipeTitle,
          text: shareText,
          url: shareUrl,
        });

        // Track share event
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('social_shares').insert({
            user_id: user.id,
            content_type: 'recipe',
            content_id: recipeId,
            platform: 'whatsapp', // Native share
            share_url: shareUrl,
            share_text: shareText,
          });
        }
      } catch (error) {
        // User cancelled or error
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Share error:', error);
        }
      }
    } else {
      // Fallback to copy
      await handleCopy();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {navigator.share && (
          <DropdownMenuItem onClick={handleNativeShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share via...
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleShare('facebook')}>
          <Facebook className="w-4 h-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('twitter')}>
          <Twitter className="w-4 h-4 mr-2" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
