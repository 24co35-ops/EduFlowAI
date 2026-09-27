/**
 * IBM Granite Provider — via Hugging Face Inference API (free tier, no IBM Cloud account needed)
 *
 * Model: ibm-granite/granite-3.3-8b-instruct (or any ibm-granite/* instruct model)
 * Endpoint: https://router.huggingface.co/v1/chat/completions  (OpenAI-compatible)
 */

const axios = require('axios');
const BaseAIProvider = require('./provider');
const { buildLessonPlanPrompt } = require('./prompts/lesson-plan');
const { buildQuizPrompt } = require('./prompts/quiz');
const { buildGradingPrompt } = require('./prompts/grading');
const { buildFlashcardPrompt } = require('./prompts/flashcards');
const { buildDoubtPrompt } = require('./prompts/doubt');
const { buildRemediationPrompt } = require('./prompts/remediation');
const { buildTranslationPrompt } = require('./prompts/translation');
const {
  safeExtractJson,
  validateLessonPlan,
  validateQuiz,
  validateGrading,
  validateFlashcards,
  validateRemediation
} = require('./validators/outputValidator');

const HF_ENDPOINT = 'https://router.huggingface.co/v1/chat/completions';

class BobProvider extends BaseAIProvider {
  constructor() {
    super('ibm_bob');
    this.hfToken = process.env.HF_API_TOKEN || '';
    this.hfModel = process.env.HF_GRANITE_MODEL || 'ibm-granite/granite-3.3-8b-instruct';
  }

  isConfigured() {
    return Boolean(this.hfToken && this.hfToken.trim().length > 10);
  }

  /**
   * Send a prompt to IBM Granite via HF's OpenAI-compatible chat completions router.
   * Returns the generated text string, or null on any failure.
   */
  async generateText({ prompt, maxTokens = 800 }) {
    if (!this.isConfigured()) return null;

    const response = await axios.post(
      HF_ENDPOINT,
      {
        model: this.hfModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens
      },
      {
        headers: {
          Authorization: `Bearer ${this.hfToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    return response.data?.choices?.[0]?.message?.content || null;
  }

  async generateLessonPlan(syllabusText, subject = 'General Science', language = 'en') {
    const prompt = buildLessonPlanPrompt(syllabusText, subject, language);
    const raw = await this.generateText({ prompt, maxTokens: 1200 });

    if (!raw) return null;
    const parsed = safeExtractJson(raw);
    return validateLessonPlan(parsed, subject);
  }

  async generateQuiz(topic, difficulty = 'medium', questionCount = 4, grade = 'Class 10') {
    const prompt = buildQuizPrompt(topic, difficulty, questionCount, grade);
    const raw = await this.generateText({ prompt, maxTokens: 1500 });

    if (!raw) return null;
    const parsed = safeExtractJson(raw);
    return validateQuiz(parsed, difficulty);
  }

  async autoGradeAnswer(question, expectedAnswer, studentAnswer) {
    const prompt = buildGradingPrompt(question, expectedAnswer, studentAnswer);
    const raw = await this.generateText({ prompt, maxTokens: 400 });

    if (!raw) return null;
    const parsed = safeExtractJson(raw);
    return validateGrading(parsed);
  }

  async generateFlashcards(chapterText, title = 'Study Deck') {
    const prompt = buildFlashcardPrompt(chapterText, title);
    const raw = await this.generateText({ prompt, maxTokens: 1000 });

    if (!raw) return null;
    const parsed = safeExtractJson(raw);
    return validateFlashcards(parsed, title);
  }

  async solveDoubt(message, history = [], syllabusScope = 'Class 10 Science') {
    const prompt = buildDoubtPrompt(message, history, syllabusScope);
    const raw = await this.generateText({ prompt, maxTokens: 600 });

    return raw ? raw.trim() : null;
  }

  async generateRemediation(topic, studentScore = 50, weakSubtopics = []) {
    const prompt = buildRemediationPrompt(topic, studentScore, weakSubtopics);
    const raw = await this.generateText({ prompt, maxTokens: 1200 });

    if (!raw) return null;
    const parsed = safeExtractJson(raw);
    return validateRemediation(parsed, topic);
  }

  async translateText(text, targetLang = 'hi') {
    const prompt = buildTranslationPrompt(text, targetLang);
    const raw = await this.generateText({ prompt, maxTokens: 1200 });

    return raw ? raw.trim() : null;
  }
}

module.exports = BobProvider;
