import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Award, 
  ArrowRight, 
  Loader2, 
  RotateCcw,
  Check
} from 'lucide-react';
import { getQuizzes, getQuizById, gradeQuizAttempt } from '../services/api';

export default function QuizAttemptPage() {
  const [searchParams] = useSearchParams();
  const quizIdParam = searchParams.get('id');
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState(null);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const qRes = await getQuizzes();
        const list = qRes.data.quizzes || [];
        setQuizzes(list);

        if (quizIdParam) {
          const single = await getQuizById(quizIdParam);
          if (single.data.quiz) {
            setActiveQuiz(single.data.quiz);
          }
        } else if (list.length > 0) {
          setActiveQuiz(list[0]);
        }
      } catch (err) {
        console.warn('Quiz attempt fetch error:', err);
      }
    }
    loadQuiz();
  }, [quizIdParam]);

  const handleAnswerSelect = (qIdx, value) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qIdx]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeQuiz) return;
    setSubmitting(true);

    try {
      const answersArray = activeQuiz.questions.map((_, idx) => userAnswers[idx] || '');
      const res = await gradeQuizAttempt({
        quizId: activeQuiz._id,
        answers: answersArray
      });

      if (res.data.success) {
        setAttemptResult(res.data.attempt);
      }
    } catch (err) {
      alert('Grading error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setUserAnswers({});
    setAttemptResult(null);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
          <Zap className="w-3.5 h-3.5" /> Feature F6 & F7: Adaptive Quiz & Auto-Grading
        </div>
        <h1 className="text-3xl font-extrabold text-white font-outfit">Student Practice Quiz</h1>
        <p className="text-xs text-slate-400">Complete the quiz to receive instant IBM BOB NLP score and personalized feedback</p>
      </div>

      {/* Quiz List Selector */}
      {quizzes.length > 1 && !attemptResult && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs font-bold text-slate-400 flex-shrink-0">Select Quiz:</span>
          {quizzes.map((q) => (
            <button
              key={q._id}
              onClick={() => {
                setActiveQuiz(q);
                setUserAnswers({});
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex-shrink-0 transition-all ${
                activeQuiz?._id === q._id
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {q.topic}
            </button>
          ))}
        </div>
      )}

      {/* Main Quiz View */}
      {attemptResult ? (
        /* Results View */
        <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-8 animate-fade-in">
          
          {/* Score Header */}
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

          {/* Itemized Feedback List */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white font-outfit">IBM BOB Auto-Grading & Feedback</h3>
            
            {attemptResult.answers?.map((ans, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    {ans.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    )}
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
      ) : activeQuiz ? (
        /* Questions Form View */
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
            {activeQuiz.questions?.map((q, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-emerald-600/20 text-emerald-400 font-extrabold text-xs flex items-center justify-center border border-emerald-500/30 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-white leading-relaxed mt-1">{q.question}</h4>
                </div>

                {/* Options if MCQ or True/False */}
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
                  /* Text area for Short Answer */
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
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>IBM BOB NLP Auto-Grading Answers...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-emerald-200" />
                <span>Submit Quiz Answers for AI Auto-Grading</span>
              </>
            )}
          </button>

        </form>
      ) : (
        <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center space-y-4">
          <p className="text-xs text-slate-400">Loading quiz assessment...</p>
        </div>
      )}

    </div>
  );
}
