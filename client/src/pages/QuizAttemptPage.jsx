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
  AlertCircle,
  Sparkles,
  Flame,
  ShieldCheck
} from 'lucide-react';
import { getQuizzes, getQuizById, gradeQuizAttempt, getAttempts } from '../services/api';
import RemediationModal from '../components/RemediationModal';
import AIEvidenceBadge from '../components/AIEvidenceBadge';

const qid = (q) => q?._id || q?.id;

export default function QuizAttemptPage() {
  const [searchParams] = useSearchParams();
  const quizIdParam = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState(null);
  const [aiMetadata, setAiMetadata] = useState(null);
  const [showRemediation, setShowRemediation] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      setLoading(true);
      setError('');
      try {
        const [quizRes, attemptsRes] = await Promise.all([
          quizIdParam ? getQuizById(quizIdParam) : getQuizzes(),
          getAttempts().catch(() => ({ data: { attempts: [] } }))
        ]);

        const attList = attemptsRes.data?.attempts || [];
        setAttempts(attList);

        if (quizIdParam) {
          if (quizRes.data.quiz) {
            setActiveQuiz(quizRes.data.quiz);
            setQuizzes([quizRes.data.quiz]);
          }
        } else {
          const list = quizRes.data.quizzes || [];
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

  const lastAttempt = attempts.length > 0 ? attempts[0] : null;
  const lastScore = lastAttempt ? (lastAttempt.percentage ?? Math.round(((lastAttempt.totalScore || 0) / (lastAttempt.maxScore || 1)) * 100)) : null;
  
  let recommendedDifficulty = 'medium';
  if (lastScore !== null) {
    if (lastScore >= 80) recommendedDifficulty = 'hard';
    else if (lastScore >= 60) recommendedDifficulty = 'medium';
    else recommendedDifficulty = 'easy';
  }

  const handleAnswerSelect = (qIdx, value) =>
    setUserAnswers((prev) => ({ ...prev, [qIdx]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeQuiz) return;
    setSubmitting(true);
    try {
      const answersArray = (activeQuiz.questions || []).map((_, idx) => userAnswers[idx] || '');
      const res = await gradeQuizAttempt({ quizId: qid(activeQuiz), answers: answersArray });
      if (res.data.success) {
        setAttemptResult(res.data.attempt);
        if (res.data._aiMetadata) setAiMetadata(res.data._aiMetadata);
      }
    } catch (err) {
      setError('Grading error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setUserAnswers({});
    setAttemptResult(null);
    setAiMetadata(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <QuizHeader recommendedDifficulty={recommendedDifficulty} lastScore={lastScore} />
        <div className="bg-[#E5DED0] p-12 border border-[rgba(20,28,43,0.16)] flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-[#2C4A8F] animate-spin" />
          <p className="mono-label text-xs text-[#767E8C]">[ LOADING ASSESSMENT LEDGER... ]</p>
        </div>
      </div>
    );
  }

  if (error && !activeQuiz) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <QuizHeader recommendedDifficulty={recommendedDifficulty} lastScore={lastScore} />
        <div className="bg-[#E5DED0] p-12 border border-[#141C2B] flex flex-col items-center gap-3">
          <AlertCircle className="w-8 h-8 text-[#141C2B]" />
          <p className="serif-display text-lg font-bold">Could not load assessment</p>
          <p className="text-xs text-[#4A5364] text-center max-w-sm">{error}</p>
          <Link to="/" className="btn-filled text-[10px] mt-2">
            [ ← Back to Dashboard ]
          </Link>
        </div>
      </div>
    );
  }

  if (!activeQuiz && !loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <QuizHeader recommendedDifficulty={recommendedDifficulty} lastScore={lastScore} />
        <div className="bg-[#E5DED0] p-12 border border-[rgba(20,28,43,0.16)] flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 border border-[rgba(20,28,43,0.2)] bg-[#EFE9DD] flex items-center justify-center text-[#2C4A8F]">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="serif-display text-xl font-bold">No Quizzes Available Yet</h3>
          <p className="text-xs text-[#4A5364] max-w-sm">
            Quizzes appear here once a teacher has generated and published them from the course syllabus.
          </p>
          <Link to="/" className="btn-filled text-[10px] mt-2">
            [ ← Return to Dashboard ]
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <QuizHeader recommendedDifficulty={recommendedDifficulty} lastScore={lastScore} />

      {/* Quiz selector */}
      {quizzes.length > 1 && !attemptResult && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="mono-label text-[10px] text-[#767E8C] flex-shrink-0">[ SELECT QUIZ: ]</span>
          {quizzes.map((q) => {
            const isActive = qid(activeQuiz) === qid(q);
            return (
              <button
                key={qid(q)}
                onClick={() => { setActiveQuiz(q); setUserAnswers({}); setError(''); }}
                className={`mono-label text-[10px] px-3 py-1 border flex items-center gap-1.5 flex-shrink-0 transition-colors ${
                  isActive
                    ? 'bg-[#141C2B] text-[#EFE9DD] border-[#141C2B]'
                    : 'bg-[#E5DED0] text-[#141C2B] border-[rgba(20,28,43,0.16)] hover:bg-[#EFE9DD]'
                }`}
              >
                <span>{q.topic}</span>
                {q.difficulty && (
                  <span className="text-[9px] text-[#2C4A8F]">
                    [{q.difficulty.toUpperCase()}]
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <div className="p-3 bg-[#E5DED0] border border-[#141C2B] text-xs mono-label text-[#141C2B] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#141C2B]" /> {error}
        </div>
      )}

      {/* Results */}
      {attemptResult ? (
        <div className="bg-[#E5DED0] p-6 sm:p-8 border border-[rgba(20,28,43,0.16)] space-y-6 animate-fade-in">
          <div className="text-center space-y-2 p-6 bg-[#EFE9DD] border border-[rgba(20,28,43,0.16)]">
            <div className="w-12 h-12 border border-[rgba(20,28,43,0.2)] bg-[#E5DED0] flex items-center justify-center text-[#2C4A8F] mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <h2 className="serif-display text-2xl font-bold">Assessment Completed</h2>
            <div className="flex items-center justify-center gap-3 mono-label text-sm">
              <span className="serif-display text-3xl font-bold text-[#2C4A8F]">{attemptResult.percentage}%</span>
              <span className="text-[#4A5364]">• [ SCORE: {attemptResult.totalScore} / {attemptResult.maxScore} PTS ]</span>
            </div>
          </div>

          <AIEvidenceBadge metadata={aiMetadata || attemptResult._aiMetadata} />

          {/* Post-Quiz Remediation CTA */}
          {attemptResult.percentage < 75 ? (
            <div className="p-5 bg-[#EFE9DD] border border-[#141C2B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 mono-label text-xs text-[#2C4A8F]">
                  <Sparkles className="w-4 h-4" /> [ RECOMMENDED AI REMEDIATION LOOP (SCORE: {attemptResult.percentage}%) ]
                </div>
                <p className="text-xs text-[#4A5364]">
                  Mastery is below 75%. Launch a personalized 3-minute explanation on <strong>{activeQuiz.topic}</strong> with misconception clearing.
                </p>
              </div>
              <button
                onClick={() => setShowRemediation(true)}
                className="btn-filled text-[10px] py-2 px-3 whitespace-nowrap flex-shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" /> [ Launch Remediation ]
              </button>
            </div>
          ) : (
            <div className="p-4 bg-[#EFE9DD] border border-[rgba(44,74,143,0.3)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs text-[#2C4A8F] mono-label">
                🎉 [ EXCELLENT MASTERY: {attemptResult.percentage}% ] Ready for next target level.
              </div>
              <button
                onClick={() => setShowRemediation(true)}
                className="btn-outline text-[10px] py-1 px-2.5 flex-shrink-0"
              >
                [ Review Concepts ]
              </button>
            </div>
          )}

          {/* Question Breakdown */}
          <div className="space-y-3">
            <h3 className="serif-display text-lg font-bold">IBM BOB Auto-Grading &amp; Feedback</h3>
            {attemptResult.answers?.map((ans, idx) => (
              <div key={idx} className="p-4 bg-[#EFE9DD] border border-[rgba(20,28,43,0.14)] space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    {ans.isCorrect
                      ? <CheckCircle2 className="w-4 h-4 text-[#2C4A8F] flex-shrink-0 mt-0.5" />
                      : <XCircle className="w-4 h-4 text-[#141C2B] flex-shrink-0 mt-0.5" />}
                    <h4 className="mono-label text-xs text-[#141C2B]">{ans.questionText || `Question ${idx + 1}`}</h4>
                  </div>
                  <span className="mono-label text-[10px] text-[#2C4A8F]">
                    +{ans.score} Pts
                  </span>
                </div>
                <div className="text-xs space-y-1 pl-6 text-[#4A5364]">
                  <p><strong>Your Answer:</strong> {ans.userAnswer || 'No answer submitted'}</p>
                  <p><strong>Correct Answer:</strong> {ans.correctAnswer}</p>
                  <p className="p-2.5 bg-[#E5DED0] border border-[rgba(20,28,43,0.12)] text-[#141C2B] mt-1">
                    💡 {ans.feedback}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRetake}
              className="btn-outline text-[10px] py-2 px-4 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> [ Retake Quiz ]
            </button>
            <Link
              to="/progress"
              className="btn-filled text-[10px] py-2 px-4 flex items-center gap-1.5"
            >
              [ View Progress ] <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        /* Questions Form */
        <form onSubmit={handleSubmit} className="bg-[#E5DED0] p-6 sm:p-8 border border-[rgba(20,28,43,0.16)] space-y-6">
          <div className="flex items-center justify-between border-b border-[rgba(20,28,43,0.16)] pb-3">
            <div>
              <span className="tag-proficient text-[9px]">[ ACTIVE ASSESSMENT ]</span>
              <h2 className="serif-display text-xl font-bold mt-1">{activeQuiz.topic}</h2>
            </div>
            <span className="mono-label text-xs text-[#767E8C]">
              [ {activeQuiz.questions?.length} QUESTIONS ]
            </span>
          </div>

          <div className="space-y-5">
            {(activeQuiz.questions || []).map((q, idx) => (
              <div key={idx} className="p-5 bg-[#EFE9DD] border border-[rgba(20,28,43,0.16)] space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 border border-[rgba(20,28,43,0.2)] bg-[#E5DED0] text-[#141C2B] mono-label text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="serif-display text-sm font-bold text-[#141C2B] leading-relaxed mt-0.5">{q.question}</h4>
                </div>

                {q.options && q.options.length > 0 ? (
                  <div className="space-y-1.5 pl-8">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = userAnswers[idx] === opt;
                      return (
                        <label
                          key={oIdx}
                          onClick={() => handleAnswerSelect(idx, opt)}
                          className={`p-2.5 border text-xs mono-label flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#141C2B] text-[#EFE9DD] border-[#141C2B]'
                              : 'bg-[#E5DED0] text-[#141C2B] border-[rgba(20,28,43,0.16)] hover:bg-[#EFE9DD]'
                          }`}
                        >
                          <span>{opt}</span>
                          <div className={`w-3.5 h-3.5 border flex items-center justify-center ${isSelected ? 'border-[#EFE9DD] bg-[#EFE9DD] text-[#141C2B]' : 'border-[rgba(20,28,43,0.3)]'}`}>
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="pl-8">
                    <textarea
                      rows={3}
                      value={userAnswers[idx] || ''}
                      onChange={(e) => handleAnswerSelect(idx, e.target.value)}
                      className="w-full p-3 bg-[#E5DED0] border border-[rgba(20,28,43,0.2)] text-xs text-[#141C2B] focus:outline-none focus:border-[#141C2B] font-typewriter"
                      placeholder="Type your explanation in 2-3 sentences..."
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-filled w-full justify-center text-[10px] py-3 disabled:opacity-50"
          >
            {submitting ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>[ IBM BOB NLP AUTO-GRADING SUBMISSION... ]</span></>
            ) : (
              <><Zap className="w-3.5 h-3.5" /><span>[ SUBMIT ANSWERS FOR DETERMINISTIC AI GRADING ]</span></>
            )}
          </button>
        </form>
      )}

      {showRemediation && (
        <RemediationModal
          isOpen={showRemediation}
          onClose={() => setShowRemediation(false)}
          initialTopic={activeQuiz?.topic || 'General Science'}
          studentScore={attemptResult?.percentage || 50}
        />
      )}
    </div>
  );
}

function QuizHeader({ recommendedDifficulty = 'medium', lastScore = null }) {
  return (
    <div className="bg-[#E5DED0] border border-[rgba(20,28,43,0.16)] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="inline-flex items-center gap-1.5 text-[10px] mono-label text-[#2C4A8F] mb-1">
          <Zap className="w-3.5 h-3.5" /> [ ASSESSMENT &amp; AUTO-GRADING LEDGER • FEATURES F6 &amp; F7 ]
        </div>
        <h1 className="serif-display text-3xl font-bold">Student Practice Quiz</h1>
        <p className="text-xs text-[#4A5364]">
          Submit your assessment for deterministic grading and grounded IBM Granite NLP feedback.
        </p>
      </div>

      <div className="flex flex-col items-start sm:items-end gap-1">
        <div className="mono-label text-xs border border-[rgba(44,74,143,0.3)] bg-[#EFE9DD] text-[#2C4A8F] px-3 py-1 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5" />
          <span>[ ADAPTIVE TARGET: {recommendedDifficulty.toUpperCase()} ]</span>
        </div>
        <span className="mono-label text-[10px] text-[#767E8C]">
          {lastScore !== null ? `LAST ATTEMPT: ${lastScore}%` : 'INITIAL COHORT TARGET'}
        </span>
      </div>
    </div>
  );
}
