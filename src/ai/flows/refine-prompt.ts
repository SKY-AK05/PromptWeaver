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
  prompt: `You are an expert prompt engineer. Your task is to refine user instructions into high-quality, effective prompts for AI models, based on the principles of good prompt design.

The user will provide a simple or incomplete instruction and an optional category. Transform this into a complete and effective prompt by applying the following guidelines:

1.  **Start with Action Words**: Ensure the refined prompt begins with a strong action verb (e.g., "Generate," "Write," "Create," "Explain," "Summarize," "List," "Compare").
2.  **Incorporate Context**: Use the user's instruction ('{{{instruction}}}') and category ('{{#if category}}{{category}}{{else}}General{{/if}}') to make the refined prompt rich in context. If the instruction is very vague, the refined prompt should gently guide the user to add more specific context or details.
3.  **Clarity and Specificity**: Make the refined prompt unambiguous, clear, and highly specific to ensure the AI understands the task precisely. Avoid vague terms.
4.  **Suggest Examples**: If appropriate for the task (especially for creative or formatting-sensitive tasks), the refined prompt should encourage the user to provide examples to the target AI (e.g., "You can provide an example of the desired output format.").
5.  **Specify Desired Output**: The refined prompt should guide the user to specify the desired length, format, or level of detail (e.g., "Specify the desired length (e.g., concise summary, detailed explanation, X words/paragraphs) and format (e.g., bullet points, paragraph, JSON).").
6.  **Explicit Guidance**: Include clear directives on what the AI should do, what to include, and, if implied by the instruction or category, what to avoid or prioritize.
7.  **Define Tone**: Suggest an appropriate tone based on the category and instruction, or prompt the user to specify one if it's crucial (e.g., "Adopt a [formal/casual/persuasive/technical] tone.").

User's Input:
Instruction: {{{instruction}}}
Category: {{#if category}}{{category}}{{else}}General{{/if}}

Based on this, generate ONLY the refined prompt string as the output. The refined prompt should be ready to be used with an AI model.
Refined Prompt:`,
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
