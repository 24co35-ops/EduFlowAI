/**
 * Secondary AI Provider: Google Gemini & Smart Curriculum Fallback Engine
 * Provides resilient, zero-crash responses during development and demo environments.
 */

const axios = require('axios');
const BaseAIProvider = require('./provider');
const {
  safeExtractJson,
  validateLessonPlan,
  validateQuiz,
  validateGrading,
  validateFlashcards,
  validateRemediation
} = require('./validators/outputValidator');

class FallbackProvider extends BaseAIProvider {
  constructor() {
    super('fallback_engine');
    this.geminiKey = process.env.GEMINI_API_KEY || '';
    this.geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  isConfigured() {
    return Boolean(this.geminiKey && this.geminiKey.trim().length > 10);
  }

  async callGemini(promptText) {
    if (!this.isConfigured()) return null;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiKey}`;
      const res = await axios.post(
        url,
        { contents: [{ parts: [{ text: promptText }] }] },
        { headers: { 'Content-Type': 'application/json' }, timeout: 12000 }
      );

      const candidate = res.data?.candidates?.[0];
      // Gemini returns 200 but empty parts on safety blocks / MAX_TOKENS / recitation
      if (!candidate) return null;
      const finishReason = candidate.finishReason;
      if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
        console.warn(`[FallbackProvider] Gemini blocked (finishReason=${finishReason}), using deterministic fallback`);
        return null;
      }
      const text = candidate.content?.parts?.[0]?.text;
      return text && text.trim() ? text : null;
    } catch (err) {
      // Axios wraps Gemini 4xx errors; also catches network timeouts
      const geminiMsg = err.response?.data?.error?.message || err.message;
      console.warn('[FallbackProvider] Gemini API warning:', geminiMsg);
      return null;
    }
  }

  async generateLessonPlan(syllabusText, subject = 'General Science', language = 'en') {
    // 1. Try Gemini
    const geminiPrompt = `You are an educational curriculum planner. Given syllabus:\n${syllabusText.slice(0, 3000)}\n\nGenerate a JSON 5-day lesson plan for subject "${subject}". Schema: {"subject": "${subject}", "overview": "...", "plan": [{"day": 1, "topic": "...", "duration": "45 mins", "activities": ["..."], "objectives": ["..."]}]}`;
    const raw = await this.callGemini(geminiPrompt);
    if (raw) {
      const parsed = safeExtractJson(raw);
      const validated = validateLessonPlan(parsed, subject);
      if (validated) return validated;
    }

    // 2. Deterministic Smart Curriculum Generation
    const cleanLines = (syllabusText || '')
      .split(/[\n,;]/)
      .map(s => s.trim().replace(/^[-*•\d.]+\s*/, ''))
      .filter(s => s.length > 5);

    const topic1 = cleanLines[0] || 'Foundational Principles & Concepts';
    const topic2 = cleanLines[1] || 'Core Mechanisms & Theoretical Frameworks';
    const topic3 = cleanLines[2] || 'Experimental Analysis & Problem Sets';
    const topic4 = cleanLines[3] || 'Advanced Problem Solving & Case Studies';
    const topic5 = cleanLines[4] || 'Comprehensive Review & Assessment';

    return {
      subject: subject || 'Science & Technology',
      overview: `Structured 5-day curriculum plan covering ${topic1}, ${topic2}, and practical problem solving.`,
      plan: [
        {
          day: 1,
          topic: topic1,
          duration: '45 mins',
          activities: ['Interactive lecture with real-world examples', 'Concept mapping exercise'],
          objectives: ['Define fundamental terminology', 'Identify core components']
        },
        {
          day: 2,
          topic: topic2,
          duration: '50 mins',
          activities: ['Step-by-step diagram analysis', 'Pair-share problem solving'],
          objectives: ['Explain internal workflows', 'Compare primary variables']
        },
        {
          day: 3,
          topic: topic3,
          duration: '45 mins',
          activities: ['Guided lab demonstration / case study', 'Data logging exercise'],
          objectives: ['Apply formulas to datasets', 'Formulate hypotheses']
        },
        {
          day: 4,
          topic: topic4,
          duration: '60 mins',
          activities: ['Challenging scenario breakdown', 'Peer evaluation session'],
          objectives: ['Solve complex multi-step problems', 'Critique alternative solutions']
        },
        {
          day: 5,
          topic: topic5,
          duration: '45 mins',
          activities: ['Interactive recap quiz', 'Q&A wrap-up and study guide distribution'],
          objectives: ['Master target learning outcomes', 'Prepare for evaluation']
        }
      ]
    };
  }

  async generateQuiz(topic, difficulty = 'medium', questionCount = 4, grade = 'Class 10') {
    const geminiPrompt = `Generate a ${questionCount}-question quiz JSON array for topic "${topic}" (${difficulty}) for ${grade}. Schema: [{"question": "...", "type": "mcq", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "difficulty": "${difficulty}", "explanation": "..."}]`;
    const raw = await this.callGemini(geminiPrompt);
    if (raw) {
      const parsed = safeExtractJson(raw);
      const validated = validateQuiz(parsed, difficulty);
      if (validated) return validated;
    }

    // Deterministic Smart Quiz Generator tailored to topic
    return [
      {
        question: `What is the primary function or significance of ${topic}?`,
        type: 'mcq',
        options: [
          `Facilitates system regulation and core process execution in ${topic}`,
          `Inhibits energy transfer across components`,
          `Acts solely as a passive background element`,
          `None of the above`
        ],
        correctAnswer: `Facilitates system regulation and core process execution in ${topic}`,
        difficulty,
        explanation: `The primary significance of ${topic} lies in facilitating core process execution efficiently within the curriculum.`
      },
      {
        question: `Which mechanism best describes the behavior of ${topic}?`,
        type: 'mcq',
        options: [
          `Linear progression with fixed inputs`,
          `Dynamic feedback loop with balanced equilibrium`,
          `Unregulated random state variations`,
          `Static reduction without measurable output`
        ],
        correctAnswer: `Dynamic feedback loop with balanced equilibrium`,
        difficulty,
        explanation: `In standard curriculum frameworks for ${topic}, dynamic feedback mechanisms ensure balance and stability.`
      },
      {
        question: `True or False: Principles of ${topic} apply exclusively to theoretical models without practical application.`,
        type: 'truefalse',
        options: ['True', 'False'],
        correctAnswer: 'False',
        difficulty,
        explanation: `${topic} has extensive practical applications across real-world problem solving and engineering.`
      },
      {
        question: `Explain in 2-3 sentences the core principle behind ${topic} and how it impacts system performance.`,
        type: 'short',
        options: [],
        correctAnswer: `${topic} provides a structured mechanism that optimizes efficiency, maintains stability, and governs interactions between key variables.`,
        difficulty,
        explanation: `Evaluation rubrics prioritize clear terminology, cause-and-effect relationship, and direct conceptual accuracy.`
      }
    ];
  }

  async autoGradeAnswer(question, expectedAnswer, studentAnswer) {
    const geminiPrompt = `Grade student answer out of 5 based on expected answer. Question: "${question}", Expected: "${expectedAnswer}", Student: "${studentAnswer}". Return JSON: {"score": 4, "maxScore": 5, "feedback": "..."}`;
    const raw = await this.callGemini(geminiPrompt);
    if (raw) {
      const parsed = safeExtractJson(raw);
      const validated = validateGrading(parsed);
      if (validated) return validated;
    }

    const student = (studentAnswer || '').toLowerCase().trim();
    const expected = (expectedAnswer || '').toLowerCase().trim();

    if (!student) {
      return { score: 0, maxScore: 5, feedback: 'No answer provided.' };
    }

    const expectedWords = expected.split(/\s+/).filter(w => w.length > 3);
    const overlap = expectedWords.filter(w => student.includes(w)).length;

    let score = 3;
    if (student === expected || student.includes(expected)) {
      score = 5;
    } else if (overlap >= 3 || (expectedWords.length > 0 && overlap / expectedWords.length >= 0.5)) {
      score = 4;
    } else if (overlap >= 1 || student.length > 20) {
      score = 3;
    } else {
      score = 2;
    }

    return {
      score,
      maxScore: 5,
      feedback: score >= 4
        ? 'Excellent understanding! Core terminology and key principles are accurately captured.'
        : 'Good effort. Try to include more specific keywords and formula relationships.'
    };
  }

  async generateFlashcards(chapterText, title = 'Study Deck') {
    const geminiPrompt = `Summarize and generate 5 flashcards JSON for chapter "${title}". Text: ${chapterText.slice(0, 3000)}. Schema: {"title": "${title}", "summary": "...", "cards": [{"front": "...", "back": "..."}]}`;
    const raw = await this.callGemini(geminiPrompt);
    if (raw) {
      const parsed = safeExtractJson(raw);
      const validated = validateFlashcards(parsed, title);
      if (validated) return validated;
    }

    const sentences = (chapterText || '')
      .split(/[.!?]/)
      .map(s => s.trim())
      .filter(s => s.length > 20);

    const cards = sentences.slice(0, 5).map((sentence, i) => ({
      front: `Key Principle ${i + 1}`,
      back: sentence
    }));

    if (cards.length < 3) {
      cards.push(
        { front: `Core Theme of ${title}`, back: `The central theme covers foundational principles, structural mechanisms, and practical applications.` },
        { front: 'Primary Formula / Rule', back: 'Verify boundary conditions and balance conservation equations before computing variables.' },
        { front: 'Common Misconception', back: 'Do not confuse the rate of a process with its total capacity.' }
      );
    }

    return {
      title: title || 'Chapter Summary Deck',
      summary: `• Essential principles extracted from ${title}.\n• High-yield definitions, mechanisms, and formulas.\n• Designed for rapid revision before assessments.`,
      cards
    };
  }

  async solveDoubt(message, history = [], syllabusScope = 'Class 10 Science') {
    const geminiPrompt = `You are EduFlow AI Tutor for school students. Syllabus Scope: ${syllabusScope}. Answer this student doubt clearly, step-by-step with markdown formulas/examples: "${message}"`;
    const raw = await this.callGemini(geminiPrompt);
    if (raw) return raw.trim();

    const q = (message || '').toLowerCase();
    if (q.includes('photosynthesis') || q.includes('chlorophyll')) {
      return `🌱 **Photosynthesis Explained:**\n\n**Chemical Equation:**\n6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂\n\n**Two Main Stages:**\n1. **Light-Dependent Reactions** (Thylakoid membrane):\n   - Absorbs sunlight via chlorophyll\n   - Produces ATP & NADPH\n   - Splits water molecules (photolysis)\n\n2. **Calvin Cycle / Dark Reactions** (Stroma):\n   - Uses ATP to fix CO₂ into glucose\n   - Doesn't directly need light\n\n**Key Point:** Chlorophyll absorbs red & blue light but reflects green (that's why plants look green!)`;
    } else if (q.includes('ohm') || q.includes('v=ir') || q.includes('resistance')) {
      return `⚡ **Ohm's Law Explained:**\n\n**Formula:** V = I × R\n- **V** = Voltage (Volts, V)\n- **I** = Current (Amperes, A)\n- **R** = Resistance (Ohms, Ω)\n\n**What it means:**\nThe voltage across a conductor is directly proportional to the current flowing through it, when temperature is constant.\n\n**Example:** If R = 10Ω and I = 2A:\nV = 2 × 10 = **20 Volts**`;
    } else if (q.includes('newton') || q.includes('motion') || q.includes('inertia')) {
      return `⚛️ **Newton's Laws of Motion:**\n\n1. **1st Law (Inertia):** An object stays at rest or in uniform motion unless acted on by an external force.\n2. **2nd Law (F = ma):** Force equals mass times acceleration.\n3. **3rd Law (Action-Reaction):** Every action has an equal and opposite reaction.`;
    }

    return `🤖 **EduFlow AI Tutor Response:**\n\nGreat question regarding *"${message}"*!\n\nHere is how to break down this concept step-by-step:\n\n1. **Core Principle:** Identify the fundamental definitions and variables in your syllabus.\n2. **Mechanism:** Understand how changing one variable influences the overall outcome.\n3. **Real-World Application:** Connect this concept to observable everyday phenomena.\n\n💡 *Tip: Feel free to ask for a practice problem or a simplified summary of this topic!*`;
  }

  async generateRemediation(topic, studentScore = 50, weakSubtopics = []) {
    const geminiPrompt = `Generate remediation JSON for student who scored ${studentScore}% on "${topic}". Schema: {"topic": "${topic}", "explanation": "...", "realWorldExample": "...", "commonMisconception": "...", "practiceQuestions": [{"question": "...", "options": ["A", "B"], "correctAnswer": "A", "explanation": "..."}], "recommendedAction": "..."}`;
    const raw = await this.callGemini(geminiPrompt);
    if (raw) {
      const parsed = safeExtractJson(raw);
      const validated = validateRemediation(parsed, topic);
      if (validated) return validated;
    }

    return {
      topic: topic || 'Core Concept Review',
      explanation: `**3-Minute Deep Dive on ${topic}:**\n\nThe fundamental mistake most students make in ${topic} is memorizing the formula without visualizing the physical mechanism.\n\n1. **Primary Driver:** Focus on what creates the initial change or transfer.\n2. **Balancing Factor:** Notice what resists or limits the flow.\n3. **End Result:** Check how the outputs conserve overall energy or mass.`,
      realWorldExample: `Imagine ${topic} like a water supply network: the water pressure represents the potential driving force, the pipe thickness represents resistance, and the water flow rate is the resulting output.`,
      commonMisconception: `Misconception: Assuming that doubling the driving force always doubles the output regardless of resistance. In reality, internal resistance and temperature changes must be accounted for!`,
      practiceQuestions: [
        {
          question: `In ${topic}, what happens when the primary variable is doubled while resistance is held constant?`,
          options: ['Output doubles', 'Output is halved', 'Output remains unchanged', 'Output drops to zero'],
          correctAnswer: 'Output doubles',
          explanation: 'Because of direct proportionality (V = I × R), doubling potential doubles current.'
        },
        {
          question: `True or False: Boundary conditions in ${topic} can be ignored if the overall average is correct.`,
          options: ['True', 'False'],
          correctAnswer: 'False',
          explanation: 'Boundary conditions dictate the operational limits and stability of the system.'
        },
        {
          question: `Which factor directly governs the efficiency of ${topic}?`,
          options: ['Minimizing energy dissipation', 'Increasing uncalibrated speed', 'Ignoring thermal effects'],
          correctAnswer: 'Minimizing energy dissipation',
          explanation: 'Higher efficiency is achieved by reducing parasitic resistance and thermal loss.'
        }
      ],
      recommendedAction: `Complete the 3 practice questions above, then ask IBM BOB Tutor for a live 5-minute practice session.`
    };
  }

  async translateText(text, targetLang = 'hi') {
    const langNames = {
      hi: 'Hindi (हिंदी)',
      mr: 'Marathi (मराठी)',
      ta: 'Tamil (தமிழ்)',
      te: 'Telugu (తెలుగు)',
      kn: 'Kannada (ಕನ್ನಡ)',
      en: 'English'
    };
    const targetName = langNames[targetLang] || 'Hindi';

    const geminiPrompt = `Translate this educational text into ${targetName}. Preserve markdown and JSON formatting:\n${text}`;
    const raw = await this.callGemini(geminiPrompt);
    if (raw) return raw.trim();

    return `[${targetName} Version]:\n${text}`;
  }
}

module.exports = FallbackProvider;
