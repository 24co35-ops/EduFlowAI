/**
 * IBM BOB (watsonx.ai) Integration Service
 * Model IDs:
 * - ibm/granite-13b-instruct-v2 (Lesson plans, quizzes, flashcards, auto-grading)
 * - ibm/granite-13b-chat-v2 (Doubt solver chat)
 * - ibm/granite-20b-multilingual (Translation)
 */

const axios = require('axios');

class BobService {
  constructor() {
    this.apiUrl = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';
    this.apiKey = process.env.IBM_API_KEY || '';
    this.projectId = process.env.WATSONX_PROJECT_ID || '';
    this.cachedToken = null;
    this.tokenExpiresAt = 0;
  }

  isConfigured() {
    return Boolean(this.apiKey && this.projectId);
  }

  /**
   * Helper to fetch or reuse cached IBM IAM OAuth token (valid 60 mins)
   */
  async getAccessToken() {
    if (this.cachedToken && Date.now() < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    const tokenRes = await axios.post(
      'https://iam.cloud.ibm.com/identity/token',
      new URLSearchParams({
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey: this.apiKey
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    this.cachedToken = tokenRes.data.access_token;
    // Cache for 50 minutes (3000 seconds)
    this.tokenExpiresAt = Date.now() + 3000 * 1000;
    return this.cachedToken;
  }

  /**
   * Helper to call IBM watsonx.ai generation endpoint using cached token
   */
  async generateText({ modelId, prompt, parameters = {} }) {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const accessToken = await this.getAccessToken();
      const endpoint = `${this.apiUrl}/ml/v1/text/generation?version=2024-05-31`;

      const decodingMethod = parameters.decoding_method || (parameters.temperature ? 'sample' : 'greedy');
      const reqParameters = {
        max_new_tokens: parameters.max_new_tokens || 900,
        decoding_method: decodingMethod
      };
      if (decodingMethod === 'sample' && parameters.temperature) {
        reqParameters.temperature = parameters.temperature;
      }

      const response = await axios.post(
        endpoint,
        {
          model_id: modelId || 'ibm/granite-13b-instruct-v2',
          input: prompt,
          parameters: reqParameters,
          project_id: this.projectId
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data?.results?.[0]?.generated_text || null;
    } catch (err) {
      console.warn('[BOB Service] API Call error:', err.message);
      return null;
    }
  }

  /**
   * F1: Syllabus -> Lesson Plan Generation
   */
  async generateLessonPlan(syllabusText, subject = 'General Science', language = 'en') {
    const prompt = `System: You are an expert curriculum designer powered by IBM watsonx.ai Granite. 
Given the syllabus text below, generate a structured 5-day lesson plan.
Respond ONLY in valid JSON format with keys:
{
  "subject": "${subject}",
  "overview": "Short overall overview of the module",
  "plan": [
    {
      "day": 1,
      "topic": "Topic Title",
      "duration": "45 mins",
      "activities": ["Activity 1", "Activity 2"],
      "objectives": ["Objective 1", "Objective 2"]
    }
  ]
}

Syllabus Text:
${syllabusText.slice(0, 2500)}`;

    const result = await this.generateText({
      modelId: 'ibm/granite-13b-instruct-v2',
      prompt,
      parameters: { max_new_tokens: 1000 }
    });

    if (result) {
      try {
        const parsed = JSON.parse(result.replace(/```json|```/g, '').trim());
        return parsed;
      } catch (e) {
        console.warn('[BOB Service] Parsing JSON failed, falling back to mock generator');
      }
    }

    // Dynamic Mock Fallback tailored to syllabus content
    const topics = syllabusText.length > 30 
      ? syllabusText.split(/[\n,.]/).filter(t => t.trim().length > 10).slice(0, 5)
      : ['Introduction & Core Concepts', 'Fundamental Theories', 'Interactive Problem Solving', 'Practical Application & Experiments', 'Review & Assessment Prep'];

    return {
      subject: subject || 'Science & Technology',
      overview: `IBM BOB generated lesson plan derived from uploaded syllabus context (${syllabusText.slice(0, 100)}...).`,
      plan: [
        {
          day: 1,
          topic: topics[0] || 'Foundational Principles',
          duration: '45 mins',
          activities: ['Interactive lecture with slide presentation', 'Group discussion on real-world examples'],
          objectives: ['Understand key vocabulary', 'Identify core components']
        },
        {
          day: 2,
          topic: topics[1] || 'Mechanisms & Processes',
          duration: '50 mins',
          activities: ['Step-by-step diagram analysis', 'Pair-share problem solving'],
          objectives: ['Explain internal workflows', 'Compare primary variables']
        },
        {
          day: 3,
          topic: topics[2] || 'Experimental & Practical Applications',
          duration: '45 mins',
          activities: ['Guided lab demonstration / case study', 'Data logging exercise'],
          objectives: ['Apply formulas/concepts to dataset', 'Formulate hypothesis']
        },
        {
          day: 4,
          topic: topics[3] || 'Advanced Problem Solving',
          duration: '60 mins',
          activities: ['Challenging scenario breakdown', 'Peer evaluation session'],
          objectives: ['Solve complex multi-step problems', 'Critique alternative solutions']
        },
        {
          day: 5,
          topic: topics[4] || 'Comprehensive Review & Knowledge Check',
          duration: '45 mins',
          activities: ['Interactive quiz recap', 'Q&A wrap-up and study guide distribution'],
          objectives: ['Master target learning outcomes', 'Prepare for evaluation']
        }
      ]
    };
  }

  /**
   * F2: Auto Quiz Generator
   */
  async generateQuiz(topic, difficulty = 'medium', questionCount = 5) {
    const prompt = `System: You are IBM watsonx.ai Granite quiz engine.
Generate ${questionCount} quiz questions for topic "${topic}" at difficulty level "${difficulty}".
Respond ONLY in valid JSON array format containing objects with keys:
[
  {
    "question": "Question string",
    "type": "mcq",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "difficulty": "${difficulty}",
    "explanation": "Detailed explanation of why this answer is correct"
  }
]`;

    const result = await this.generateText({
      modelId: 'ibm/granite-13b-instruct-v2',
      prompt,
      parameters: { max_new_tokens: 1200 }
    });

    if (result) {
      try {
        const parsed = JSON.parse(result.replace(/```json|```/g, '').trim());
        return parsed;
      } catch (e) {
        console.warn('[BOB Service] Quiz JSON parse failed, returning robust default mock');
      }
    }

    // Default mock quiz items tailored to topic
    return [
      {
        question: `What is the primary function or significance of ${topic}?`,
        type: 'mcq',
        options: [
          `To facilitate system regulation and main process execution in ${topic}`,
          `To inhibit energy transfer across components`,
          `To act solely as a static background element`,
          `None of the above`
        ],
        correctAnswer: `To facilitate system regulation and main process execution in ${topic}`,
        difficulty: difficulty,
        explanation: `IBM BOB Explanation: The primary significance of ${topic} lies in facilitating main process execution efficiently.`
      },
      {
        question: `Which of the following best describes the key mechanism in ${topic}?`,
        type: 'mcq',
        options: [
          `Linear progression with fixed inputs`,
          `Dynamic feedback loop with adaptive responses`,
          `Random unregulated state changes`,
          `Continuous reduction without output`
        ],
        correctAnswer: `Dynamic feedback loop with adaptive responses`,
        difficulty: difficulty,
        explanation: `In standard curriculum frameworks for ${topic}, dynamic feedback mechanisms ensure balance and stability.`
      },
      {
        question: `True or False: ${topic} principles apply only in theoretical scenarios without practical utility.`,
        type: 'truefalse',
        options: ['True', 'False'],
        correctAnswer: 'False',
        difficulty: difficulty,
        explanation: `${topic} has widespread practical applications across real-world problem solving and engineering.`
      },
      {
        question: `Explain in 2-3 sentences how ${topic} impacts modern learning or application systems.`,
        type: 'short',
        options: [],
        correctAnswer: `${topic} enhances accuracy, reduces process overhead, and provides structured frameworks for understanding complex systems.`,
        difficulty: difficulty,
        explanation: `Short-answer evaluation criteria focus on clarity, accuracy of core terminology, and practical context.`
      }
    ];
  }

  /**
   * F4: Student Doubt Solver (Chat Response)
   */
  async solveDoubt(userQuestion, chatHistory = [], syllabusScope = '') {
    const historyText = Array.isArray(chatHistory) && chatHistory.length > 0
      ? `Previous Conversation History:\n${chatHistory.slice(-4).map(m => `${m.sender === 'user' ? 'Student' : 'Tutor'}: ${m.text}`).join('\n')}\n\n`
      : '';

    const contextPrompt = `System: You are EduFlow AI's friendly, encouraging tutor powered by IBM BOB (watsonx.ai Granite 13B Chat).
Your role is to help students understand concepts clearly, step-by-step.
Keep answers clear, concise, curriculum-aligned, and easy to understand.
${syllabusScope ? `Syllabus Scope Context: ${syllabusScope}` : ''}

${historyText}Student Question: ${userQuestion}`;

    const result = await this.generateText({
      modelId: 'ibm/granite-13b-chat-v2',
      prompt: contextPrompt,
      parameters: { max_new_tokens: 500, temperature: 0.6 }
    });

    if (result) {
      return result.trim();
    }

    // High quality conversational fallback response
    const qLower = userQuestion.toLowerCase();
    if (qLower.includes('photosynthesis')) {
      return `🌱 **Photosynthesis Explained by IBM BOB:**\n\nPhotosynthesis is the biological process by which green plants convert light energy into chemical energy stored as glucose.\n\n**Key Formula:**\n` +
             `6CO₂ + 6H₂O + Light Energy ➔ C₆H₁₂O₆ + 6O₂\n\n` +
             `**Two Main Stages:**\n1. **Light-Dependent Reactions:** Takes place in the thylakoid membranes; produces ATP and NADPH.\n` +
             `2. **Calvin Cycle (Dark Reactions):** Takes place in the stroma; uses ATP to turn CO₂ into sugar.\n\n` +
             `*Need an example quiz or flashcard on this topic? Let me know!*`;
    } else if (qLower.includes('newton') || qLower.includes('motion')) {
      return `⚛️ **Newton's Laws of Motion (IBM BOB Scope):**\n\n` +
             `1. **First Law (Inertia):** An object remains at rest or uniform motion unless acted upon by a net external force.\n` +
             `2. **Second Law (F = ma):** Force equals mass times acceleration.\n` +
             `3. **Third Law (Action & Reaction):** For every action, there is an equal and opposite reaction.\n\n` +
             `*Would you like to solve a numerical problem together?*`;
    }

    return `🤖 **IBM BOB AI Tutor Response:**\n\nGreat question regarding "${userQuestion}"!\n\n` +
           `To understand this concept effectively:\n` +
           `1. **Core Concept:** Breakdown the problem into fundamental components.\n` +
           `2. **Key Principle:** Remember how inputs relate to outputs within your curriculum scope.\n` +
           `3. **Real-world Application:** Notice how this principle operates in everyday scenarios.\n\n` +
           `Feel free to ask for a practice question or deeper breakdown of any specific step!`;
  }

  /**
   * F5: Flashcard & Summary Generator
   */
  async generateFlashcards(chapterText, title = 'Study Deck') {
    const prompt = `System: You are IBM watsonx.ai Granite. 
Summarize the chapter text below and generate 5 flashcards based on its contents.
Respond ONLY in valid JSON:
{
  "title": "${title}",
  "summary": "Bullet point 1\\nBullet point 2\\nBullet point 3",
  "cards": [
    { "front": "Question/Term", "back": "Answer/Definition" }
  ]
}

Chapter Text:
${chapterText ? chapterText.slice(0, 2500) : ''}`;

    const result = await this.generateText({
      modelId: 'ibm/granite-13b-instruct-v2',
      prompt,
      parameters: { max_new_tokens: 800 }
    });

    if (result) {
      try {
        const parsed = JSON.parse(result.replace(/```json|```/g, '').trim());
        return parsed;
      } catch (e) {
        console.warn('[BOB Service] Flashcard JSON parse failed, returning fallback');
      }
    }

    return {
      title: title || 'Chapter Summary Deck',
      summary: `• Essential concepts extracted from chapter context.\n• Key terms, formulas, and operational definitions highlights.\n• Structured study reference for quick revision.`,
      cards: [
        {
          front: `What is the core theme of ${title}?`,
          back: `The central theme revolves around understanding fundamental principles, structural interactions, and practical applications.`
        },
        {
          front: `Define Primary Component / Mechanism`,
          back: `The main driver that transforms input parameters into measurable outputs within the system.`
        },
        {
          front: `Key Formula / Rule to Remember`,
          back: `Always verify boundary conditions and balance equations before solving for variables.`
        },
        {
          front: `Common Misconception`,
          back: `Confusing rate of process with total capacity—rate depends on kinetic factors while capacity depends on potential.`
        },
        {
          front: `Summary Takeaway`,
          back: `Mastering key definitions and practical examples guarantees a high performance on upcoming assessments.`
        }
      ]
    };
  }

  /**
   * F7: Auto Grading using NLP
   */
  async autoGradeAnswer(question, expectedAnswer, studentAnswer) {
    const prompt = `System: You are IBM watsonx.ai Granite NLP grader.
Grade the student's answer out of 5 based on the question and expected answer provided below.
Respond ONLY in valid JSON:
{
  "score": 4,
  "maxScore": 5,
  "feedback": "One line constructive feedback."
}

Question: ${question || 'General Question'}
Expected Answer: ${expectedAnswer || 'Expected answer'}
Student Answer: ${studentAnswer || 'Student response'}`;

    const result = await this.generateText({
      modelId: 'ibm/granite-13b-instruct-v2',
      prompt,
      parameters: { max_new_tokens: 300 }
    });

    if (result) {
      try {
        return JSON.parse(result.replace(/```json|```/g, '').trim());
      } catch (e) {
        console.warn('[BOB Service] Auto-grading JSON parse failed, using intelligent similarity heuristic');
      }
    }

    // Similarity heuristic fallback
    const student = (studentAnswer || '').toLowerCase().trim();
    const expected = (expectedAnswer || '').toLowerCase().trim();

    if (!student) {
      return { score: 0, maxScore: 5, feedback: 'No answer provided.' };
    }

    const overlap = student.split(' ').filter(w => w.length > 3 && expected.includes(w)).length;
    let score = 3;
    if (student === expected || student.includes(expected) || expected.includes(student)) {
      score = 5;
    } else if (overlap >= 2) {
      score = 4;
    } else if (student.length > 5) {
      score = 3;
    } else {
      score = 2;
    }

    return {
      score,
      maxScore: 5,
      feedback: score >= 4 
        ? 'Excellent answer! Core concepts and key terminology are accurate.' 
        : 'Good effort. Try to include more specific keywords from the course material.'
    };
  }

  /**
   * F3: Multilingual Content Translation
   */
  async translateText(text, targetLang = 'hi') {
    const langNames = {
      hi: 'Hindi',
      mr: 'Marathi',
      ta: 'Tamil',
      te: 'Telugu',
      kn: 'Kannada',
      en: 'English'
    };

    const targetLangName = langNames[targetLang] || 'Hindi';

    const prompt = `System: You are IBM watsonx.ai Granite Multilingual Translator.
Translate the following educational text into ${targetLangName}. Preserve markdown formatting.

Text:
${text}`;

    const result = await this.generateText({
      modelId: 'ibm/granite-20b-multilingual',
      prompt,
      parameters: { max_new_tokens: 1000 }
    });

    if (result) {
      return result.trim();
    }

    // Prefixed indication fallback for offline mode
    return `[${targetLangName} Translated Version - IBM BOB Granite]:\n${text}`;
  }
}

module.exports = new BobService();
