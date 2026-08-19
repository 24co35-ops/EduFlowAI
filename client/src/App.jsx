import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import LessonPlannerPage from './pages/LessonPlannerPage';
import QuizBuilderPage from './pages/QuizBuilderPage';
import ClassAnalyticsPage from './pages/ClassAnalyticsPage';
import DoubtSolverPage from './pages/DoubtSolverPage';
import FlashcardsPage from './pages/FlashcardsPage';
import QuizAttemptPage from './pages/QuizAttemptPage';
import StudentProgressPage from './pages/StudentProgressPage';

export default function App() {
  const defaultUser = {
    id: 'demo-teacher-1',
    name: 'Anita Sharma',
    email: 'teacher@eduflow.ai',
    role: 'teacher',
    institution: 'Delhi Public School',
    grade: 'Class 10'
  };

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('eduflow_user');
    return saved ? JSON.parse(saved) : defaultUser;
  });

  useEffect(() => {
    if (!localStorage.getItem('eduflow_user')) {
      localStorage.setItem('eduflow_user', JSON.stringify(defaultUser));
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        
        {/* Navigation Header */}
        <Navbar user={user} setUser={setUser} />

        {/* Main Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
          {user && <Sidebar user={user} />}

          <div className="flex-1 min-w-0">
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage setUser={setUser} />} />
              <Route path="/register" element={<RegisterPage setUser={setUser} />} />

              {/* Dashboard Home Route (Role-based) */}
              <Route
                path="/"
                element={
                  user ? (
                    user.role === 'teacher' ? (
                      <TeacherDashboard user={user} />
                    ) : (
                      <StudentDashboard user={user} />
                    )
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              {/* Teacher Routes */}
              <Route path="/lesson-planner" element={<LessonPlannerPage />} />
              <Route path="/quiz-builder" element={<QuizBuilderPage />} />
              <Route path="/analytics" element={<ClassAnalyticsPage />} />

              {/* Student Routes */}
              <Route path="/doubt-solver" element={<DoubtSolverPage user={user} />} />
              <Route path="/flashcards" element={<FlashcardsPage />} />
              <Route path="/quizzes" element={<QuizAttemptPage />} />
              <Route path="/progress" element={<StudentProgressPage />} />

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 glass-card">
          <p>EduFlow AI © 2026 — IBM Hackathon Project powered by IBM watsonx.ai (Granite 13B & 20B)</p>
        </footer>

      </div>
    </BrowserRouter>
  );
}
