
// src/ai/flows/refine-prompt.ts
'use server';

/**
 * @fileOverview A flow to refine simple user instructions into multiple high-quality prompt suggestions based on a selected level.
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
    .describe('A simple or incomplete instruction to be refined into high-quality prompts.'),
  promptLevel: z
    .enum(['Quick', 'Balanced', 'Comprehensive'])
    .describe('The desired complexity and style of prompt suggestions.'),
});
export type RefinePromptInput = z.infer<typeof RefinePromptInputSchema>;

const RefinePromptOutputSchema = z.object({
  refinedPrompts: z
    .array(z.string().describe("A refined prompt suggestion."))
    .describe('An array of 2-3 refined prompt suggestions tailored to the selected level.'),
});
export type RefinePromptOutput = z.infer<typeof RefinePromptOutputSchema>;

export async function refinePrompt(input: RefinePromptInput): Promise<RefinePromptOutput> {
  return refinePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refinePromptPrompt',
  input: {schema: RefinePromptInputSchema},
  output: {schema: RefinePromptOutputSchema},
  prompt: `You are an expert prompt engineer. Your task is to refine a user's instruction into an array of 2-3 distinct, high-quality prompt variations. The style and detail of these variations should be guided by the user-selected 'promptLevel'.

Apply the principles of good prompt design: Action Words, Context, Clarity, Specificity, Examples (encourage user to provide to target AI), Desired Output Format, Explicit Guidance, Tone, and Review/Refine.

User's Input:
Instruction: {{{instruction}}}
Selected Prompt Level: {{{promptLevel}}}

Based on the 'promptLevel', generate the array of prompt variations as follows:

1.  **If 'promptLevel' is 'Quick':**
    *   Generate 2-3 concise and direct prompts.
    *   Each prompt must start with a strong action verb (e.g., "Generate," "Write," "List").
    *   Focus on brevity and immediate usability. Keep context minimal but sufficient.

2.  **If 'promptLevel' is 'Balanced':**
    *   Generate 2-3 moderately detailed prompts.
    *   These prompts should incorporate relevant context derived from the instruction.
    *   They should suggest a desired output format or length.
    *   They may subtly guide the tone.
    *   Aim for a balance between simplicity and comprehensiveness.

3.  **If 'promptLevel' is 'Comprehensive':**
    *   Generate 2-3 highly detailed and structured prompts.
    *   These prompts must be rich in context.
    *   Provide explicit instructions regarding length, format, style, and specific information to include or exclude.
    *   Suggest defining a persona for the AI if applicable.
    *   Encourage the user to provide examples to the target AI within the prompt (e.g., "You can provide an example of the desired output format like so: ...").
    *   Incorporate critical warnings or constraints.
    *   Refer to the detailed example below for the quality and structure expected for 'Comprehensive' prompts.

**Example of a 'Comprehensive' quality prompt (for user instruction "Suggest some hikes near San Francisco"):**
"I want a list of the best medium-length hikes within two hours of San Francisco.
Each hike should provide a cool and unique adventure, and be lesser known.

For each hike, return the following details:
*   The name of the hike as I'd find it on AllTrails.
*   The starting address of the hike.
*   The ending address of the hike (if different from starting).
*   Total distance of the hike.
*   Estimated driving time from San Francisco to the trailhead.
*   Estimated hike duration.
*   A brief description of what makes it a cool and unique adventure.

Please return the top 3 recommendations.

Important considerations (Warnings):
*   Be careful to ensure that the name of the trail is correct.
*   Verify that the trail actually exists and is currently open.
*   Ensure any time estimates (drive time, hike duration) are reasonably accurate.

For context to help you choose (Context Dump): My girlfriend and I hike a ton! We've done pretty much all of the local SF hikes, whether that's Presidio or Golden Gate Park. We definitely want to get out of town. We did Mount Tam pretty recently (the whole thing from the beginning of the stairs to Stinson) – it was really long, and we are definitely in the mood for something different this weekend! Ocean views would still be nice. We love delicious food; one thing I loved about the Mt. Tam hike is that it ends with a celebration (arriving in town for breakfast!). The old missile silos and stuff near Discovery Point are cool, but I've done that hike probably 20x at this point. We won't be seeing each other for a few weeks (she has to stay in LA for work), so the uniqueness of this hike really counts."

Your output MUST be a JSON object with a single key "refinedPrompts" which is an array of 2-3 strings, where each string is a complete prompt. For example:
{
  "refinedPrompts": [
    "Prompt variation 1...",
    "Prompt variation 2...",
    "Prompt variation 3..."
  ]
}

Generate the array of refined prompts now.
`,
});

const refinePromptFlow = ai.defineFlow(
  {
    name: 'refinePromptFlow',
    inputSchema: RefinePromptInputSchema,
    outputSchema: RefinePromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.refinedPrompts) {
      throw new Error('AI did not return the expected refinedPrompts array.');
    }
    return output;
  }
);
