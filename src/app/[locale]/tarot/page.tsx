
'use client'

import { TarotReader } from '@/components/tarot-reader';
import { useSearchParams } from 'next/navigation';

export default function TarotPage() {
  const searchParams = useSearchParams();

  const dobParam = searchParams.get('dob');
  // Construct a date object from YYYY-MM-DD string, ensuring it's treated as UTC midnight
  // to prevent timezone shifts.
  const dob = dobParam ? new Date(dobParam + 'T00:00:00Z') : new Date();

  const userInfo = {
    firstName: searchParams.get('firstName') || 'Guest',
    middleName: searchParams.get('middleName') || undefined,
    lastName: searchParams.get('lastName') || '',
    dob: dob.toISOString(),
    wednesdayShift: searchParams.get('wednesdayShift') as 'day' | 'night' | undefined,
  };

  return (
    <main className="font-body antialiased">
      <TarotReader {...userInfo} />
    </main>
  );
}
