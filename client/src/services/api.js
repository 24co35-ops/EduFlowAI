import axios from 'axios';

const API = axios.create({
  baseURL: '/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('eduflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');

// Lessons API
export const generateLessonPlan = (formData) => API.post('/lessons/generate', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const translateLessonPlan = (data) => API.post('/lessons/translate', data);
export const getLessons = () => API.get('/lessons');
export const getLessonById = (id) => API.get(`/lessons/${id}`);

// Quizzes API
export const generateQuiz = (data) => API.post('/quizzes/generate', data);
export const gradeQuizAttempt = (data) => API.post('/quizzes/grade', data);
export const getQuizzes = () => API.get('/quizzes');
export const getQuizById = (id) => API.get(`/quizzes/${id}`);
export const getAttempts = () => API.get('/quizzes/attempts');

// Student & Analytics API
export const generateFlashcards = (data) => API.post('/student/flashcards/generate', data);
export const getFlashcards = () => API.get('/student/flashcards');
export const getStudentProgress = () => API.get('/student/progress');
export const getTeacherAnalytics = () => API.get('/student/analytics');

export default API;
