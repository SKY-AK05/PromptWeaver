document.addEventListener('DOMContentLoaded', function() {
  const languageToggle = document.getElementById('languageToggle');
  const promptLevel = document.getElementById('promptLevel');
  const promptInput = document.getElementById('promptInput');
  const refineButton = document.getElementById('refineButton');
  const results = document.getElementById('results');
  const suggestions = document.getElementById('suggestions');

  let currentLanguage = 'en';

  languageToggle.addEventListener('click', () => {
    currentLanguage = currentLanguage === 'en' ? 'ta' : 'en';
    languageToggle.textContent = currentLanguage.toUpperCase();
    showToast(`Language set to ${currentLanguage === 'en' ? 'English' : 'Tamil'}`);
  });

  refineButton.addEventListener('click', async () => {
    const input = promptInput.value.trim();
    if (!input) {
      showToast('Please enter an idea to refine', 'error');
      return;
    }

    try {
      refineButton.disabled = true;
      refineButton.innerHTML = '<span class="button-content">Refining...</span>';

      const refinedPrompts = await refinePrompt(input, promptLevel.value);
      displayResults(refinedPrompts);
    } catch (error) {
      showToast('Failed to refine prompt. Please try again.', 'error');
    } finally {
      refineButton.disabled = false;
      refineButton.innerHTML = '<span class="button-content"><span class="sparkle-icon">✨</span>Refine My Idea</span>';
    }
  });

  function displayResults(prompts) {
    suggestions.innerHTML = '';
    prompts.forEach((prompt, index) => {
      const suggestion = document.createElement('div');
      suggestion.className = 'suggestion';
      suggestion.innerHTML = `
        <p>${prompt}</p>
        <button class="copy-button" data-prompt="${encodeURIComponent(prompt)}">
          Copy Suggestion ${index + 1}
        </button>
      `;
      suggestions.appendChild(suggestion);
    });

    results.classList.remove('hidden');

    // Add click handlers for copy buttons
    document.querySelectorAll('.copy-button').forEach(button => {
      button.addEventListener('click', () => {
        const prompt = decodeURIComponent(button.dataset.prompt);
        navigator.clipboard.writeText(prompt)
          .then(() => showToast('Copied to clipboard!'))
          .catch(() => showToast('Failed to copy', 'error'));
      });
    });
  }

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Mock refinePrompt function - replace with actual API call
  async function refinePrompt(instruction, promptLevel) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return mock refined prompts
    return [
      `Here's a refined version of your prompt: ${instruction}`,
      `Alternative approach: ${instruction}`,
      `Another variation: ${instruction}`
    ];
  }
});