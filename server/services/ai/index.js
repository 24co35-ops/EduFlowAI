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
   * Safe wrapper that executes primary IBM watsonx / Granite engine, catches failures,
   * falls back gracefully, records telemetry, and attaches metadata.
   */
  async executeAITask({ feature, modelId, executeBob, executeFallback }) {
    const startTime = Date.now();
    let result = null;
    let provider = 'curriculum_engine';
    let model = 'curriculum-smart-engine-v1';
    let fallbackUsed = false;
    let executionState = 'LOCAL_FALLBACK';
    let error = null;

    // 1. Try IBM watsonx / Granite if configured
    if (this.bob.isConfigured()) {
      try {
        result = await executeBob();
        if (result) {
          provider = this.bob.getActiveProviderName() || 'ibm_watsonx';
          model = modelId || this.bob.modelText;
          executionState = 'LIVE_AI';
        }
      } catch (err) {
        console.warn(`[AIService] Primary AI provider (${this.bob.getActiveProviderName()}) for ${feature} failed:`, err.message);
        error = err.message;
      }
    }

    // 2. If IBM provider was unconfigured or did not return valid result -> Fallback
    if (!result) {
      fallbackUsed = true;
      const isGeminiAvailable = this.fallback.isConfigured();

      try {
        result = await executeFallback();
        if (result) {
          if (isGeminiAvailable && !result._deterministicFallback) {
            provider = 'gemini';
            model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
            executionState = 'LIVE_AI';
          } else {
            provider = 'curriculum_engine';
            model = 'curriculum-engine-v1';
            executionState = 'LOCAL_FALLBACK';
          }
        }
      } catch (err) {
        console.error(`[AIService] Fallback for ${feature} failed:`, err.message);
        error = (error ? error + ' | ' : '') + err.message;
        executionState = 'PROVIDER_UNAVAILABLE';
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
      executionState,
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
        executionState,
        timestamp: new Date().toISOString()
      }
    };
  }

  async generateLessonPlan(syllabusText, subject = 'General Science', language = 'en') {
    const { result, metadata } = await this.executeAITask({
      feature: 'lesson_generation',
      modelId: this.bob.modelText,
      executeBob: () => this.bob.generateLessonPlan(syllabusText, subject, language),
      executeFallback: () => this.fallback.generateLessonPlan(syllabusText, subject, language)
    });
    return { ...result, _aiMetadata: metadata };
  }

  async generateQuiz(topic, difficulty = 'medium', questionCount = 4, grade = 'Class 10') {
    const { result, metadata } = await this.executeAITask({
      feature: 'quiz_generation',
      modelId: this.bob.modelText,
      executeBob: () => this.bob.generateQuiz(topic, difficulty, questionCount, grade),
      executeFallback: () => this.fallback.generateQuiz(topic, difficulty, questionCount, grade)
    });
    return { questions: result, _aiMetadata: metadata };
  }

  async autoGradeAnswer(question, expectedAnswer, studentAnswer) {
    const { result, metadata } = await this.executeAITask({
      feature: 'auto_grading',
      modelId: this.bob.modelText,
      executeBob: () => this.bob.autoGradeAnswer(question, expectedAnswer, studentAnswer),
      executeFallback: () => this.fallback.autoGradeAnswer(question, expectedAnswer, studentAnswer)
    });
    return { ...result, _aiMetadata: metadata };
  }

  async generateFlashcards(chapterText, title = 'Study Deck') {
    const { result, metadata } = await this.executeAITask({
      feature: 'flashcard_generation',
      modelId: this.bob.modelText,
      executeBob: () => this.bob.generateFlashcards(chapterText, title),
      executeFallback: () => this.fallback.generateFlashcards(chapterText, title)
    });
    return { ...result, _aiMetadata: metadata };
  }

  async solveDoubt(message, history = [], syllabusScope = 'Class 10 Science') {
    const { result, metadata } = await this.executeAITask({
      feature: 'doubt_solver',
      modelId: this.bob.modelChat,
      executeBob: () => this.bob.solveDoubt(message, history, syllabusScope),
      executeFallback: () => this.fallback.solveDoubt(message, history, syllabusScope)
    });
    return { reply: result, _aiMetadata: metadata };
  }

  async generateRemediation(topic, studentScore = 50, weakSubtopics = []) {
    const { result, metadata } = await this.executeAITask({
      feature: 'remediation_generation',
      modelId: this.bob.modelText,
      executeBob: () => this.bob.generateRemediation(topic, studentScore, weakSubtopics),
      executeFallback: () => this.fallback.generateRemediation(topic, studentScore, weakSubtopics)
    });
    return { ...result, _aiMetadata: metadata };
  }

  async translateText(text, targetLang = 'hi') {
    const { result, metadata } = await this.executeAITask({
      feature: 'multilingual_translation',
      modelId: this.bob.modelMultilingual,
      executeBob: () => this.bob.translateText(text, targetLang),
      executeFallback: () => this.fallback.translateText(text, targetLang)
    });
    return { translatedText: result, _aiMetadata: metadata };
  }

  getHealthStatus() {
    const metrics = telemetry.getMetrics();
    const isWatsonx = this.bob.isWatsonxConfigured();
    const isHf = this.bob.isHfConfigured();
    const primaryName = isWatsonx
      ? 'IBM watsonx.ai (Granite Foundation Models)'
      : (isHf ? 'IBM Granite (via Hugging Face API)' : 'Curriculum Smart Engine (Deterministic Local)');

    return {
      status: 'online',
      primaryProvider: primaryName,
      providerType: this.bob.getActiveProviderName() || 'curriculum_engine',
      watsonxConfigured: isWatsonx,
      hfGraniteConfigured: isHf,
      ibmBobConnected: this.isBobConfigured(),
      geminiConfigured: this.isFallbackConfigured(),
      ragEngine: 'ready',
      activeModels: {
        instruct: this.bob.modelText,
        chat: this.bob.modelChat,
        multilingual: this.bob.modelMultilingual,
        serviceUrl: this.bob.serviceUrl,
        apiVersion: this.bob.apiVersion
      },
      metrics
    };
  }
}

module.exports = new AIService();
