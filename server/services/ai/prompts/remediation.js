/**
 * AI-Generated Remediation Prompt Builder
 * Generates closed-loop targeted micro-lessons and practice questions for struggling students.
 */

function buildRemediationPrompt(topic, studentScore = 50, weakSubtopics = []) {
  const safeTopic = String(topic || 'Core Concept').slice(0, 150);
  const subtopicsText = Array.isArray(weakSubtopics) && weakSubtopics.length > 0
    ? weakSubtopics.join(', ')
    : 'Fundamentals & core definitions';

  return `System: You are an adaptive remediation specialist powered by IBM watsonx.ai Granite.
A student scored ${studentScore}% on the topic "${safeTopic}" (Subtopics of concern: ${subtopicsText}).
Generate a personalized, high-impact remedial micro-module to help them achieve mastery.

SCHEMA:
Respond ONLY in valid JSON format:
{
  "topic": "${safeTopic}",
  "explanation": "3-minute concise explanation breaking down the core intuition with bullet points.",
  "realWorldExample": "An engaging, tangible real-world analogy or example.",
  "commonMisconception": "Identify the common misconception students make and why it is wrong.",
  "practiceQuestions": [
    {
      "question": "Practice Question 1",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "Why A is correct"
    },
    {
      "question": "Practice Question 2",
      "options": ["True", "False"],
      "correctAnswer": "True",
      "explanation": "Why True is correct"
    },
    {
      "question": "Practice Question 3",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Option 1",
      "explanation": "Detailed explanation"
    }
  ],
  "recommendedAction": "Concrete next study step for the student."
}`;
}

module.exports = { buildRemediationPrompt };
