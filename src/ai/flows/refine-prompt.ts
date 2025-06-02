// src/ai/flows/refine-prompt.ts
'use server';

/**
 * @fileOverview A flow to refine simple user instructions into high-quality prompts.
 *
 * - refinePrompt - A function that refines the prompt.
 * - RefinePromptInput - The input type for the refinePrompt function.
 * - RefinePromptOutput - The return type for the refinePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefinePromptInputSchema = z.object({
  instruction: z
    .string()
    .describe('A simple or incomplete instruction to be refined into a high-quality prompt.'),
  category: z
    .enum(['Email', 'Resume', 'Coding', 'Story', 'ChatGPT'])
    .describe('The category of the prompt to be refined.')
    .optional(),
});
export type RefinePromptInput = z.infer<typeof RefinePromptInputSchema>;

const RefinePromptOutputSchema = z.object({
  refinedPrompt: z
    .string()
    .describe('The refined, high-quality prompt suitable for the specified category.'),
});
export type RefinePromptOutput = z.infer<typeof RefinePromptOutputSchema>;

export async function refinePrompt(input: RefinePromptInput): Promise<RefinePromptOutput> {
  return refinePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refinePromptPrompt',
  input: {schema: RefinePromptInputSchema},
  output: {schema: RefinePromptOutputSchema},
  prompt: `You are an expert prompt engineer. Your task is to refine user instructions into high-quality prompts for various use cases.

  The user will provide a simple or incomplete instruction, and you must transform it into a complete and effective prompt.
  Consider the specified category when refining the prompt to be most effective.

  Instruction: {{{instruction}}}
  Category: {{category}}

  Refined Prompt:`, // Removed Handlebars await call.
});

const refinePromptFlow = ai.defineFlow(
  {
    name: 'refinePromptFlow',
    inputSchema: RefinePromptInputSchema,
    outputSchema: RefinePromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
