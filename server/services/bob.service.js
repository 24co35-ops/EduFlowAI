/**
 * IBM BOB (watsonx.ai) Core Service Module
 * Backward-compatible bridge to modular server/services/ai/ architecture.
 */

const aiService = require('./ai');

class BobServiceWrapper {
  isConfigured() {
    return aiService.isBobConfigured();
  }

  async generateLessonPlan(syllabusText, subject = 'General Science', language = 'en') {
    const res = await aiService.generateLessonPlan(syllabusText, subject, language);
    return res;
  }

  async generateQuiz(topic, difficulty = 'medium', questionCount = 4, grade = 'Class 10') {
    const res = await aiService.generateQuiz(topic, difficulty, questionCount, grade);
    return res.questions || [];
  }

  async solveDoubt(userQuestion, chatHistory = [], syllabusScope = 'Class 10 Science') {
    const res = await aiService.solveDoubt(userQuestion, chatHistory, syllabusScope);
    return res.reply || 'EduFlow AI Tutor: Concept explained within syllabus guidelines.';
  }

  async generateFlashcards(chapterText, title = 'Study Deck') {
    const res = await aiService.generateFlashcards(chapterText, title);
    return res;
  }

  async autoGradeAnswer(question, expectedAnswer, studentAnswer) {
    const res = await aiService.autoGradeAnswer(question, expectedAnswer, studentAnswer);
    return res;
  }

  async generateRemediation(topic, studentScore = 50, weakSubtopics = []) {
    const res = await aiService.generateRemediation(topic, studentScore, weakSubtopics);
    return res;
  }

  async translateText(text, targetLang = 'hi') {
    const res = await aiService.translateText(text, targetLang);
    return res.translatedText || text;
  }

  getHealthStatus() {
    return aiService.getHealthStatus();
  }
}

module.exports = new BobServiceWrapper();
