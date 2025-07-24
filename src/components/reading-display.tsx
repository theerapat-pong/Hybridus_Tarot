
"use client";

import { Copy, Hourglass, ArrowRight, Lightbulb, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import React from 'react';
import type { GenerateTarotReadingOutput } from '@/ai/flows/generate-tarot-reading';
import { SocialShare } from '@/components/social-share';
import { TarotCard as TarotCardType } from '@/lib/tarot-data';

interface ReadingDisplayProps {
  reading: GenerateTarotReadingOutput | string | null;
  isLoading: boolean;
  cardNames: string[] | null;
  cards?: TarotCardType[];
  question?: string;
}

interface ReadingDisplayProps {
  reading: GenerateTarotReadingOutput | string | null;
  isLoading: boolean;
  cardNames: string[] | null;
  cards?: TarotCardType[];
  question?: string;
}

const sectionIcons: { [key in keyof Omit<GenerateTarotReadingOutput, 'initialSummary'>]: React.ElementType } = {
  past: Hourglass,
  present: ArrowRight,
  future: Sparkles,
  conclusion: Lightbulb,
};

export function ReadingDisplay({ reading, isLoading, cardNames, cards, question }: ReadingDisplayProps) {
  const t = useTranslations('ReadingDisplay');
  const { toast } = useToast();

  const handleCopy = async () => {
    if (reading && typeof reading !== 'string') {
      const textToCopy = [
        reading.initialSummary,
        `${reading.past.title}:\n${reading.past.body}`,
        `${reading.present.title}:\n${reading.present.body}`,
        `${reading.future.title}:\n${reading.future.body}`,
        `${reading.conclusion.title}:\n${reading.conclusion.body}`,
      ].join('\n\n').trim();
      
      try {
        await navigator.clipboard.writeText(textToCopy);
        toast({
          title: t('copySuccessTitle'),
          description: t('copySuccessDescription'),
        });
      } catch (error) {
        console.error("Clipboard write failed:", error);
        toast({
          title: t('copyErrorTitle'),
          description: t('copyErrorDescription'),
          variant: "destructive",
        });
      }
    }
  };
  
  const displayCardNames = cardNames?.join(' • ');

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      );
    }
    
    if (!reading) {
      return (
        <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center h-full">
          <p className="text-lg">{t('drawCardPrompt')}</p>
        </div>
      );
    }

    if (typeof reading === 'string') {
       return (
        <div className="text-center text-destructive p-4">
          <p>{t('error')}</p>
          <p className="text-sm text-muted-foreground">{reading}</p>
        </div>
       )
    }

    return (
      <div className="space-y-4">
        {reading.initialSummary && (
          <p className="whitespace-pre-wrap font-headline text-lg text-amber-300 leading-relaxed">
            {reading.initialSummary.trim()}
          </p>
        )}
        
        {(['past', 'present', 'future', 'conclusion'] as const).map((key) => {
          const section = reading[key];
          const Icon = sectionIcons[key];
          if (!section) return null;
          
          return (
            <div key={key} className="flex items-start gap-3 mt-6">
              <Icon className="h-5 w-5 mt-1 text-primary shrink-0" />
              <div className="flex-1">
                <h3 className="font-headline text-lg text-primary">{section.title}</h3>
                <p className="whitespace-pre-wrap font-body text-card-foreground/90 leading-relaxed text-base mt-1">
                  {section.body.trim()}
                </p>
              </div>
            </div>
          )
        })}

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button onClick={handleCopy} variant="outline" size="sm" className="rounded-full">
            <Copy className="mr-2 h-4 w-4" />
            {t('copyButton')}
          </Button>
          
          {reading && typeof reading !== 'string' && cardNames && cards && (
            <SocialShare 
              reading={reading} 
              cardNames={cardNames} 
              cards={cards}
              question={question}
            />
          )}
        </div>
      </div>
    );
  };


  return (
    <Card className="h-full bg-card/80 backdrop-blur-sm border-border shadow-lg rounded-2xl w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-center text-center gap-2 text-primary font-headline text-xl md:text-2xl">
          {isLoading ? t('consulting') : cardNames && cardNames.length > 0 ? t('readingFor', { cardName: displayCardNames }) : t('yourReading')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
