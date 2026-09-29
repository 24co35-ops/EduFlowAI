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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141C2B]/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#E5DED0] border border-[rgba(20,28,43,0.2)] max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] flex flex-col text-[#141C2B]">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[rgba(20,28,43,0.16)] pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border border-[rgba(20,28,43,0.2)] bg-[#EFE9DD] flex items-center justify-center text-[#2C4A8F]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] mono-label text-[#2C4A8F]">
                <Sparkles className="w-3 h-3" /> [ IBM GRANITE AI REMEDIATION LOOP ]
              </div>
              <h3 className="serif-display text-xl font-bold truncate">{topic}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 border border-[rgba(20,28,43,0.2)] bg-[#EFE9DD] hover:bg-[#141C2B] hover:text-[#EFE9DD] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {loading ? (
            <div className="py-20 text-center space-y-3 mono-label text-xs text-[#767E8C]">
              <Loader2 className="w-6 h-6 animate-spin text-[#2C4A8F] mx-auto" />
              <p>[ IBM BOB IS COMPILING TARGETED REMEDIAL LESSON &amp; PRACTICE SET... ]</p>
            </div>
          ) : remediationData ? (
            <div className="space-y-5">
              
              {/* 3-Minute Explanation Box */}
              <div className="p-5 bg-[#EFE9DD] border border-[rgba(20,28,43,0.16)] space-y-2">
                <div className="flex items-center gap-2 mono-label text-xs text-[#2C4A8F]">
                  <BookOpen className="w-3.5 h-3.5" /> [ 3-MINUTE CALIBRATED BREAKDOWN ]
                </div>
                <div className="text-xs text-[#141C2B] whitespace-pre-wrap leading-relaxed">
                  {remediationData.explanation}
                </div>
              </div>

              {/* Real World Analogy & Misconception */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 bg-[#EFE9DD] border border-[rgba(20,28,43,0.16)] space-y-1.5">
                  <div className="flex items-center gap-2 mono-label text-xs text-[#2C4A8F]">
                    <Lightbulb className="w-3.5 h-3.5" /> [ ANALOGICAL MODEL ]
                  </div>
                  <p className="text-xs text-[#4A5364] leading-relaxed">
                    {remediationData.realWorldExample}
                  </p>
                </div>

                <div className="p-4 bg-[#EFE9DD] border border-[rgba(20,28,43,0.16)] space-y-1.5">
                  <div className="flex items-center gap-2 mono-label text-xs text-[#141C2B]">
                    <AlertTriangle className="w-3.5 h-3.5" /> [ MISCONCEPTION ALERT ]
                  </div>
                  <p className="text-xs text-[#4A5364] leading-relaxed">
                    {remediationData.commonMisconception}
                  </p>
                </div>

              </div>

              {/* 3 Interactive Practice Questions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[rgba(20,28,43,0.16)] pb-2">
                  <h4 className="mono-label text-xs text-[#141C2B] flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-[#2C4A8F]" />
                    [ INSTANT PRACTICE VERIFICATION (3 QUESTIONS) ]
                  </h4>
                  <span className="mono-label text-[10px] text-[#767E8C]">SOLVE BEFORE PROGRESSION</span>
                </div>

                <div className="space-y-3">
                  {remediationData.practiceQuestions?.map((q, idx) => {
                    const selected = practiceAnswers[idx];
                    const isCorrect = selected === q.correctAnswer;

                    return (
                      <div key={idx} className="p-4 bg-[#EFE9DD] border border-[rgba(20,28,43,0.16)] space-y-3">
                        <p className="mono-label text-xs text-[#141C2B]">
                          <span className="text-[#2C4A8F] mr-1.5">Q{idx + 1}.</span> {q.question}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options?.map((opt, oIdx) => {
                            const isThisSelected = selected === opt;
                            let style = 'bg-[#E5DED0] border-[rgba(20,28,43,0.16)] text-[#141C2B] hover:bg-[#EFE9DD]';

                            if (submittedPractice) {
                              if (opt === q.correctAnswer) {
                                style = 'bg-[#E5DED0] border-[#2C4A8F] text-[#2C4A8F] font-bold';
                              } else if (isThisSelected && !isCorrect) {
                                style = 'bg-[#E5DED0] border-[#141C2B] text-[#141C2B] line-through';
                              } else {
                                style = 'bg-[#E5DED0] border-[rgba(20,28,43,0.1)] text-[#767E8C]';
                              }
                            } else if (isThisSelected) {
                              style = 'bg-[#141C2B] border-[#141C2B] text-[#EFE9DD] font-bold';
                            }

                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => handleOptionSelect(idx, opt)}
                                disabled={submittedPractice}
                                className={`p-2.5 border text-xs text-left mono-label transition-all flex items-center justify-between ${style}`}
                              >
                                <span>{opt}</span>
                                {submittedPractice && opt === q.correctAnswer && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2C4A8F] flex-shrink-0" />
                                )}
                                {submittedPractice && isThisSelected && !isCorrect && (
                                  <XCircle className="w-3.5 h-3.5 text-[#141C2B] flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {submittedPractice && (
                          <div className={`p-2.5 text-xs ${isCorrect ? 'bg-[#E5DED0] text-[#2C4A8F] border border-[rgba(44,74,143,0.3)]' : 'bg-[#E5DED0] text-[#141C2B] border border-[rgba(20,28,43,0.3)]'}`}>
                            <strong>{isCorrect ? '✓ [ CORRECT ] ' : '✗ [ EXPLANATION ]: '}</strong> {q.explanation}
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
                    className="btn-filled w-full justify-center text-[10px] py-2.5 disabled:opacity-50"
                  >
                    [ Check Practice Answers ]
                  </button>
                ) : (
                  <div className="p-3 bg-[#EFE9DD] border border-[rgba(44,74,143,0.3)] text-xs text-[#2C4A8F] flex items-center justify-between mono-label">
                    <span>[ NEXT STEP ]: {remediationData.recommendedAction}</span>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="text-center py-12 text-[#767E8C] mono-label text-xs">
              [ Click generate to start your remedial module ]
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[rgba(20,28,43,0.16)] pt-4 flex-shrink-0">
          <button
            onClick={() => handleGenerate(topic)}
            disabled={loading}
            className="btn-outline text-[10px] py-1.5 px-3"
          >
            [ Regenerate Module ]
          </button>
          <button
            onClick={onClose}
            className="btn-filled text-[10px] py-1.5 px-4"
          >
            [ Done &amp; Return ]
          </button>
        </div>

      </div>
    </div>
  );
}
