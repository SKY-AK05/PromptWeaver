
"use client";

import type { RefinePromptInput, RefinePromptOutput } from '@/ai/flows/refine-prompt';
import { refinePrompt } from '@/ai/flows/refine-prompt';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Languages, Copy, Loader2, Sparkles, Wand2 } from 'lucide-react'; // Replaced unused icons

type PromptLevel = 'Quick' | 'Balanced' | 'Comprehensive';
const promptLevels: { value: PromptLevel; label: string; }[] = [
  { value: 'Quick', label: 'Quick Suggestions' },
  { value: 'Balanced', label: 'Balanced Options' },
  { value: 'Comprehensive', label: 'Detailed Drafts' },
];

export default function PromptWeaverClient() {
  const [language, setLanguage] = React.useState<'en' | 'ta'>('en');
  const [promptLevel, setPromptLevel] = React.useState<PromptLevel>('Balanced');
  const [inputText, setInputText] = React.useState('');
  const [refinedPrompts, setRefinedPrompts] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleRefinePrompt = async () => {
    if (!inputText.trim()) {
      setError('Please enter an idea to refine.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setRefinedPrompts([]);

    try {
      const input: RefinePromptInput = {
        instruction: inputText,
        promptLevel: promptLevel,
      };
      const result: RefinePromptOutput = await refinePrompt(input);
      setRefinedPrompts(result.refinedPrompts || []);
      if (!result.refinedPrompts || result.refinedPrompts.length === 0) {
        setError('The AI did not return any prompt suggestions. You can try again.');
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to refine prompt: ${errorMessage}`);
      toast({
        title: "Error",
        description: `Failed to refine prompt: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (promptText: string) => {
    if (!promptText) return;
    navigator.clipboard.writeText(promptText)
      .then(() => {
        toast({
          title: "Copied!",
          description: "The prompt has been copied to your clipboard.",
        });
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast({
          title: "Copy Failed",
          description: "Could not copy the prompt to clipboard.",
          variant: "destructive",
        });
      });
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'ta' : 'en'));
    toast({
      title: "Language Switched",
      description: `Language set to ${language === 'en' ? 'Tamil' : 'English'}. (Note: AI content generation is currently English-only)`,
    });
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <header className="w-full max-w-3xl mb-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-4xl font-headline font-bold text-primary flex items-center">
            <Wand2 className="mr-3 h-10 w-10 text-accent" />
            PromptWeaver
          </h1>
          <Button variant="outline" size="icon" onClick={toggleLanguage} aria-label="Switch Language">
            <Languages className="h-5 w-5" />
            <span className="ml-2 font-semibold">{language === 'en' ? 'EN' : 'TA'}</span>
          </Button>
        </div>
        <p className="text-lg text-foreground/80">Transform your simple ideas into powerful AI prompts with ease.</p>
      </header>

      <main className="w-full max-w-3xl space-y-8">
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">Craft Your Idea</CardTitle>
            <CardDescription>Select a detail level and describe your idea. We'll help you refine it.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label htmlFor="prompt-level-select" className="block text-sm font-medium text-foreground mb-1">Prompt Detail Level</label>
              <Select value={promptLevel} onValueChange={(value: PromptLevel) => setPromptLevel(value)}>
                <SelectTrigger id="prompt-level-select" className="w-full text-base py-3 rounded-md">
                  <SelectValue placeholder="Select a detail level..." />
                </SelectTrigger>
                <SelectContent>
                  {promptLevels.map(level => (
                    <SelectItem key={level.value} value={level.value} className="text-base py-2">
                       {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="prompt-input" className="block text-sm font-medium text-foreground mb-1">Your Idea</label>
              <Textarea
                id="prompt-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g., 'email to my boss about project delay', 'python script to sort files by date', 'fantasy story about a dragon learning to bake'"
                className="min-h-[120px] text-base p-3 rounded-md"
                aria-label="Your idea for a prompt"
              />
            </div>

            <Button 
              onClick={handleRefinePrompt} 
              disabled={isLoading || !inputText.trim()} 
              className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground rounded-md shadow-md hover:shadow-lg transition-shadow"
              aria-label="Refine Prompt"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              Refine My Idea
            </Button>
            {error && <p className="text-sm text-destructive mt-2 p-2 bg-destructive/10 rounded-md">{error}</p>}
          </CardContent>
        </Card>

        {refinedPrompts.length > 0 && (
          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary">Refined Prompt Suggestions</CardTitle>
              <CardDescription>Here are a few variations based on your idea and selected detail level. Copy the one you like best!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {refinedPrompts.map((prompt, index) => (
                <div key={index} className="border border-border p-4 rounded-lg bg-card shadow">
                  <p className="text-secondary-foreground whitespace-pre-wrap text-sm mb-3">{prompt}</p>
                  <Button onClick={() => handleCopyToClipboard(prompt)} variant="outline" size="sm" className="w-full text-base py-2.5 rounded-md">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Suggestion {index + 1}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} PromptWeaver. Weave your words wisely.</p>
      </footer>
    </div>
  );
}

