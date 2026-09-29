import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  FileCheck2, 
  CheckCircle, 
  Zap, 
  Send, 
  Loader2,
  Edit3,
  Save,
  RotateCw,
  Plus,
  Trash2,
  Check,
  ShieldCheck
} from 'lucide-react';
import { generateQuiz, getQuizzes, updateQuiz, regenerateQuestion } from '../services/api';
import AIEvidenceBadge from '../components/AIEvidenceBadge';

export default function QuizBuilderPage() {
  const [topic, setTopic] = useState('Photosynthesis & Cellular Respiration');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [aiMetadata, setAiMetadata] = useState(null);
  
  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuiz, setEditedQuiz] = useState(null);
  const [saving, setSaving] = useState(false);
  const [regenIdx, setRegenIdx] = useState(null);

  useEffect(() => {
    async function loadQuizzes() {
      try {
        const res = await getQuizzes();
        if (res.data.quizzes && res.data.quizzes.length > 0) {
          setQuizzes(res.data.quizzes);
          setActiveQuiz(res.data.quizzes[0]);
          setEditedQuiz(JSON.parse(JSON.stringify(res.data.quizzes[0])));
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
    setIsEditing(false);

    try {
      const res = await generateQuiz({ topic, difficulty, questionCount });
      if (res.data.success) {
        setActiveQuiz(res.data.quiz);
        setEditedQuiz(JSON.parse(JSON.stringify(res.data.quiz)));
        setQuizzes([res.data.quiz, ...quizzes]);
        if (res.data._aiMetadata) setAiMetadata(res.data._aiMetadata);
      }
    } catch (err) {
      alert('Error generating quiz: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!activeQuiz) return;
    try {
      await updateQuiz(activeQuiz._id, { status: 'published' });
      setPublishedSuccess(true);
      setTimeout(() => setPublishedSuccess(false), 3000);
    } catch (err) {
      alert('Error publishing quiz: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRegenerateSingle = async (idx) => {
    if (!editedQuiz) return;
    setRegenIdx(idx);
    try {
      const targetQ = editedQuiz.questions[idx];
      const res = await regenerateQuestion({
        topic: editedQuiz.topic,
        difficulty: targetQ.difficulty || editedQuiz.difficulty,
        type: targetQ.type || 'mcq'
      });
      if (res.data.success && res.data.question) {
        const updatedQuestions = [...editedQuiz.questions];
        updatedQuestions[idx] = res.data.question;
        setEditedQuiz({ ...editedQuiz, questions: updatedQuestions });
        if (res.data._aiMetadata) setAiMetadata(res.data._aiMetadata);
      }
    } catch (err) {
      alert('Error regenerating question: ' + (err.response?.data?.message || err.message));
    } finally {
      setRegenIdx(null);
    }
  };

  const handleSaveQuizEdits = async () => {
    if (!editedQuiz || !editedQuiz._id) return;
    setSaving(true);
    try {
      const res = await updateQuiz(editedQuiz._id, {
        topic: editedQuiz.topic,
        difficulty: editedQuiz.difficulty,
        questions: editedQuiz.questions
      });
      if (res.data.success) {
        setActiveQuiz(res.data.quiz);
        setIsEditing(false);
      }
    } catch (err) {
      alert('Error saving quiz edits: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-[#E5DED0] border border-[rgba(20,28,43,0.16)] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] mono-label text-[#2C4A8F] mb-1">
            <Zap className="w-3.5 h-3.5" /> [ ASSESSMENT SPECIFICATION &amp; AUTHORING LEDGER • FEATURE F2 ]
          </div>
          <h1 className="serif-display text-3xl font-bold">Auto Quiz Builder</h1>
          <p className="text-xs text-[#4A5364]">
            Generate, customize, and edit assessment items with IBM Granite foundation models.
          </p>
        </div>

        {activeQuiz && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                if (isEditing) {
                  setEditedQuiz(JSON.parse(JSON.stringify(activeQuiz)));
                  setIsEditing(false);
                } else {
                  setIsEditing(true);
                }
              }}
              className="btn-outline text-[10px] py-1.5 px-3 flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" /> [ {isEditing ? 'Cancel Edit' : 'Edit Questions'} ]
            </button>

            {isEditing ? (
              <button
                onClick={handleSaveQuizEdits}
                disabled={saving}
                className="btn-filled text-[10px] py-1.5 px-3 flex items-center gap-1.5 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>[ Save Changes ]</span>
              </button>
            ) : (
              <button
                onClick={handlePublish}
                className="btn-filled text-[10px] py-1.5 px-3 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> [ Publish to Portal ]
              </button>
            )}
          </div>
        )}
      </div>

      {publishedSuccess && (
        <div className="p-4 bg-[#EFE9DD] border border-[rgba(44,74,143,0.3)] text-[#2C4A8F] mono-label text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4" /> [ QUIZ SUCCESSFULLY PUBLISHED TO STUDENT PORTAL ]
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Controls */}
        <div className="lg:col-span-5 space-y-6">
          
          <form onSubmit={handleGenerateQuiz} className="bg-[#E5DED0] p-6 border border-[rgba(20,28,43,0.16)] space-y-4">
            <h3 className="serif-display text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2C4A8F]" /> Assessment Parameters
            </h3>

            <div>
              <label className="block mono-label text-[10px] text-[#767E8C] mb-1">TOPIC OR CHAPTER TITLE</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-[#EFE9DD] border border-[rgba(20,28,43,0.2)] text-xs mono-label text-[#141C2B] focus:outline-none focus:border-[#141C2B]"
                placeholder="e.g. Newton Laws of Motion"
              />
            </div>

            <div>
              <label className="block mono-label text-[10px] text-[#767E8C] mb-1">DIFFICULTY LEVEL</label>
              <div className="grid grid-cols-3 gap-2">
                {['easy', 'medium', 'hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 px-3 text-xs mono-label uppercase border transition-colors ${
                      difficulty === diff
                        ? 'bg-[#141C2B] text-[#EFE9DD] border-[#141C2B]'
                        : 'bg-[#EFE9DD] text-[#141C2B] border-[rgba(20,28,43,0.16)] hover:bg-[#E5DED0]'
                    }`}
                  >
                    [ {diff} ]
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block mono-label text-[10px] text-[#767E8C] mb-1">NUMBER OF QUESTIONS</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-[#EFE9DD] border border-[rgba(20,28,43,0.2)] text-xs mono-label text-[#141C2B] focus:outline-none focus:border-[#141C2B]"
              >
                <option value={3}>3 Questions (Quick Check)</option>
                <option value={4}>4 Questions (Standard)</option>
                <option value={6}>6 Questions (Comprehensive)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-filled w-full justify-center text-[10px] py-2.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#EFE9DD]" />
                  <span>[ IBM BOB GENERATING QUESTIONS... ]</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>[ AUTO-GENERATE QUIZ WITH IBM BOB ]</span>
                </>
              )}
            </button>
          </form>

          {/* Quiz List Selector */}
          {quizzes.length > 0 && (
            <div className="bg-[#E5DED0] p-5 border border-[rgba(20,28,43,0.16)] space-y-3">
              <h4 className="mono-label text-[10px] text-[#767E8C] uppercase">[ PREVIOUSLY GENERATED MODULES ]</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {quizzes.map((q) => (
                  <button
                    key={q._id}
                    onClick={() => {
                      setActiveQuiz(q);
                      setEditedQuiz(JSON.parse(JSON.stringify(q)));
                      setIsEditing(false);
                    }}
                    className={`w-full p-2.5 border text-left transition-colors flex items-center justify-between text-xs mono-label ${
                      activeQuiz?._id === q._id
                        ? 'bg-[#141C2B] text-[#EFE9DD] border-[#141C2B]'
                        : 'bg-[#EFE9DD] text-[#141C2B] border-[rgba(20,28,43,0.16)] hover:bg-[#E5DED0]'
                    }`}
                  >
                    <span className="truncate">{q.topic}</span>
                    <span className="text-[9px] text-[#2C4A8F]">
                      [{q.difficulty?.toUpperCase()}]
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Quiz Preview & Edit Render */}
        <div className="lg:col-span-7 space-y-6">
          {activeQuiz ? (
            <div className="bg-[#E5DED0] p-6 border border-[rgba(20,28,43,0.16)] space-y-5">
              
              <AIEvidenceBadge metadata={aiMetadata} />

              <div className="flex items-center justify-between border-b border-[rgba(20,28,43,0.16)] pb-3">
                <div>
                  <span className="tag-proficient text-[9px]">
                    [ {isEditing ? 'EDITING MODE' : 'PREVIEW MODE'} ]
                  </span>
                  <h2 className="serif-display text-xl font-bold mt-1">{activeQuiz.topic}</h2>
                  <p className="mono-label text-[10px] text-[#767E8C] mt-0.5">
                    DIFFICULTY: <span className="text-[#2C4A8F]">{activeQuiz.difficulty?.toUpperCase()}</span> • TOTAL QUESTIONS: {(isEditing ? editedQuiz?.questions : activeQuiz.questions)?.length}
                  </p>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {(isEditing ? editedQuiz?.questions : activeQuiz.questions)?.map((q, idx) => (
                  <div key={idx} className="p-4 bg-[#EFE9DD] border border-[rgba(20,28,43,0.16)] space-y-2.5">
                    
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 flex-1">
                        <span className="w-6 h-6 border border-[rgba(20,28,43,0.2)] bg-[#E5DED0] text-[#141C2B] mono-label text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        {isEditing ? (
                          <textarea
                            rows={2}
                            value={q.question}
                            onChange={(e) => {
                              const updated = [...editedQuiz.questions];
                              updated[idx].question = e.target.value;
                              setEditedQuiz({ ...editedQuiz, questions: updated });
                            }}
                            className="w-full text-xs font-bold text-[#141C2B] bg-[#E5DED0] border border-[rgba(20,28,43,0.2)] p-2 font-typewriter"
                          />
                        ) : (
                          <h4 className="serif-display text-sm font-bold text-[#141C2B] leading-relaxed mt-0.5">{q.question}</h4>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="mono-label text-[9px] px-1.5 py-0.5 border border-[rgba(20,28,43,0.2)]">
                          [{q.type?.toUpperCase()}]
                        </span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRegenerateSingle(idx)}
                            disabled={regenIdx === idx}
                            title="Regenerate this item with IBM BOB"
                            className="btn-outline text-[9px] py-0.5 px-1.5"
                          >
                            <RotateCw className={`w-3 h-3 ${regenIdx === idx ? 'animate-spin' : ''}`} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Options if MCQ */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, oIdx) => {
                          const isCorrect = opt === q.correctAnswer;
                          return (
                            <div
                              key={oIdx}
                              className={`p-2 border text-xs mono-label flex items-center justify-between ${
                                isCorrect
                                  ? 'bg-[#E5DED0] border-[#2C4A8F] text-[#2C4A8F] font-bold'
                                  : 'bg-[#E5DED0] border-[rgba(20,28,43,0.14)] text-[#141C2B]'
                              }`}
                            >
                              <span>{opt}</span>
                              {isCorrect && <CheckCircle className="w-3.5 h-3.5 text-[#2C4A8F] flex-shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-2.5 bg-[#E5DED0] border border-[rgba(20,28,43,0.12)] text-[11px] text-[#4A5364]">
                        <strong className="mono-label text-[#2C4A8F]">[ RATIONALE ]:</strong> {q.explanation}
                      </div>
                    )}

                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="bg-[#E5DED0] p-12 border border-[rgba(20,28,43,0.16)] text-center space-y-3">
              <div className="w-12 h-12 border border-[rgba(20,28,43,0.2)] bg-[#EFE9DD] flex items-center justify-center text-[#2C4A8F] mx-auto">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="serif-display text-xl font-bold">No Module Selected</h3>
              <p className="text-xs text-[#4A5364] max-w-sm mx-auto">
                Enter a topic on the left to auto-generate multiple choice and short answer questions using IBM BOB.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
