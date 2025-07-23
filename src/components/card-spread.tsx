'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TarotCard as TarotCardType } from '@/lib/tarot-data';
import { TarotCard } from './tarot-card';
import { useTranslations } from 'next-intl';

interface CardSpreadProps {
  deck: TarotCardType[];
  onDrawComplete: (cards: TarotCardType[]) => void;
}

const DUMMY_CARD_COUNT = 40;
const CARDS_PER_ROW = 20;

export function CardSpread({ deck, onDrawComplete }: CardSpreadProps) {
  const t = useTranslations('TarotReader');
  const [drawnCards, setDrawnCards] = useState<TarotCardType[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [nextCardIndex, setNextCardIndex] = useState(0);

  const handleCardSelect = (dummyIndex: number) => {
    if (selectedIndices.includes(dummyIndex) || drawnCards.length >= 3) {
      return;
    }

    // Pull the next card from the actual shuffled deck
    const nextCard = deck[nextCardIndex];
    if (!nextCard) return; // Should not happen if deck has 78 cards

    const newDrawnCards = [...drawnCards, nextCard];
    const newSelectedIndices = [...selectedIndices, dummyIndex];

    setDrawnCards(newDrawnCards);
    setSelectedIndices(newSelectedIndices);
    setNextCardIndex(prev => prev + 1); // Move to the next card in the shuffled deck

    if (newDrawnCards.length === 3) {
      setTimeout(() => onDrawComplete(newDrawnCards), 500);
    }
  };

  // Create a dummy array for rendering the visual spread
  const dummyCards = Array.from({ length: DUMMY_CARD_COUNT });

  const row1 = dummyCards.slice(0, CARDS_PER_ROW);
  const row2 = dummyCards.slice(CARDS_PER_ROW, CARDS_PER_ROW * 2);

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.02,
        duration: 0.3
      }
    }),
    hover: {
      y: -16,
      transition: { type: 'spring', stiffness: 300 }
    },
    selected: {
      y: -100,
      scale: 1,
      opacity: 0,
      rotate: 15,
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    }
  };

  const renderRow = (cards: unknown[], rowIndex: number) => (
    <div className="flex justify-center items-center -space-x-[13vw] md:-space-x-[6.5vw] lg:-space-x-[5vw] xl:-space-x-[4vw]">
      {cards.map((_, indexInRow) => {
        const overallIndex = rowIndex * CARDS_PER_ROW + indexInRow;
        const isSelected = selectedIndices.includes(overallIndex);
        return (
          <motion.div
            key={overallIndex}
            className="relative w-[15vw] h-[22.5vw] md:w-[8vw] md:h-[12vw] lg:w-[6vw] lg:h-[9vw] xl:w-[5vw] xl:h-[7.5vw] cursor-pointer"
            onClick={() => handleCardSelect(overallIndex)}
            variants={cardVariants}
            initial="initial"
            animate={isSelected ? "selected" : "visible"}
            whileHover={!isSelected && drawnCards.length < 3 ? "hover" : ""}
            custom={overallIndex}
          >
            {/* Always render the card back. isFlipped is always false */}
            <TarotCard card={null} isFlipped={false} index={overallIndex} />
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full">
      <div className="w-full">{renderRow(row1, 0)}</div>
      <div className="w-full">{renderRow(row2, 1)}</div>
      <div className="mt-4 text-primary-foreground font-semibold">
        {t('cardsSelected', { count: drawnCards.length })}
      </div>
    </div>
  );
}
