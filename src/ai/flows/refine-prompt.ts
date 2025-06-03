'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

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
  try {
    // First, use Hugging Face model for initial refinement
    const hfPrompt = `Refine this prompt instruction into a high-quality ${input.promptLevel.toLowerCase()} prompt: ${input.instruction}`;
    
    const hfResponse = await hf.textGeneration({
      model: 'gpt2',  // You can change this to other models
      inputs: hfPrompt,
      parameters: {
        max_new_tokens: 100,
        temperature: 0.7,
        top_p: 0.95,
        repetition_penalty: 1.2
      }
    });

    // Then use Gemini for further refinement and formatting
    const refinedPrompt = await refinePromptFlow({
      instruction: hfResponse.generated_text,
      promptLevel: input.promptLevel
    });

    return refinedPrompt;
  } catch (error) {
    console.error('Error in refinePrompt:', error);
    throw new Error('Failed to refine prompt');
  }
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

Your output MUST be a JSON object with a single key "refinedPrompts" which is an array of 2-3 strings, where each string is a complete prompt.

Generate the array of refined prompts now.`,
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