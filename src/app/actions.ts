
"use server";

import { generateTarotReading, GenerateTarotReadingInput, GenerateTarotReadingOutput } from '@/ai/flows/generate-tarot-reading';

// --- Tarot Reading Generation ---
export async function getTarotReading(input: GenerateTarotReadingInput): Promise<{ success: true, reading: GenerateTarotReadingOutput } | { success: false, error: string }> {
  try {
    const result = await generateTarotReading(input);
    return { success: true, reading: result };
  } catch (error) {
    console.error("Error generating tarot reading:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `Failed to generate reading: ${errorMessage}` };
  }
}
