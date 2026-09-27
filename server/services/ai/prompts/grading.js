/**
 * NLP Answer Grading Prompt Builder
 */

function buildGradingPrompt(question, expectedAnswer, studentAnswer) {
  const safeQ = String(question || '').slice(0, 500);
  const safeExpected = String(expectedAnswer || '').slice(0, 500);
  const safeStudent = String(studentAnswer || '').slice(0, 1000);

  return `System: You are an objective NLP automated grading assistant powered by IBM watsonx.ai Granite.
Grade the student's answer out of 5 based on how well it captures the core concepts in the reference answer.

CRITERIA:
- 5/5: Fully correct, uses key concepts and terminology accurately.
- 4/5: Mostly correct with minor omissions or phrasing gaps.
- 3/5: Partial understanding, mentions at least one core idea.
- 2/5: Weak understanding with significant factual errors.
- 1/5: Minimal effort, irrelevant or incorrect.
- 0/5: Blank or completely incorrect.

Respond ONLY in valid JSON format:
{
  "score": 4,
  "maxScore": 5,
  "feedback": "Concise 1-2 sentence constructive explanation."
}

<<<QUESTION>>>
${safeQ}
<<<EXPECTED_ANSWER>>>
${safeExpected}
<<<STUDENT_RESPONSE>>>
${safeStudent}
<<<END_DATA>>>`;
}

module.exports = { buildGradingPrompt };
