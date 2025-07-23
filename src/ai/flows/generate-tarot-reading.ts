
// src/ai/flows/generate-tarot-reading.ts
'use server';

/**
 * @fileOverview Generates a tarot reading interpretation based on a 3-card spread and a user's question.
 *
 * - generateTarotReading - A function that handles the tarot reading generation process.
 * - GenerateTarotReadingInput - The input type for the generateTarotReading function.
 * - GenerateTarotReadingOutput - The return type for the generateTarotReading function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CardInputSchema = z.object({
  cardName: z.string().describe('The name of the drawn tarot card.'),
  cardMeaningUp: z.string().describe('The upright meaning of the tarot card.'),
  cardMeaningRev: z.string().describe('The reversed meaning of the tarot card.'),
});

const UserInfoSchema = z.object({
  firstName: z.string().describe("The user's first name."),
  middleName: z.string().optional().describe("The user's middle name, if provided."),
  lastName: z.string().describe("The user's last name."),
  dob: z.string().describe("The user's date of birth in ISO 8601 format."),
  wednesdayShift: z.enum(['day', 'night']).optional().describe("If the user was born on a Wednesday, this specifies whether it was during the day or night."),
}).optional();

const GenerateTarotReadingInputSchema = z.object({
  question: z.string().describe("The user's question for the tarot reading."),
  pastCard: CardInputSchema.describe('The card representing the past.'),
  presentCard: CardInputSchema.describe('The card representing the present.'),
  futureCard: CardInputSchema.describe('The card representing the future.'),
  pastLabel: z.string().describe('The localized label for "Past".'),
  presentLabel: z.string().describe('The localized label for "Present".'),
  futureLabel: z.string().describe('The localized label for "Future".'),
  conclusionLabel: z.string().describe('The localized label for "Conclusion".'),
  userInfo: UserInfoSchema.describe("Optional user information for a more personalized reading."),
  locale: z.string().describe("The user's current locale (e.g., 'en', 'th')."),
  languageName: z.string().describe("The full name of the user's language (e.g., 'English', 'Thai').")
});
export type GenerateTarotReadingInput = z.infer<typeof GenerateTarotReadingInputSchema>;

const ReadingSectionSchema = z.object({
  title: z.string().describe('The title for this section of the reading.'),
  body: z.string().describe('The detailed interpretation for this section, formatted with paragraphs.'),
});

const GenerateTarotReadingOutputSchema = z.object({
  initialSummary: z.string().describe("A direct and empathetic summary that immediately addresses the user's question by synthesizing the meaning of the three cards. This should directly answer the core of the question."),
  past: ReadingSectionSchema.describe("The interpretation for the Past card, explaining its influence on the user's question."),
  present: ReadingSectionSchema.describe("The interpretation for the Present card, describing how the current situation relates to the user's question."),
  future: ReadingSectionSchema.describe("The interpretation for the Future card, outlining the potential outcome regarding the user's question."),
  conclusion: ReadingSectionSchema.describe("A final piece of advice that provides actionable steps or a reflective thought related to the user's question, empowering them to move forward."),
});
export type GenerateTarotReadingOutput = z.infer<typeof GenerateTarotReadingOutputSchema>;

export async function generateTarotReading(input: GenerateTarotReadingInput): Promise<GenerateTarotReadingOutput> {
  try {
    const result = await generateTarotReadingFlow(input);
    return result;
  } catch (error) {
    // This will provide a more detailed error log on the server if the flow fails.
    console.error("An error occurred inside the generateTarotReading flow:", error);
    // Re-throw the error so it can be handled by the calling server action.
    throw error;
  }
}

const prompt = ai.definePrompt({
  name: 'generateTarotReadingPrompt',
  input: {schema: GenerateTarotReadingInputSchema},
  output: {schema: GenerateTarotReadingOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ]
  },
  prompt: `You are a wise and empathetic tarot reader. Your primary goal is to provide a clear, insightful, and supportive answer to the user's specific question, using the tarot cards as a guide. Your tone is like a caring counselor, using beautiful, narrative language that always ties back to the user's query. You are speaking in {{languageName}}.

**CRITICAL INSTRUCTION: Every part of your response MUST directly address the user's question. Do not give generic card meanings. Interpret the cards ONLY in the context of the question.**

The user's question is: **"{{{question}}}"**

{{#if userInfo}}
User's personal details for a deeper connection:
- **Name:** {{userInfo.firstName}} {{#if userInfo.middleName}}{{userInfo.middleName}} {{/if}}{{userInfo.lastName}}
- **Date of Birth:** {{userInfo.dob}}
{{#if userInfo.wednesdayShift}}
- **Birth Time on Wednesday:** {{userInfo.wednesdayShift}} (This is significant in some astrological traditions, especially Thai astrology.)
{{/if}}
*Subtly weave their energetic signature (Zodiac/Life Path, and if applicable, their Wednesday birth time) into the narrative as it relates to their question.*
{{/if}}

Here are the cards chosen to illuminate the answer to "{{{question}}}":

1.  **{{pastLabel}} (Foundation related to the question):** {{pastCard.cardName}}
    *   Upright Meaning: {{{pastCard.cardMeaningUp}}}
    *   Reversed Meaning: {{{pastCard.cardMeaningRev}}}

2.  **{{presentLabel}} (Heart of the matter concerning the question):** {{presentCard.cardName}}
    *   Upright Meaning: {{{presentCard.cardMeaningUp}}}
    *   Reversed Meaning: {{{presentCard.cardMeaningRev}}}

3.  **{{futureLabel}} (Potential path regarding the question):** {{futureCard.cardName}}
    *   Upright Meaning: {{{futureCard.cardMeaningUp}}}
    *   Reversed Meaning: {{{futureCard.cardMeaningRev}}}

**Response Generation Instructions:**

Generate a response in the specified JSON format. The entire response must be in {{languageName}}. The language should be fluid, reassuring, and insightful, focusing entirely on answering the user's question. For the 'body' of each section, ensure the text is broken into 2-3 paragraphs for readability, using "

" as a separator. Do not use markdown formatting.

**JSON Output Structure:**
- **initialSummary**: Start with a direct answer to "{{{question}}}". Synthesize the story of the three cards to give a clear, immediate summary. This should be a concise single paragraph.
- **past**: An object with "title" (using {{pastLabel}}) and "body". Explain how this card's energy has influenced the situation surrounding **your question**. How did the past lead to this query? Format the body with 2-3 paragraphs.
- **present**: An object with "title" (using {{presentLabel}}) and "body". Describe what is currently happening in relation to **your question**. What does this card reveal about the current dynamics of your situation? Format the body with 2-3 paragraphs.
- **future**: An object with "title" (using {{futureLabel}}) and "body". Illuminate the potential outcome concerning **your question**. What direction is this heading? What should you be aware of? Format the body with 2-3 paragraphs.
- **conclusion**: An object with "title" (using {{conclusionLabel}}) and "body". Bring the story to a close with empowering advice specifically for **your question**. What is the key takeaway? Format the body as a concise, actionable single paragraph.
`,
});

const generateTarotReadingFlow = ai.defineFlow(
  {
    name: 'generateTarotReadingFlow',
    inputSchema: GenerateTarotReadingInputSchema,
    outputSchema: GenerateTarotReadingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Replaced the non-null assertion (!) with a proper check to provide a clearer error.
    if (!output) {
      throw new Error("The reading could not be generated at this time. Please try again later.");
    }
    return output;
  }
);
