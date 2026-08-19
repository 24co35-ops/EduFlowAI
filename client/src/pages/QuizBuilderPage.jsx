import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  FileCheck2, 
  CheckCircle, 
  HelpCircle, 
  Zap, 
  Send, 
  Layers, 
  Loader2,
  ListPlus
} from 'lucide-react';
import { generateQuiz, getQuizzes } from '../services/api';

export default function QuizBuilderPage() {
  const [topic, setTopic] = useState('Photosynthesis & Cellular Respiration');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  useEffect(() => {
    async function loadQuizzes() {
      try {
        const res = await getQuizzes();
        if (res.data.quizzes && res.data.quizzes.length > 0) {
          setQuizzes(res.data.quizzes);
          setActiveQuiz(res.data.quizzes[0]);
        }
      } catch (err) {
        console.warn('Quiz fetch error:', err);
      }
    }
    loadQuizzes();
  }, []);

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPublishedSuccess(false);

    try {
      const res = await generateQuiz({ topic, difficulty, questionCount });
      if (res.data.success) {
        setActiveQuiz(res.data.quiz);
        setQuizzes([res.data.quiz, ...quizzes]);
      }
    } catch (err) {
      alert('Error generating quiz: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = () => {
    setPublishedSuccess(true);
    setTimeout(() => setPublishedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
            <Zap className="w-3.5 h-3.5" /> Feature F2: IBM BOB Auto Quiz Engine
          </div>
          <h1 className="text-3xl font-extrabold text-white font-outfit">Auto Quiz Builder</h1>
          <p className="text-xs text-slate-400">Generate adaptive MCQs, Short Answers, and True/False questions instantly with IBM Granite models</p>
        </div>

        {activeQuiz && (
          <button
            onClick={handlePublish}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all"
          >
            <Send className="w-4 h-4" /> Publish to Class 10
          </button>
        )}
      </div>

      {publishedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> Quiz successfully published to student portal!
          </div>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Controls */}
        <div className="lg:col-span-5 space-y-6">
          
          <form onSubmit={handleGenerateQuiz} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-5">
            <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" /> Quiz Parameters
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Topic or Chapter Title</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                placeholder="e.g. Newton Laws of Motion"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['easy', 'medium', 'hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold capitalize border transition-all ${
                      difficulty === diff
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Number of Questions</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
              >
                <option value={3}>3 Questions (Quick Check)</option>
                <option value={5}>5 Questions (Standard)</option>
                <option value={8}>8 Questions (Comprehensive Test)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>IBM BOB Generating Questions...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-purple-200" />
                  <span>Auto-Generate Quiz with IBM BOB</span>
                </>
              )}
            </button>
          </form>

          {/* Quiz List Selector */}
          {quizzes.length > 0 && (
            <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Previously Generated Quizzes</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {quizzes.map((q) => (
                  <button
                    key={q._id}
                    onClick={() => setActiveQuiz(q)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between text-xs font-semibold ${
                      activeQuiz?._id === q._id
                        ? 'bg-purple-950/60 border-purple-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{q.topic}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 capitalize">
                      {q.difficulty}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Quiz Preview Render */}
        <div className="lg:col-span-7 space-y-6">
          {activeQuiz ? (
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-bold uppercase">
                    Preview Mode
                  </span>
                  <h2 className="text-xl font-bold text-white font-outfit mt-1">{activeQuiz.topic}</h2>
                  <p className="text-xs text-slate-400">Difficulty: <span className="capitalize text-purple-300 font-semibold">{activeQuiz.difficulty}</span> • Total Questions: {activeQuiz.questions?.length}</p>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {activeQuiz.questions?.map((q, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                    
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-purple-600/20 text-purple-400 font-bold text-xs flex items-center justify-center border border-purple-500/30 flex-shrink-0 mt-0.5">
                          Q{idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-white leading-relaxed">{q.question}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700 uppercase flex-shrink-0">
                        {q.type}
                      </span>
                    </div>

                    {/* Options if MCQ */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = opt === q.correctAnswer;
                          return (
                            <div
                              key={oIdx}
                              className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between ${
                                isCorrect
                                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                                  : 'bg-slate-950/50 border-slate-800 text-slate-400'
                              }`}
                            >
                              <span>{opt}</span>
                              {isCorrect && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-[11px] text-purple-200">
                        <strong className="text-purple-300">IBM BOB Rationale:</strong> {q.explanation}
                      </div>
                    )}

                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
                <FileCheck2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white font-outfit">No Quiz Selected</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Enter a topic on the left to auto-generate multiple choice and short answer questions using IBM BOB.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
