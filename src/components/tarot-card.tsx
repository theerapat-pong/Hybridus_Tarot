
"use client";

import Image from 'next/image';
import { TarotCard as TarotCardType } from '@/lib/tarot-data';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TarotCardProps {
  card?: TarotCardType | null;
  isFlipped: boolean;
  index: number;
  style?: React.CSSProperties;
}

export function TarotCard({ card, isFlipped, index, style }: TarotCardProps) {

  return (
    <div className="absolute w-full h-full" style={style}>
      <div
        className={cn("relative w-full h-full duration-700 preserve-3d", {
          "rotate-y-180": isFlipped,
        })}
      >
        {/* Card Back */}
        <div className="absolute w-full h-full backface-hidden">
           <Card className="w-full h-full bg-gradient-to-br from-primary via-blue-500 to-secondary p-1 shadow-xl border-accent/50 rounded-lg overflow-hidden">
             <div className="w-full h-full border-2 border-accent/70 rounded-md flex items-center justify-center p-2">
                <Image 
                  src="/brand-icon.png.webp"
                  alt="Card Back" 
                  width={100} 
                  height={100} 
                  className="object-contain max-w-16 max-h-16 text-accent/50 opacity-50"
                  priority 
                />
             </div>
          </Card>
        </div>
        
        {/* Card Front */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          {card ? (
            <Card className="w-full h-full shadow-2xl overflow-hidden rounded-lg border-2 border-primary/50">
              <CardContent className="p-0 relative w-full h-full">
                <Image
                  src={card.image}
                  alt={card.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  data-ai-hint={card.keywords.join(' ')}
                  priority
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-2 md:p-3">
                  <h3 className="text-white text-base md:text-lg font-bold font-headline drop-shadow-md">{card.name}</h3>
                </div>
              </CardContent>
            </Card>
          ) : (
             // This fallback is useful if a card is null but flipped. For our symbolic choice, this won't be seen.
             <div className="w-full h-full bg-card/50 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center text-muted-foreground text-center p-4 shadow-inner">
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
