import { ImageResponse } from 'next/og';
import ShareImage from '@/components/share-image';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const cardNamesParam = searchParams.get('cardNames');
  const summary = searchParams.get('summary');

  if (!cardNamesParam || !summary) {
    return new Response('Missing required parameters', { status: 400 });
  }

  const cardNames = JSON.parse(cardNamesParam);

  return new ImageResponse(
    (
      <ShareImage
        cardNames={cardNames}
        summary={summary}
      />
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
