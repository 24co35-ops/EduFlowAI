/**
 * Central AI Orchestration Service
 * Connects IBM watsonx.ai BOB (Granite 13B & 20B) as Primary Engine
 * with Google Gemini / Curriculum Smart Engine as Fallback.
 */

const BobProvider = require('./bob.provider');
const FallbackProvider = require('./fallback.provider');
const telemetry = require('./telemetry');

class AIService {
  constructor() {
    this.bob = new BobProvider();
    this.fallback = new FallbackProvider();
  }

  isBobConfigured() {
    return this.bob.isConfigured();
  }

  isFallbackConfigured() {
    return this.fallback.isConfigured();
  }

  /**
   * Safe wrapper that executes primary IBM BOB engine, catches failures,
   * falls back gracefully, records telemetry, and attaches metadata.
   */
  async executeAITask({ feature, modelId, executeBob, executeFallback }) {
    const startTime = Date.now();
    let result = null;
    let provider = 'fallback_engine';
    let model = 'curriculum-smart-engine';
    let fallbackUsed = false;
    let error = null;

    // 1. Try IBM BOB (watsonx.ai) if configured
    if (this.bob.isConfigured()) {
      try {
        result = await executeBob();
        if (result) {
          provider = 'ibm_bob';
          model = modelId || 'ibm/granite-13b-instruct-v2';
        }
      } catch (err) {
        console.warn(`[AIService] IBM BOB ${feature} failed:`, err.message);
        error = err.message;
      }
    }

    // 2. If IBM BOB was not configured or did not return valid result -> Fallback
    if (!result) {
      fallbackUsed = true;
      provider = this.fallback.isConfigured() ? 'gemini' : 'curriculum_engine';
      model = this.fallback.isConfigured() ? (process.env.GEMINI_MODEL || 'gemini-1.5-flash') : 'curriculum-engine-v1';

      try {
        result = await executeFallback();
      } catch (err) {
        console.error(`[AIService] Fallback for ${feature} failed:`, err.message);
        error = (error ? error + ' | ' : '') + err.message;
      }
    }

    const latencyMs = Date.now() - startTime;
    const success = Boolean(result);

    telemetry.recordRequest({
      feature,
      provider,
      model,
      latencyMs,
      success,
      fallbackUsed,
      validationPassed: success,
      error
    });

    return {
      result,
      metadata: {
        provider,
        model,
        latencyMs,
        fallbackUsed,
        timestamp: new Date().toISOString()
      }
    };
  }

  async generateLessonPlan(syllabusText, subject = 'General Science', language = 'en') {
    const { result, metadata } = await this.executeAITask({
      feature: 'lesson_generation',
      modelId: 'ibm/granite-13b-instruct-v2',
      executeBob: () => this.bob.generateLessonPlan(syllabusText, subject, language),
      executeFallback: () => this.fallback.generateLessonPlan(syllabusText, subject, language)
    });
    return { ...result, _aiMetadata: metadata };
  }

  async generateQuiz(topic, difficulty = 'medium', questionCount = 4, grade = 'Class 10') {
    const { result, metadata } = await this.executeAITask({
      feature: 'quiz_generation',
      modelId: 'ibm/granite-13b-instruct-v2',
      executeBob: () => this.bob.generateQuiz(topic, difficulty, questionCount, grade),
      executeFallback: () => this.fallback.generateQuiz(topic, difficulty, questionCount, grade)
    });
    return { questions: result, _aiMetadata: metadata };
  }

  async autoGradeAnswer(question, expectedAnswer, studentAnswer) {
    const { result, metadata } = await this.executeAITask({
      feature: 'auto_grading',
      modelId: 'ibm/granite-13b-instruct-v2',
      executeBob: () => this.bob.autoGradeAnswer(question, expectedAnswer, studentAnswer),
      executeFallback: () => this.fallback.autoGradeAnswer(question, expectedAnswer, studentAnswer)
    });
    return { ...result, _aiMetadata: metadata };
  }

  async generateFlashcards(chapterText, title = 'Study Deck') {
    const { result, metadata } = await this.executeAITask({
      feature: 'flashcard_generation',
      modelId: 'ibm/granite-13b-instruct-v2',
      executeBob: () => this.bob.generateFlashcards(chapterText, title),
      executeFallback: () => this.fallback.generateFlashcards(chapterText, title)
    });
    return { ...result, _aiMetadata: metadata };
  }

  async solveDoubt(message, history = [], syllabusScope = 'Class 10 Science') {
    const { result, metadata } = await this.executeAITask({
      feature: 'doubt_solver',
      modelId: 'ibm/granite-13b-chat-v2',
      executeBob: () => this.bob.solveDoubt(message, history, syllabusScope),
      executeFallback: () => this.fallback.solveDoubt(message, history, syllabusScope)
    });
    return { reply: result, _aiMetadata: metadata };
  }

  async generateRemediation(topic, studentScore = 50, weakSubtopics = []) {
    const { result, metadata } = await this.executeAITask({
      feature: 'remediation_generation',
      modelId: 'ibm/granite-13b-instruct-v2',
      executeBob: () => this.bob.generateRemediation(topic, studentScore, weakSubtopics),
      executeFallback: () => this.fallback.generateRemediation(topic, studentScore, weakSubtopics)
    });
    return { ...result, _aiMetadata: metadata };
  }

  async translateText(text, targetLang = 'hi') {
    const { result, metadata } = await this.executeAITask({
      feature: 'multilingual_translation',
      modelId: 'ibm/granite-20b-multilingual',
      executeBob: () => this.bob.translateText(text, targetLang),
      executeFallback: () => this.fallback.translateText(text, targetLang)
    });
    return { translatedText: result, _aiMetadata: metadata };
  }

  getHealthStatus() {
    const metrics = telemetry.getMetrics();
    return {
      status: 'online',
      primaryProvider: 'IBM BOB (watsonx.ai Granite)',
      ibmBobConnected: this.isBobConfigured(),
      geminiConfigured: this.isFallbackConfigured(),
      ragEngine: 'ready',
      activeModels: {
        instruct: this.bob.modelText,
        chat: this.bob.modelChat,
        multilingual: this.bob.modelMultilingual,
        apiVersion: this.bob.apiVersion
      },
      metrics
    };
  }
}

module.exports = new AIService();
