
"use client";

import { useState, useTransition } from 'react';
import { tarotCards, TarotCard as TarotCardType } from '@/lib/tarot-data';
import { getTarotReading } from '@/app/actions';
import { ReadingDisplay } from '@/components/reading-display';
import { Button } from '@/components/ui/button';
import { Info, Sparkles, Shuffle } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { cn, shuffle as shuffleArray } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Textarea } from '@/components/ui/textarea';
import type { GenerateTarotReadingOutput, GenerateTarotReadingInput } from '@/ai/flows/generate-tarot-reading';
import { MysticalIcon } from '@/components/brand-icon';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { TarotCard } from './tarot-card';
import { CardSpread } from './card-spread';
import { motion } from 'framer-motion';


const POSITIONS = ['past', 'present', 'future'] as const;

export interface TarotReaderProps {
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: string;
  wednesdayShift?: 'day' | 'night' | null;
}

export function TarotReader({ firstName, middleName, lastName, dob, wednesdayShift }: TarotReaderProps) {
  const t = useTranslations('TarotReader');
  const tPos = useTranslations('TarotPositions');
  const tSpread = useTranslations('SpreadExplanation');
  const tLocale = useTranslations('LocaleSwitcher');
  const locale = useLocale();

  const [reading, setReading] = useState<GenerateTarotReadingOutput | string | null>(null);
  const [isReadingLoading, startReadingTransition] = useTransition();
  const [gameState, setGameState] = useState<'question' | 'draw' | 'reading'>('question');
  const [shuffledDeck, setShuffledDeck] = useState<TarotCardType[]>([]);
  const [drawnCards, setDrawnCards] = useState<TarotCardType[]>([]);
  const [flipped, setFlipped] = useState([false, false, false]);

  const QuestionFormSchema = z.object({
    question: z.string().min(10, { message: t('validation.questionRequired') }),
  });

  const form = useForm<z.infer<typeof QuestionFormSchema>>({
    resolver: zodResolver(QuestionFormSchema),
    defaultValues: {
      question: "",
    },
  });

  const questionValue = form.watch('question');
  
  const startDrawingPhase = () => {
    const localizedCards = tarotCards.map(card => ({
      ...card,
      name: locale === 'th' ? card.name_th : card.name_en,
      meaning_up: locale === 'th' ? card.meaning_up_th : card.meaning_up_en,
      meaning_rev: locale === 'th' ? card.meaning_rev_th : card.meaning_rev_en,
    }));
    setShuffledDeck(shuffleArray(localizedCards));
    setGameState('draw');
  };


  const handleDrawComplete = async (selectedCards: TarotCardType[]) => {
    setDrawnCards(selectedCards);
    setGameState('reading');
    
    let flipDelay = 500; // Start with a delay to ensure state transition completes
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        setFlipped(prevState => {
          const updatedState = [...prevState];
          updatedState[i] = true;
          return updatedState;
        });
      }, flipDelay);
      flipDelay += 300;
    }

    // This timeout ensures the flip animation has time to start before the AI call
    setTimeout(() => {
      startReadingTransition(async () => {
        const toCardInput = (card: TarotCardType) => ({
          cardName: card.name,
          cardMeaningUp: card.meaning_up,
          cardMeaningRev: card.meaning_rev,
        });

        const userInfoPayload: GenerateTarotReadingInput['userInfo'] = {
          firstName,
          lastName,
          dob,
        };
        
        if (middleName) {
          userInfoPayload.middleName = middleName;
        }
        if (wednesdayShift) {
          userInfoPayload.wednesdayShift = wednesdayShift;
        }

        const result = await getTarotReading({
          question: questionValue,
          pastCard: toCardInput(selectedCards[0]),
          presentCard: toCardInput(selectedCards[1]),
          futureCard: toCardInput(selectedCards[2]),
          pastLabel: tPos('past'),
          presentLabel: tPos('present'),
          futureLabel: tPos('future'),
          conclusionLabel: t('conclusionLabel'),
          userInfo: userInfoPayload,
          locale,
          languageName: tLocale(locale)
        });

        if (result.success) {
          setReading(result.reading);
        } else {
          setReading(result.error);
        }
      });
    }, flipDelay);
  };

  const handleReset = () => {
    setGameState('question');
    setDrawnCards([]);
    setShuffledDeck([]);
    setReading(null);
    setFlipped([false, false, false]);
    form.reset();
  }

  function onQuestionSubmit() {
    startDrawingPhase();
  }
  
  const cardWidth = "w-[90px] sm:w-[140px] md:w-[160px] lg:w-[200px]";
  const cardHeight = "h-[157px] sm:h-[245px] md:h-[280px] lg:h-[350px]";
  
  const renderGameState = () => {
    switch(gameState) {
      case 'question':
        return (
          <motion.div 
            className="w-full max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onQuestionSubmit)} className="w-full">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Textarea
                            placeholder={t('questionPlaceholder')}
                            className="resize-none pr-20"
                            rows={2}
                            {...field}
                          />
                          <Button 
                            type="submit" 
                            className="absolute bottom-3 right-3 h-9 rounded-lg" 
                            disabled={!questionValue || isReadingLoading}
                          >
                            <Shuffle className="mr-2 h-5 w-5" />
                            {t('shuffleButton')}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </FormProvider>
          </motion.div>
        );
      case 'draw':
        return (
          <div className="w-full flex flex-col items-center justify-center h-full">
             <p className="text-amber-300 font-headline text-lg mb-8 text-center animate-fade-in-up">
              {t('drawThreeCards')}
            </p>
            <CardSpread
              deck={shuffledDeck} 
              onDrawComplete={handleDrawComplete}
            />
          </div>
        );
      case 'reading':
        return (
          <>
            <div className="flex flex-row items-start justify-center gap-2 sm:gap-6 md:gap-8 w-full mb-4 sm:mb-6">
              {POSITIONS.map((position, index) => (
                <div key={position} className="flex flex-col items-center gap-2 sm:gap-3">
                  <h2 className="font-headline text-base sm:text-lg text-amber-300">{tPos(position)}</h2>
                  <div className={cn("relative perspective", cardWidth, cardHeight)}>
                    <TarotCard 
                      card={drawnCards[index]} 
                      isFlipped={flipped[index]} 
                      index={index}
                    />
                  </div>
                </div>
              ))}
            </div>

            {(isReadingLoading || reading) && (
              <div className="w-full max-w-3xl">
                <ReadingDisplay 
                  reading={reading} 
                  isLoading={isReadingLoading} 
                  cardNames={flipped.every(f => f) ? drawnCards.map(c => c.name) : null}
                />
              </div>
            )}
             <Button onClick={handleReset} variant="outline" className="mt-6 sm:mt-8">
              <Sparkles className="mr-2 h-4 w-4" />
              {t('askAnotherQuestion')}
            </Button>
          </>
        );
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col min-h-dvh text-foreground p-4 sm:p-8">
       <header className="relative w-full flex flex-col items-center pt-4 sm:pt-8 pb-4">
        <div className="flex flex-col items-center text-center gap-2 sm:gap-4">
           <MysticalIcon className="w-12 h-12 md:w-16 md:h-16 text-primary" />
          <div className="flex flex-col items-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold text-primary tracking-wide">
              {t('title')}
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground mt-1 sm:mt-2 font-body text-xs sm:text-sm md:text-base">{t('subtitle')}</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 mt-1 sm:mt-1.5 text-muted-foreground hover:bg-transparent hover:text-primary">
                    <Info className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <h4 className="font-medium leading-none font-headline text-primary">{tSpread('title')}</h4>
                    <div className="grid gap-2 text-sm">
                      <p><strong>{tPos('past')}:</strong> {tSpread('past')}</p>
                      <p><strong>{tPos('present')}:</strong> {tSpread('present')}</p>
                      <p><strong>{tPos('future')}:</strong> {tSpread('future')}</p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </header>
      
      <main className="w-full flex-grow flex flex-col items-center justify-center gap-6">
        {renderGameState()}
      </main>

       <footer className="w-full py-4 text-center text-muted-foreground text-xs">
        <p>{t('footer')}</p>
      </footer>
    </div>
  );
}
