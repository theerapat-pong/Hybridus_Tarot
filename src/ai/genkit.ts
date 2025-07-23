import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// The googleAI plugin will automatically look for the GEMINI_API_KEY 
// environment variable. Next.js automatically loads this from `.env.local`
// on the server, so no explicit configuration is needed here.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});
