/**
 * Flashcard & Summary Prompt Builder
 */

function buildFlashcardPrompt(chapterText, title = 'Study Deck') {
  const safeText = String(chapterText || '').slice(0, 3500);
  const safeTitle = String(title || 'Study Deck').slice(0, 100);

  return `System: You are an educational content summarizer powered by IBM watsonx.ai Granite.
Analyze the chapter text below to create an executive study summary and 5 high-yield revision flashcards.

RULES:
1. "summary" must contain 3-4 concise bullet points of essential concepts.
2. "cards" must contain 5 objects with "front" (Question/Term/Concept) and "back" (Clear, accurate definition/answer).
3. Respond ONLY in valid JSON format matching the schema below.

SCHEMA:
{
  "title": "${safeTitle}",
  "summary": "• Point 1\\n• Point 2\\n• Point 3",
  "cards": [
    { "front": "Concept / Question", "back": "Definition / Answer" }
  ]
}

<<<CHAPTER_TEXT>>>
${safeText}
<<<END_CHAPTER_TEXT>>>`;
}

module.exports = { buildFlashcardPrompt };
