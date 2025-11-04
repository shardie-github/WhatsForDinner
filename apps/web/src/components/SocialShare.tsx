'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Twitter, Facebook, Linkedin, Copy, Check, Mail } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import { toast } from 'sonner';

interface SocialShareProps {
  title?: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export default function SocialShare({
  title = "What's for Dinner? - AI Recipe Generator",
  description = "Get dinner ideas from ingredients you already have in 30 seconds",
  url,
  imageUrl,
  size = 'md',
  variant = 'outline',
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = `${title}: ${description}`;

  const share = async (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    let shareWindowUrl = '';

    switch (platform) {
      case 'twitter':
        shareWindowUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareWindowUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        shareWindowUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'email':
        shareWindowUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${shareUrl}`)}`;
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          toast.success('Link copied to clipboard!');
          setTimeout(() => setCopied(false), 2000);
          
          await analytics.trackEvent('social_share', {
            platform: 'copy',
            url: shareUrl,
          });
        } catch (error) {
          toast.error('Failed to copy link');
        }
        return;
      default:
        return;
    }

    // Open share window
    const width = 600;
    const height = 400;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(
      shareWindowUrl,
      'share',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    // Track share
    await analytics.trackEvent('social_share', {
      platform,
      url: shareUrl,
      title,
    });
  };

  // Use native share API if available (mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });

        await analytics.trackEvent('social_share', {
          platform: 'native',
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback to copy
      share('copy');
    }
  };

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Native share (mobile) */}
      {typeof window !== 'undefined' && navigator.share && (
        <Button
          size={buttonSize}
          variant={variant}
          onClick={handleNativeShare}
          className="gap-2"
        >
          <Share2 className={iconSize} />
          <span className={size === 'sm' ? 'hidden sm:inline' : ''}>Share</span>
        </Button>
      )}

      {/* Twitter */}
      <Button
        size={buttonSize}
        variant={variant}
        onClick={() => share('twitter')}
        className="gap-2"
      >
        <Twitter className={iconSize} />
        <span className={size === 'sm' ? 'hidden sm:inline' : ''}>Twitter</span>
      </Button>

      {/* Facebook */}
      <Button
        size={buttonSize}
        variant={variant}
        onClick={() => share('facebook')}
        className="gap-2"
      >
        <Facebook className={iconSize} />
        <span className={size === 'sm' ? 'hidden sm:inline' : ''}>Facebook</span>
      </Button>

      {/* LinkedIn */}
      <Button
        size={buttonSize}
        variant={variant}
        onClick={() => share('linkedin')}
        className="gap-2"
      >
        <Linkedin className={iconSize} />
        <span className={size === 'sm' ? 'hidden sm:inline' : ''}>LinkedIn</span>
      </Button>

      {/* Email */}
      <Button
        size={buttonSize}
        variant={variant}
        onClick={() => share('email')}
        className="gap-2"
      >
        <Mail className={iconSize} />
        <span className={size === 'sm' ? 'hidden sm:inline' : ''}>Email</span>
      </Button>

      {/* Copy Link */}
      {!navigator.share && (
        <Button
          size={buttonSize}
          variant={variant}
          onClick={() => share('copy')}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className={iconSize} />
              <span className={size === 'sm' ? 'hidden sm:inline' : ''}>Copied!</span>
            </>
          ) : (
            <>
              <Copy className={iconSize} />
              <span className={size === 'sm' ? 'hidden sm:inline' : ''}>Copy</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
}
