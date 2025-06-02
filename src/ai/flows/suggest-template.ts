'use server';

/**
 * @fileOverview Suggests prompt templates based on the selected category.
 *
 * - suggestTemplate - A function that suggests prompt templates based on the category.
 * - SuggestTemplateInput - The input type for the suggestTemplate function.
 * - SuggestTemplateOutput - The return type for the suggestTemplate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTemplateInputSchema = z.object({
  category: z
    .enum(['Email', 'Resume', 'Coding', 'Story', 'ChatGPT'])
    .describe('The category for which to suggest a prompt template.'),
});
export type SuggestTemplateInput = z.infer<typeof SuggestTemplateInputSchema>;

const SuggestTemplateOutputSchema = z.object({
  template: z.string().describe('The suggested prompt template for the given category.'),
});
export type SuggestTemplateOutput = z.infer<typeof SuggestTemplateOutputSchema>;

export async function suggestTemplate(input: SuggestTemplateInput): Promise<SuggestTemplateOutput> {
  return suggestTemplateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTemplatePrompt',
  input: {schema: SuggestTemplateInputSchema},
  output: {schema: SuggestTemplateOutputSchema},
  prompt: `You are an expert prompt template generator.

  Based on the category provided, suggest a prompt template that the user can use.

  Category: {{{category}}}
  `,
});

const suggestTemplateFlow = ai.defineFlow(
  {
    name: 'suggestTemplateFlow',
    inputSchema: SuggestTemplateInputSchema,
    outputSchema: SuggestTemplateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
