import { FC } from 'react';
import styles from './share-image.module.css';
import { tarotCards } from '@/lib/tarot-data';

interface ShareImageProps {
  cardNames: {
    past: string;
    present: string;
    future: string;
  };
  summary: string;
}

const ShareImage: FC<ShareImageProps> = ({ cardNames, summary }) => {
  // This component will be used to generate the shareable image.
  // It will include the three selected tarot cards and the AI-generated summary.
  // The actual image generation will be handled by a new API route.
  return (
    <div className={styles.shareImageContainer}>
      <div className={styles.cardsContainer}>
        {Object.values(cardNames).map((cardName) => {
          const card = tarotCards.find((c) => c.name_en === cardName);
          if (!card) return null;
          const imageUrl = `${process.env.NEXT_PUBLIC_APP_URL}${card.image}`;
          return (
            <img
              key={cardName}
              src={imageUrl}
              alt={cardName}
              width={200}
              height={350}
              className={styles.cardImage}
            />
          );
        })}
      </div>
      <p className={styles.summaryText}>
        {summary}
      </p>
    </div>
  );
};

export default ShareImage;
