/**
 * IBM BOB (watsonx.ai) Real Provider Implementation
 * 
 * Target Models:
 * - ibm/granite-13b-instruct-v2 (Curriculum structuring, Quiz synthesis, Flashcards, Auto-grading, Remediation)
 * - ibm/granite-13b-chat-v2 (Doubt solver chat)
 * - ibm/granite-20b-multilingual (Multilingual localization)
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

class BobProvider extends BaseAIProvider {
  constructor() {
    super('ibm_bob');
    this.apiUrl = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';
    this.apiKey = process.env.IBM_API_KEY || '';
    this.projectId = process.env.WATSONX_PROJECT_ID || '';
    this.apiVersion = process.env.WATSONX_API_VERSION || '2024-05-31';
    this.modelText = process.env.WATSONX_MODEL_TEXT || 'ibm/granite-13b-instruct-v2';
    this.modelChat = process.env.WATSONX_MODEL_CHAT || 'ibm/granite-13b-chat-v2';
    this.modelMultilingual = process.env.WATSONX_MODEL_MULTILINGUAL || 'ibm/granite-20b-multilingual';
    this.cachedToken = null;
    this.tokenExpiresAt = 0;
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 10 && this.projectId);
  }

  /**
   * Securely exchanges IBM Cloud API Key for an IAM OAuth 2.0 access token (cached for 50 mins).
   */
  async getAccessToken() {
    if (this.cachedToken && Date.now() < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    const res = await axios.post(
      'https://iam.cloud.ibm.com/identity/token',
      new URLSearchParams({
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey: this.apiKey
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000
      }
    );

    this.cachedToken = res.data.access_token;
    this.tokenExpiresAt = Date.now() + 3000 * 1000; // 50 mins
    return this.cachedToken;
  }

  /**
   * Centralized IBM watsonx.ai Text Generation execution
   */
  async generateText({ modelId, prompt, parameters = {} }) {
    if (!this.isConfigured()) {
      return null;
    }

    const token = await this.getAccessToken();
    const endpoint = `${this.apiUrl}/ml/v1/text/generation?version=${this.apiVersion}`;

    const decodingMethod = parameters.decoding_method || (parameters.temperature ? 'sample' : 'greedy');
    const reqParameters = {
      max_new_tokens: parameters.max_new_tokens || 1000,
      decoding_method: decodingMethod
    };
    if (decodingMethod === 'sample' && parameters.temperature) {
      reqParameters.temperature = parameters.temperature;
    }

    const response = await axios.post(
      endpoint,
      {
        model_id: modelId || this.modelText,
        input: prompt,
        parameters: reqParameters,
        project_id: this.projectId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    return response.data?.results?.[0]?.generated_text || null;
  }

  async generateLessonPlan(syllabusText, subject = 'General Science', language = 'en') {
    const prompt = buildLessonPlanPrompt(syllabusText, subject, language);
    const raw = await this.generateText({
      modelId: this.modelText,
      prompt,
      parameters: { max_new_tokens: 1200 }
    });

    if (!raw) return null;
    const parsed = safeExtractJson(raw);
    return validateLessonPlan(parsed, subject);
  }

  async generateQuiz(topic, difficulty = 'medium', questionCount = 4, grade = 'Class 10') {
    const prompt = buildQuizPrompt(topic, difficulty, questionCount, grade);
    const raw = await this.generateText({
      modelId: this.modelText,
      prompt,
      parameters: { max_new_tokens: 1500 }
    });

    if (!raw) return null;
    const parsed = safeExtractJson(raw);
    return validateQuiz(parsed, difficulty);
  }

  async autoGradeAnswer(question, expectedAnswer, studentAnswer) {
    const prompt = buildGradingPrompt(question, expectedAnswer, studentAnswer);
    const raw = await this.generateText({
      modelId: this.modelText,
      prompt,
      parameters: { max_new_tokens: 400 }
    });

    if (!raw) return null;
    const parsed = safeExtractJson(raw);
    return validateGrading(parsed);
  }

  async generateFlashcards(chapterText, title = 'Study Deck') {
    const prompt = buildFlashcardPrompt(chapterText, title);
    const raw = await this.generateText({
      modelId: this.modelText,
      prompt,
      parameters: { max_new_tokens: 1000 }
    });

    if (!raw) return null;
    const parsed = safeExtractJson(raw);
    return validateFlashcards(parsed, title);
  }

  async solveDoubt(message, history = [], syllabusScope = 'Class 10 Science') {
    const prompt = buildDoubtPrompt(message, history, syllabusScope);
    const raw = await this.generateText({
      modelId: this.modelChat,
      prompt,
      parameters: { max_new_tokens: 600, temperature: 0.6 }
    });

    return raw ? raw.trim() : null;
  }

  async generateRemediation(topic, studentScore = 50, weakSubtopics = []) {
    const prompt = buildRemediationPrompt(topic, studentScore, weakSubtopics);
    const raw = await this.generateText({
      modelId: this.modelText,
      prompt,
      parameters: { max_new_tokens: 1200 }
    });

    if (!raw) return null;
    const parsed = safeExtractJson(raw);
    return validateRemediation(parsed, topic);
  }

  async translateText(text, targetLang = 'hi') {
    const prompt = buildTranslationPrompt(text, targetLang);
    const raw = await this.generateText({
      modelId: this.modelMultilingual,
      prompt,
      parameters: { max_new_tokens: 1200 }
    });

    return raw ? raw.trim() : null;
  }
}

module.exports = BobProvider;
