import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Lightbulb, 
  AlertTriangle, 
  X, 
  Loader2, 
  ArrowRight,
  Check
} from 'lucide-react';
import { generateRemediation } from '../services/api';

export default function RemediationModal({ isOpen, onClose, initialTopic = 'Ohm Law and Resistance Factors', studentScore = 50 }) {
  const [topic, setTopic] = useState(initialTopic);
  const [loading, setLoading] = useState(false);
  const [remediationData, setRemediationData] = useState(null);
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [submittedPractice, setSubmittedPractice] = useState(false);

  const handleGenerate = async (targetTopic = topic) => {
    setLoading(true);
    setPracticeAnswers({});
    setSubmittedPractice(false);
    try {
      const res = await generateRemediation({
        topic: targetTopic,
        studentScore,
        weakSubtopics: ['Core Definitions', 'Practical Calculation']
      });
      if (res.data.success) {
        setRemediationData(res.data.remediation);
      }
    } catch (err) {
      alert('Error generating remediation: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && !remediationData) {
      handleGenerate(initialTopic);
    }
  }, [isOpen, initialTopic]);

  if (!isOpen) return null;

  const handleOptionSelect = (qIdx, opt) => {
    if (submittedPractice) return;
    setPracticeAnswers(prev => ({
      ...prev,
      [qIdx]: opt
    }));
  };

  const handleCheckPractice = (e) => {
    e.preventDefault();
    setSubmittedPractice(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-[10px] font-bold uppercase mb-0.5">
                <Sparkles className="w-3 h-3" /> IBM Granite AI Remediation Loop
              </div>
              <h3 className="text-lg font-bold text-white font-outfit truncate">{topic}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-300">IBM BOB is generating your targeted remedial lesson & practice set...</p>
            </div>
          ) : remediationData ? (
            <div className="space-y-6">
              
              {/* 3-Minute Explanation Box */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-indigo-400" /> 3-Minute Fast Breakdown
                </div>
                <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {remediationData.explanation}
                </div>
              </div>

              {/* Real World Analogy & Misconception */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Lightbulb className="w-4 h-4" /> Real-World Analogy
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {remediationData.realWorldExample}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                    <AlertTriangle className="w-4 h-4" /> Misconception Alert
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {remediationData.commonMisconception}
                  </p>
                </div>

              </div>

              {/* 3 Interactive Practice Questions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-400" /> Instant Practice Check (3 Questions)
                  </h4>
                  <span className="text-[11px] text-slate-400">Solve before re-assessing</span>
                </div>

                <div className="space-y-3">
                  {remediationData.practiceQuestions?.map((q, idx) => {
                    const selected = practiceAnswers[idx];
                    const isCorrect = selected === q.correctAnswer;

                    return (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                        <p className="text-xs font-bold text-white leading-relaxed">
                          <span className="text-purple-400 mr-1.5">Q{idx + 1}.</span> {q.question}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options?.map((opt, oIdx) => {
                            const isThisSelected = selected === opt;
                            let style = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800';

                            if (submittedPractice) {
                              if (opt === q.correctAnswer) {
                                style = 'bg-emerald-950/50 border-emerald-500 text-emerald-300 font-bold';
                              } else if (isThisSelected && !isCorrect) {
                                style = 'bg-rose-950/50 border-rose-500 text-rose-300 font-bold';
                              } else {
                                style = 'bg-slate-900 border-slate-800 text-slate-500';
                              }
                            } else if (isThisSelected) {
                              style = 'bg-purple-600/30 border-purple-500 text-white font-bold';
                            }

                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => handleOptionSelect(idx, opt)}
                                disabled={submittedPractice}
                                className={`p-2.5 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${style}`}
                              >
                                <span>{opt}</span>
                                {submittedPractice && opt === q.correctAnswer && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                )}
                                {submittedPractice && isThisSelected && !isCorrect && (
                                  <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {submittedPractice && (
                          <div className={`p-2.5 rounded-xl text-[11px] ${isCorrect ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-500/20' : 'bg-rose-950/30 text-rose-300 border border-rose-500/20'}`}>
                            <strong>{isCorrect ? '✓ Correct! ' : '✗ Explanation: '}</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!submittedPractice ? (
                  <button
                    onClick={handleCheckPractice}
                    disabled={Object.keys(practiceAnswers).length < (remediationData.practiceQuestions?.length || 1)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                  >
                    Check Practice Answers
                  </button>
                ) : (
                  <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 flex items-center justify-between">
                    <span>🎉 <strong>Next Step:</strong> {remediationData.recommendedAction}</span>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Click generate to start your remedial lesson.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 flex-shrink-0">
          <button
            onClick={() => handleGenerate(topic)}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
          >
            Regenerate Module
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
          >
            Done & Return
          </button>
        </div>

      </div>
    </div>
  );
}
