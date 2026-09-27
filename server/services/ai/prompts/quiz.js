/**
 * Quiz Generation Prompt Builder
 */

function buildQuizPrompt(topic, difficulty = 'medium', questionCount = 4, grade = 'Class 10') {
  const sanitizedTopic = String(topic || 'Science').slice(0, 150);
  const validDifficulty = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';
  const count = Math.min(Math.max(parseInt(questionCount, 10) || 4, 2), 10);

  return `System: You are an assessment generation engine powered by IBM watsonx.ai Granite.
Generate a high-quality ${count}-question quiz on the topic "${sanitizedTopic}" for ${grade} at difficulty "${validDifficulty}".

RULES:
1. Include a mix of Multiple Choice (type: "mcq"), True/False (type: "truefalse"), and Short Answer (type: "short").
2. For "mcq", provide 4 distinct options and ensure "correctAnswer" exactly matches one of the options.
3. For "truefalse", provide options ["True", "False"] and set "correctAnswer" to one of them.
4. For "short", provide an empty array for options, and provide a clear model answer for "correctAnswer".
5. Provide a rigorous, educational explanation for each question.
6. Respond ONLY in a valid JSON array format.

SCHEMA:
[
  {
    "question": "Question text here?",
    "type": "mcq",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "difficulty": "${validDifficulty}",
    "explanation": "Clear explanation of why this answer is correct."
  }
]`;
}

module.exports = { buildQuizPrompt };
