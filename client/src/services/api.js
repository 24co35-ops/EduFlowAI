import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('eduflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ponytail: automatic 401 handling to clear stale token and redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('eduflow_token');
      localStorage.removeItem('eduflow_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');
export const forgotPassword = (email) => API.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => API.post(`/auth/reset-password/${token}`, { password });

// Lessons API
export const generateLessonPlan = (formData) => API.post('/lessons/generate', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateLessonPlan = (id, data) => API.put(`/lessons/${id}`, data);
export const deleteLessonPlan = (id) => API.delete(`/lessons/${id}`);
export const translateLessonPlan = (data) => API.post('/lessons/translate', data);
export const getLessons = () => API.get('/lessons');
export const getLessonById = (id) => API.get(`/lessons/${id}`);

// Quizzes API
export const generateQuiz = (data) => API.post('/quizzes/generate', data);
export const updateQuiz = (id, data) => API.put(`/quizzes/${id}`, data);
export const regenerateQuestion = (data) => API.post('/quizzes/regenerate-question', data);
export const deleteQuiz = (id) => API.delete(`/quizzes/${id}`);
export const gradeQuizAttempt = (data) => API.post('/quizzes/grade', data);
export const getQuizzes = () => API.get('/quizzes');
export const getQuizById = (id) => API.get(`/quizzes/${id}`);
export const getAttempts = () => API.get('/quizzes/attempts');

// Student & Analytics API
export const generateFlashcards = (data) => API.post('/student/flashcards/generate', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getFlashcards = () => API.get('/student/flashcards');
export const getStudentProgress = () => API.get('/student/progress');
export const getTeacherAnalytics = () => API.get('/student/analytics');
export const generateRemediation = (data) => API.post('/student/remediation', data);

// Diagnostic Health API
export const getHealth = (diagnostics = true) => API.get(`/health?diagnostics=${diagnostics}`);

export default API;
