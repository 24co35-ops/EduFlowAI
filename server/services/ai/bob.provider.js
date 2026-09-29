/**
 * IBM watsonx.ai Granite Provider
 * Native integration with IBM Cloud watsonx.ai foundation models:
 * - Granite 13B / 20B / 3.x via IBM IAM + watsonx.ai REST API
 * - Optional secondary Hugging Face Granite runner (truthfully tagged)
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
    super('ibm_watsonx');

    // IBM Cloud watsonx credentials & config
    this.apiKey = process.env.WATSONX_APIKEY || process.env.WATSONX_API_KEY || process.env.IBM_CLOUD_API_KEY || '';
    this.projectId = process.env.WATSONX_PROJECT_ID || '';
    this.serviceUrl = (process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com').replace(/\/+$/, '');
    this.apiVersion = process.env.WATSONX_VERSION || '2023-05-29';

    // Model IDs (environment-driven, with sensible IBM Granite defaults)
    this.modelText = process.env.WATSONX_MODEL_TEXT || 'ibm/granite-13b-instruct-v2';
    this.modelChat = process.env.WATSONX_MODEL_CHAT || 'ibm/granite-13b-chat-v2';
    this.modelMultilingual = process.env.WATSONX_MODEL_MULTILINGUAL || 'ibm/granite-20b-multilingual';

    // Optional Hugging Face Granite secondary host
    this.hfToken = process.env.HF_API_TOKEN && process.env.HF_API_TOKEN !== 'your_huggingface_token_here'
      ? process.env.HF_API_TOKEN
      : '';
    this.hfModel = process.env.HF_GRANITE_MODEL || 'ibm-granite/granite-3.3-8b-instruct';

    // In-memory token cache for IBM Cloud IAM
    this.cachedIamToken = null;
    this.iamTokenExpiresAt = 0;
  }

  /**
   * Returns true only when valid IBM watsonx or HF Granite credentials exist.
   */
  isWatsonxConfigured() {
    return Boolean(
      this.apiKey &&
      this.apiKey.trim().length > 10 &&
      this.projectId &&
      this.projectId.trim().length > 5
    );
  }

  isHfConfigured() {
    return Boolean(this.hfToken && this.hfToken.trim().length > 10);
  }

  isConfigured() {
    return this.isWatsonxConfigured() || this.isHfConfigured();
  }

  getActiveProviderName() {
    if (this.isWatsonxConfigured()) return 'ibm_watsonx';
    if (this.isHfConfigured()) return 'ibm_granite_hf';
    return null;
  }

  /**
   * Fetch or reuse cached IBM Cloud IAM Bearer token
   */
  async getIamToken() {
    const now = Date.now();
    if (this.cachedIamToken && now < this.iamTokenExpiresAt - 60000) {
      return this.cachedIamToken;
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'urn:ibm:params:oauth:grant-type:apikey');
    params.append('apikey', this.apiKey);

    const tokenRes = await axios.post('https://iam.cloud.ibm.com/identity/token', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    const accessToken = tokenRes.data?.access_token;
    const expiresInSec = tokenRes.data?.expires_in || 3600;

    if (!accessToken) {
      throw new Error('Failed to retrieve IAM access token from IBM Cloud');
    }

    this.cachedIamToken = accessToken;
    this.iamTokenExpiresAt = now + (expiresInSec * 1000);
    return accessToken;
  }

  /**
   * Primary text generation via IBM watsonx.ai REST endpoint
   */
  async generateWatsonx({ prompt, modelId, maxTokens = 800, temperature = 0.7 }) {
    const token = await this.getIamToken();
    const endpoint = `${this.serviceUrl}/ml/v1/text/generation?version=${this.apiVersion}`;

    const payload = {
      input: prompt,
      parameters: {
        decoding_method: 'greedy',
        max_new_tokens: maxTokens,
        min_new_tokens: 1,
        temperature: temperature,
        repetition_penalty: 1.1
      },
      model_id: modelId || this.modelText,
      project_id: this.projectId
    };

    const res = await axios.post(endpoint, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 20000
    });

    const generated = res.data?.results?.[0]?.generated_text;
    return generated ? generated.trim() : null;
  }

  /**
   * Secondary execution via Hugging Face Granite router (truthfully recorded)
   */
  async generateHf({ prompt, maxTokens = 800 }) {
    const HF_ENDPOINT = 'https://router.huggingface.co/v1/chat/completions';
    const res = await axios.post(
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

    return res.data?.choices?.[0]?.message?.content || null;
  }

  /**
   * Router to generate text across configured IBM Granite backends
   */
  async generateText({ prompt, modelId, maxTokens = 800, temperature = 0.7 }) {
    if (this.isWatsonxConfigured()) {
      return await this.generateWatsonx({ prompt, modelId, maxTokens, temperature });
    }
    if (this.isHfConfigured()) {
      return await this.generateHf({ prompt, maxTokens });
    }
    return null;
  }

  async generateLessonPlan(syllabusText, subject = 'General Science', language = 'en') {
    const prompt = buildLessonPlanPrompt(syllabusText, subject, language);
    const raw = await this.generateText({ prompt, modelId: this.modelText, maxTokens: 1200 });

    if (!raw) return null;
    const parsed = safeExtractJson(raw);
    return validateLessonPlan(parsed, subject);
  }

  async generateQuiz(topic, difficulty = 'medium', questionCount = 4, grade = 'Class 10') {
    const prompt = buildQuizPrompt(topic, difficulty, questionCount, grade);
    const raw = await this.generateText({ prompt, modelId: this.modelText, maxTokens: 1500 });

    if (!raw) return null;
    const parsed = safeExtractJson(raw);
    return validateQuiz(parsed, difficulty);
  }

  async autoGradeAnswer(question, expectedAnswer, studentAnswer) {
    const prompt = buildGradingPrompt(question, expectedAnswer, studentAnswer);
    const raw = await this.generateText({ prompt, modelId: this.modelText, maxTokens: 400 });

    if (!raw) return null;
    const parsed = safeExtractJson(raw);
    return validateGrading(parsed);
  }

  async generateFlashcards(chapterText, title = 'Study Deck') {
    const prompt = buildFlashcardPrompt(chapterText, title);
    const raw = await this.generateText({ prompt, modelId: this.modelText, maxTokens: 1000 });

    if (!raw) return null;
    const parsed = safeExtractJson(raw);
    return validateFlashcards(parsed, title);
  }

  async solveDoubt(message, history = [], syllabusScope = 'Class 10 Science') {
    const prompt = buildDoubtPrompt(message, history, syllabusScope);
    const raw = await this.generateText({ prompt, modelId: this.modelChat, maxTokens: 600 });

    return raw ? raw.trim() : null;
  }

  async generateRemediation(topic, studentScore = 50, weakSubtopics = []) {
    const prompt = buildRemediationPrompt(topic, studentScore, weakSubtopics);
    const raw = await this.generateText({ prompt, modelId: this.modelText, maxTokens: 1200 });

    if (!raw) return null;
    const parsed = safeExtractJson(raw);
    return validateRemediation(parsed, topic);
  }

  async translateText(text, targetLang = 'hi') {
    const prompt = buildTranslationPrompt(text, targetLang);
    const raw = await this.generateText({ prompt, modelId: this.modelMultilingual, maxTokens: 1200 });

    return raw ? raw.trim() : null;
  }
}

module.exports = BobProvider;
