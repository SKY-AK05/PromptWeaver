"use client";

import type { SuggestTemplateInput, SuggestTemplateOutput } from '@/ai/flows/suggest-template';
import type { RefinePromptInput, RefinePromptOutput } from '@/ai/flows/refine-prompt';
import { refinePrompt } from '@/ai/flows/refine-prompt';
// import { suggestTemplate } from '@/ai/flows/suggest-template'; // Uncomment if suggestTemplate is used

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Languages, Copy, Loader2, Sparkles, Mail, FileText, Code, BookOpen, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

type PromptCategory = 'Email' | 'Resume' | 'Coding' | 'Story' | 'ChatGPT';
const promptCategories: { value: PromptCategory; label: string; icon: React.ElementType }[] = [
  { value: 'Email', label: 'Email', icon: Mail },
  { value: 'Resume', label: 'Resume', icon: FileText },
  { value: 'Coding', label: 'Coding', icon: Code },
  { value: 'Story', label: 'Story', icon: BookOpen },
  { value: 'ChatGPT', label: 'ChatGPT', icon: MessageSquare },
];

export default function PromptWeaverClient() {
  const [language, setLanguage] = React.useState<'en' | 'ta'>('en');
  const [category, setCategory] = React.useState<PromptCategory | undefined>(undefined);
  const [inputText, setInputText] = React.useState('');
  const [refinedPrompt, setRefinedPrompt] = React.useState('');
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
    setRefinedPrompt('');

    try {
      const input: RefinePromptInput = {
        instruction: inputText,
        category: category,
      };
      const result: RefinePromptOutput = await refinePrompt(input);
      setRefinedPrompt(result.refinedPrompt);
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

  const handleCopyToClipboard = () => {
    if (!refinedPrompt) return;
    navigator.clipboard.writeText(refinedPrompt)
      .then(() => {
        toast({
          title: "Copied!",
          description: "The refined prompt has been copied to your clipboard.",
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
    // Placeholder for actual language switching logic if UI text needs to change
    toast({
      title: "Language Switched",
      description: `Language set to ${language === 'en' ? 'Tamil' : 'English'}. (UI placeholder)`,
    });
  };
  
  const selectedCategoryIcon = category ? promptCategories.find(c => c.value === category)?.icon : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <header className="w-full max-w-3xl mb-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-4xl font-headline font-bold text-primary">PromptWeaver</h1>
          <Button variant="outline" size="icon" onClick={toggleLanguage} aria-label="Switch Language">
            <Languages className="h-5 w-5" />
            <span className="ml-2 font-semibold">{language === 'en' ? 'EN' : 'TA'}</span>
          </Button>
        </div>
        <p className="text-lg text-foreground/80">Transform your simple ideas into powerful AI prompts with ease.</p>
      </header>

      <main className="w-full max-w-3xl space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">Craft Your Prompt</CardTitle>
            <CardDescription>Select a category and describe your idea. We'll help you refine it.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label htmlFor="category-select" className="block text-sm font-medium text-foreground mb-1">Category (Optional)</label>
              <Select value={category} onValueChange={(value: PromptCategory) => setCategory(value)}>
                <SelectTrigger id="category-select" className="w-full text-base py-3">
                  <div className="flex items-center">
                    {selectedCategoryIcon && React.createElement(selectedCategoryIcon, { className: "mr-2 h-5 w-5 text-muted-foreground" })}
                    <SelectValue placeholder="Select a category..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {promptCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value} className="text-base py-2">
                       <div className="flex items-center">
                         <cat.icon className="mr-2 h-5 w-5 text-muted-foreground" />
                         {cat.label}
                       </div>
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
                placeholder="e.g., 'write email teacher sick', 'python script to parse csv', 'story about a lost robot'"
                className="min-h-[120px] text-base p-3"
                aria-label="Your idea for a prompt"
              />
            </div>

            <Button 
              onClick={handleRefinePrompt} 
              disabled={isLoading} 
              className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground"
              aria-label="Refine Prompt"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              Refine Prompt
            </Button>
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          </CardContent>
        </Card>

        {refinedPrompt && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary">Your Refined Prompt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-secondary p-4 rounded-md min-h-[100px] text-base text-secondary-foreground whitespace-pre-wrap">
                {refinedPrompt}
              </div>
              <Button onClick={handleCopyToClipboard} variant="outline" className="w-full text-base py-3">
                <Copy className="mr-2 h-5 w-5" />
                Copy Prompt
              </Button>
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
