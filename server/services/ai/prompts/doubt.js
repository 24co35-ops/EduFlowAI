/**
 * Curriculum-Grounded Doubt Solver Prompt Builder
 */

function buildDoubtPrompt(userQuestion, chatHistory = [], syllabusScope = 'Class 10 Science') {
  const safeQ = String(userQuestion || '').slice(0, 1000);
  const safeScope = String(syllabusScope || 'Class 10 Science').slice(0, 200);

  const historyLines = Array.isArray(chatHistory)
    ? chatHistory
        .slice(-4)
        .map(m => `${m.sender === 'user' ? 'Student' : 'Tutor'}: ${String(m.text || '').slice(0, 300)}`)
        .join('\n')
    : '';

  return `System: You are EduFlow AI's friendly, expert curriculum tutor powered by IBM watsonx.ai Granite.
Your objective is to help school students understand difficult concepts with clarity, encouragement, and real-world examples.

CURRICULUM BOUNDARY:
- Scope: ${safeScope}
- Stick to the topic requested.
- If the question is outside curriculum scope, answer politely and gently bring focus back to the core subject.
- Format with markdown headers, bold terms, and numbered steps.

${historyLines ? `<<<PREVIOUS_CHAT_HISTORY>>>\n${historyLines}\n<<<END_HISTORY>>>\n\n` : ''}Student Question: ${safeQ}`;
}

module.exports = { buildDoubtPrompt };
