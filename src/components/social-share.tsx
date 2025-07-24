"use client";

import { useState } from 'react';
import { Share2, Copy, Facebook, Twitter, Download, Instagram, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import type { GenerateTarotReadingOutput } from '@/ai/flows/generate-tarot-reading';
import { TarotCard as TarotCardType } from '@/lib/tarot-data';
import Image from 'next/image';

interface SocialShareProps {
  reading: GenerateTarotReadingOutput;
  cardNames: string[];
  cards: TarotCardType[];
  question?: string;
}

export function SocialShare({ reading, cardNames, cards, question }: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { toast } = useToast();
  const t = useTranslations('SocialShare');

  const shareText = `🔮 ได้รับคำทำนายไพ่ทาโรต์จาก Hybridus Tarot แล้ว!\n\n✨ ไพ่ทั้ง 3 ใบของฉัน: ${cardNames.join(' • ')}\n\n📝 ${reading.initialSummary.length > 200 ? reading.initialSummary.substring(0, 200) + '...' : reading.initialSummary}\n\n#HybridusTarot #Tarot #ไพ่ทาโรต์`;

  const generateOGImage = async (): Promise<string> => {
    const params = new URLSearchParams({
      cardNames: JSON.stringify(cardNames),
      summary: reading.initialSummary,
      question: question || '',
    });
    
    return `/api/og?${params.toString()}`;
  };

  const handleCopyLink = async () => {
    try {
      // Store reading data in localStorage for sharing
      const readingData = {
        reading,
        cardNames,
        cards: cards?.map(card => ({ name: card.name, image: card.image })),
        question,
        timestamp: Date.now()
      };
      
      const shareId = btoa(JSON.stringify(readingData)).replace(/[+/=]/g, '');
      localStorage.setItem(`tarot-reading-${shareId}`, JSON.stringify(readingData));
      
      const shareUrl = `${window.location.origin}/share/${shareId}`;
      await navigator.clipboard.writeText(`${shareText}\n\n🌟 ดูคำทำนายเต็มที่: ${shareUrl}`);
      
      toast({
        title: t('copySuccess'),
        description: t('copyDescription'),
      });
    } catch (error) {
      // Fallback to simple text copy
      try {
        await navigator.clipboard.writeText(`${shareText}\n\n🌟 ลองดูดวงที่: ${window.location.origin}`);
        toast({
          title: t('copySuccess'),
          description: t('copyDescription'),
        });
      } catch (fallbackError) {
        toast({
          title: t('copyError'),
          description: t('copyErrorDescription'),
          variant: 'destructive',
        });
      }
    }
  };

  const handleFacebookShare = async () => {
    try {
      // Generate OG image URL for Facebook
      const ogImageUrl = await generateOGImage();
      const fullImageUrl = `${window.location.origin}${ogImageUrl}`;
      
      const facebookUrl = new URL('https://www.facebook.com/sharer/sharer.php');
      facebookUrl.searchParams.set('u', window.location.origin);
      facebookUrl.searchParams.set('quote', shareText);
      
      window.open(facebookUrl.toString(), '_blank', 'width=600,height=400');
    } catch (error) {
      // Fallback to simple share
      const text = encodeURIComponent(shareText);
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${text}`;
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(shareText);
    const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.origin)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleInstagramShare = () => {
    // Instagram doesn't support direct sharing with text, so we'll copy to clipboard
    handleCopyLink();
    toast({
      title: t('instagramCopyTitle'),
      description: t('instagramCopyDescription'),
    });
  };

  const handleDownloadImage = async () => {
    setIsGeneratingImage(true);
    try {
      const imageUrl = await generateOGImage();
      const fullImageUrl = `${window.location.origin}${imageUrl}`;
      
      // Fetch the image with proper headers
      const response = await fetch(fullImageUrl, {
        method: 'GET',
        headers: {
          'Accept': 'image/*',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Verify the blob has content
      if (blob.size === 0) {
        throw new Error('Downloaded image is empty');
      }
      
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `hybridus-tarot-reading-${Date.now()}.png`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: t('downloadSuccess'),
        description: t('downloadDescription'),
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: t('downloadError'),
        description: t('downloadErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-400/30 hover:border-purple-400/50 transition-all duration-300">
          <Share2 className="mr-2 h-4 w-4" />
          {t('shareButton')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl border-purple-400/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t('shareTitle')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Preview Section */}
          <div className="bg-black/30 rounded-xl p-6 border border-purple-400/20">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">{t('previewTitle')}</h3>
            
            {/* Cards Display */}
            <div className="flex justify-center gap-4 mb-6">
              {cards.map((card, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="text-xs text-purple-300 font-medium">
                    {index === 0 ? t('past') : index === 1 ? t('present') : t('future')}
                  </div>
                  <div className="relative w-16 h-24 rounded-lg overflow-hidden border-2 border-purple-400/30 shadow-lg">
                    <Image
                      src={card.image}
                      alt={card.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-xs text-center text-slate-300 max-w-16 leading-tight">
                    {card.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Preview */}
            <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-400/20">
              <p className="text-sm text-slate-200 leading-relaxed line-clamp-3">
                {reading.initialSummary}
              </p>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-300">{t('shareOptions')}</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleFacebookShare}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </Button>
              
              <Button
                onClick={handleTwitterShare}
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white"
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
              
              <Button
                onClick={handleInstagramShare}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </Button>
              
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="flex items-center gap-2 border-purple-400/30 hover:border-purple-400/50"
              >
                <Copy className="h-4 w-4" />
                {t('copyLink')}
              </Button>
            </div>

            {/* Download Image */}
            <Button
              onClick={handleDownloadImage}
              disabled={isGeneratingImage}
              className="w-full flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              <Download className="h-4 w-4" />
              {isGeneratingImage ? t('generating') : t('downloadImage')}
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <ExternalLink className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-200">
                <strong className="text-amber-300">{t('tipTitle')}</strong>
                <p className="mt-1">{t('tipDescription')}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
