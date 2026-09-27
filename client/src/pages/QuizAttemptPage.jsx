import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Zap,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  Loader2,
  RotateCcw,
  Check,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { getQuizzes, getQuizById, gradeQuizAttempt } from '../services/api';

// ponytail: Supabase returns `id`; old code used `_id`. normalizeQuiz on the backend adds both, but guard here too.
const qid = (q) => q?._id || q?.id;

export default function QuizAttemptPage() {
  const [searchParams] = useSearchParams();
  const quizIdParam = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState(null);

  useEffect(() => {
    async function loadQuiz() {
      setLoading(true);
      setError('');
      try {
        if (quizIdParam) {
          const single = await getQuizById(quizIdParam);
          if (single.data.quiz) {
            setActiveQuiz(single.data.quiz);
            setQuizzes([single.data.quiz]);
          }
        } else {
          const qRes = await getQuizzes();
          const list = qRes.data.quizzes || [];
          setQuizzes(list);
          if (list.length > 0) setActiveQuiz(list[0]);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load quizzes.');
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [quizIdParam]);

  const handleAnswerSelect = (qIdx, value) =>
    setUserAnswers((prev) => ({ ...prev, [qIdx]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeQuiz) return;
    setSubmitting(true);
    try {
      const answersArray = (activeQuiz.questions || []).map((_, idx) => userAnswers[idx] || '');
      const res = await gradeQuizAttempt({ quizId: qid(activeQuiz), answers: answersArray });
      if (res.data.success) setAttemptResult(res.data.attempt);
    } catch (err) {
      setError('Grading error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setUserAnswers({});
    setAttemptResult(null);
    setError('');
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <QuizHeader />
        <div className="glass-card p-12 rounded-3xl border border-slate-800 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading quiz assessment...</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error && !activeQuiz) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <QuizHeader />
        <div className="glass-card p-12 rounded-3xl border border-rose-500/20 flex flex-col items-center gap-4">
          <AlertCircle className="w-8 h-8 text-rose-400" />
          <p className="text-sm font-bold text-white">Could not load quiz</p>
          <p className="text-xs text-slate-400 text-center max-w-sm">{error}</p>
          <Link to="/dashboard" className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!activeQuiz && !loading) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <QuizHeader />
        <div className="glass-card p-12 rounded-3xl border border-slate-800 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white font-outfit">No Quizzes Available Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Ask your teacher to publish a quiz, or check back later. Quizzes appear here once a teacher has generated and published them.
          </p>
          <Link to="/dashboard" className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <QuizHeader />

      {/* Quiz selector (when multiple) */}
      {quizzes.length > 1 && !attemptResult && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs font-bold text-slate-400 flex-shrink-0">Select Quiz:</span>
          {quizzes.map((q) => (
            <button
              key={qid(q)}
              onClick={() => { setActiveQuiz(q); setUserAnswers({}); setError(''); }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex-shrink-0 transition-all ${
                qid(activeQuiz) === qid(q)
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {q.topic}
            </button>
          ))}
        </div>
      )}

      {/* Inline error (grading errors) */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Results */}
      {attemptResult ? (
        <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-8 animate-fade-in">
          <div className="text-center space-y-3 p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-emerald-950/30 border border-emerald-500/30">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-white font-outfit">Quiz Completed!</h2>
            <div className="flex items-center justify-center gap-4 text-sm font-bold">
              <span className="text-emerald-400 text-3xl font-extrabold">{attemptResult.percentage}%</span>
              <span className="text-slate-400">• Score: {attemptResult.totalScore} / {attemptResult.maxScore} Pts</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-white font-outfit">IBM BOB Auto-Grading &amp; Feedback</h3>
            {attemptResult.answers?.map((ans, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    {ans.isCorrect
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      : <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />}
                    <h4 className="text-xs font-bold text-white">{ans.questionText || `Question ${idx + 1}`}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ans.isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    +{ans.score} Pts
                  </span>
                </div>
                <div className="text-xs space-y-1 pl-6">
                  <p className="text-slate-300"><strong>Your Answer:</strong> {ans.userAnswer || 'No answer submitted'}</p>
                  <p className="text-slate-400"><strong>Correct Answer:</strong> {ans.correctAnswer}</p>
                  <p className="text-indigo-300 bg-indigo-950/40 p-2 rounded-xl border border-indigo-500/20 font-medium">
                    💡 {ans.feedback}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={handleRetake}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" /> Retake Quiz
            </button>
            <Link
              to="/progress"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30"
            >
              View My Progress <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Questions Form */
        <form onSubmit={handleSubmit} className="glass-card p-8 rounded-3xl border border-slate-800 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase">
                Active Assessment
              </span>
              <h2 className="text-xl font-bold text-white font-outfit mt-1">{activeQuiz.topic}</h2>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {activeQuiz.questions?.length} Questions
            </span>
          </div>

          <div className="space-y-6">
            {(activeQuiz.questions || []).map((q, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-emerald-600/20 text-emerald-400 font-extrabold text-xs flex items-center justify-center border border-emerald-500/30 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-white leading-relaxed mt-1">{q.question}</h4>
                </div>

                {q.options && q.options.length > 0 ? (
                  <div className="space-y-2 pl-10">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = userAnswers[idx] === opt;
                      return (
                        <label
                          key={oIdx}
                          onClick={() => handleAnswerSelect(idx, opt)}
                          className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-emerald-600/20 border-emerald-500 text-white'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                          }`}
                        >
                          <span>{opt}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-emerald-400 bg-emerald-400 text-slate-950' : 'border-slate-700'}`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="pl-10">
                    <textarea
                      rows={3}
                      value={userAnswers[idx] || ''}
                      onChange={(e) => handleAnswerSelect(idx, e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500 font-sans"
                      placeholder="Type your answer in 2-3 sentences..."
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white text-xs font-bold shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin text-white" /><span>IBM BOB NLP Auto-Grading Answers...</span></>
            ) : (
              <><Zap className="w-4 h-4 text-emerald-200" /><span>Submit Quiz Answers for AI Auto-Grading</span></>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

function QuizHeader() {
  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
        <Zap className="w-3.5 h-3.5" /> Feature F6 &amp; F7: Adaptive Quiz &amp; Auto-Grading
      </div>
      <h1 className="text-3xl font-extrabold text-white font-outfit">Student Practice Quiz</h1>
      <p className="text-xs text-slate-400">Complete the quiz to receive instant IBM BOB NLP score and personalized feedback</p>
    </div>
  );
}
