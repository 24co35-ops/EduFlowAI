/**
 * Abstract Base AI Provider Interface
 * Defines the standard contract all AI providers must satisfy.
 */

class BaseAIProvider {
  constructor(name) {
    this.name = name;
  }

  isConfigured() {
    throw new Error('isConfigured() must be implemented by subclass');
  }

  async generateLessonPlan(syllabusText, subject, language) {
    throw new Error('generateLessonPlan() must be implemented by subclass');
  }

  async generateQuiz(topic, difficulty, questionCount, grade) {
    throw new Error('generateQuiz() must be implemented by subclass');
  }

  async autoGradeAnswer(question, expectedAnswer, studentAnswer) {
    throw new Error('autoGradeAnswer() must be implemented by subclass');
  }

  async generateFlashcards(chapterText, title) {
    throw new Error('generateFlashcards() must be implemented by subclass');
  }

  async solveDoubt(message, history, syllabusScope) {
    throw new Error('solveDoubt() must be implemented by subclass');
  }

  async generateRemediation(topic, studentScore, weakSubtopics) {
    throw new Error('generateRemediation() must be implemented by subclass');
  }

  async translateText(text, targetLang) {
    throw new Error('translateText() must be implemented by subclass');
  }
}

module.exports = BaseAIProvider;
