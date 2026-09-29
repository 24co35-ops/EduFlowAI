import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  Globe, 
  Download, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Cpu, 
  ArrowRight,
  Languages,
  Loader2,
  Edit3,
  Save,
  Check,
  Plus,
  Trash2
} from 'lucide-react';
import { generateLessonPlan, updateLessonPlan, translateLessonPlan, getLessons } from '../services/api';
import AIEvidenceBadge from '../components/AIEvidenceBadge';

export default function LessonPlannerPage() {
  const [subject, setSubject] = useState('Class 10 Science & Technology');
  const [syllabusText, setSyllabusText] = useState(
    'Unit 1: Electric Current, Potential Difference, Ohm Law, Resistors in Series and Parallel.\nUnit 2: Magnetic Effects of Electric Current, Electromagnetism.\nUnit 3: Carbon Compounds, Bonding in Carbon, Homologous Series.'
  );
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [translatedText, setTranslatedText] = useState('');
  const [aiMetadata, setAiMetadata] = useState(null);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlan, setEditedPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadInitial() {
      try {
        const res = await getLessons();
        if (res.data.lessons && res.data.lessons.length > 0) {
          setCurrentPlan(res.data.lessons[0]);
          setEditedPlan(JSON.parse(JSON.stringify(res.data.lessons[0])));
        }
      } catch (err) {
        console.warn('Initial lesson fetch error:', err);
      }
    }
    loadInitial();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTranslatedText('');
    setIsEditing(false);

    try {
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('syllabusText', syllabusText);
      formData.append('language', language);
      if (file) {
        formData.append('syllabus', file);
      }

      const res = await generateLessonPlan(formData);
      if (res.data.success) {
        setCurrentPlan(res.data.lesson);
        setEditedPlan(JSON.parse(JSON.stringify(res.data.lesson)));
        if (res.data._aiMetadata) setAiMetadata(res.data._aiMetadata);
      }
    } catch (err) {
      alert('Error generating lesson plan: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!currentPlan) return;
    setTranslating(true);
    try {
      const res = await translateLessonPlan({
        lessonId: currentPlan._id,
        targetLang
      });
      if (res.data.success) {
        setTranslatedText(res.data.translatedContent);
      }
    } catch (err) {
      alert('Translation error: ' + (err.response?.data?.message || err.message));
    } finally {
      setTranslating(false);
    }
  };

  const handleDayFieldChange = (dayIdx, field, value) => {
    if (!editedPlan) return;
    const newPlan = { ...editedPlan };
    newPlan.plan[dayIdx][field] = value;
    setEditedPlan(newPlan);
  };

  const handleSaveEdit = async () => {
    if (!editedPlan || !editedPlan._id) return;
    setSaving(true);
    try {
      const res = await updateLessonPlan(editedPlan._id, {
        subject: editedPlan.subject,
        overview: editedPlan.overview,
        plan: editedPlan.plan
      });
      if (res.data.success) {
        setCurrentPlan(res.data.lesson);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert('Error saving lesson plan: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#141C2B]/15 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 border border-[#2C4A8F]/30 bg-[#2C4A8F]/10 text-[#2C4A8F] text-[10px] font-mono uppercase tracking-wider mb-2">
            <Cpu className="w-3.5 h-3.5" /> Feature F1 &amp; F3: IBM BOB Automation
          </div>
          <h1 className="text-3xl font-serif text-[#141C2B] tracking-tight">Syllabus to Lesson Plan <span className="italic text-[#2C4A8F]">Generator</span></h1>
          <p className="text-xs text-[#141C2B]/70 font-mono mt-1">Upload curriculum PDF or input chapter outline for structured 5-day instructional schedules.</p>
        </div>

        {currentPlan && (
          <div className="flex items-center gap-2 self-start">
            <button
              onClick={() => {
                if (isEditing) {
                  setEditedPlan(JSON.parse(JSON.stringify(currentPlan)));
                  setIsEditing(false);
                } else {
                  setIsEditing(true);
                }
              }}
              className="btn-outline text-xs flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" /> {isEditing ? '[ Cancel Edit ]' : '[ Edit Plan ]'}
            </button>

            {isEditing && (
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="btn-filled text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>[ Save Changes ]</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="btn-outline text-xs flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-[#2C4A8F]" /> [ Export PDF ]
            </button>
          </div>
        )}
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-600/30 text-emerald-800 text-xs font-mono font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" /> Lesson plan edits saved successfully to repository ledger!
        </div>
      )}

      {/* Input Form & Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleGenerate} className="stationery-card p-6 border border-[#141C2B]/15 bg-[#E5DED0] space-y-5">
            
            <div className="border-b border-[#141C2B]/10 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-mono uppercase tracking-wider text-[#141C2B] font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#2C4A8F]" /> Syllabus Input Parameters
              </h3>
              <span className="mono-label text-[10px]">DOC-ENTRY</span>
            </div>

            <div>
              <label className="mono-label text-[11px] block mb-1">Subject / Course Classification</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[#EFE9DD] border border-[#141C2B]/20 text-[#141C2B] text-xs font-mono focus:outline-none focus:border-[#2C4A8F]"
                placeholder="Class 10 Physics"
              />
            </div>

            <div>
              <label className="mono-label text-[11px] block mb-1">Upload Curriculum Document (PDF / DOCX)</label>
              <div className="border-2 border-dashed border-[#141C2B]/20 hover:border-[#2C4A8F] p-4 text-center cursor-pointer transition-colors bg-[#EFE9DD]/60 relative">
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-6 h-6 text-[#2C4A8F] mx-auto mb-1" />
                <p className="text-xs font-mono font-bold text-[#141C2B]">
                  {file ? file.name : 'Select or drop curriculum file'}
                </p>
                <p className="text-[10px] font-mono text-[#141C2B]/60 mt-0.5">PDF or plain text format (Max 10MB)</p>
              </div>
            </div>

            <div>
              <label className="mono-label text-[11px] block mb-1">Or Paste Direct Chapter Outline / Topics</label>
              <textarea
                rows={5}
                value={syllabusText}
                onChange={(e) => setSyllabusText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#EFE9DD] border border-[#141C2B]/20 text-[#141C2B] text-xs font-mono focus:outline-none focus:border-[#2C4A8F] leading-relaxed"
                placeholder="Paste topics, chapters or outline..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-filled py-3 px-4 text-xs font-mono font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#EFE9DD]" />
                  <span>[ IBM BOB Generating 5-Day Plan... ]</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#EFE9DD]" />
                  <span>[ Generate Lesson Plan with IBM BOB ]</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Output Render Panel */}
        <div className="lg:col-span-7 space-y-6">
          {currentPlan ? (
            <div className="stationery-card p-6 border border-[#141C2B]/15 bg-[#E5DED0] space-y-6">
              
              {/* AI Evidence Badge */}
              <AIEvidenceBadge metadata={aiMetadata} />

              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#141C2B]/15 pb-4 gap-3">
                <div className="space-y-1">
                  <span className="inline-block px-2 py-0.5 border border-[#2C4A8F]/30 bg-[#2C4A8F]/10 text-[#2C4A8F] text-[10px] font-mono uppercase tracking-wider font-bold">
                    Official Plan Document
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedPlan?.subject || ''}
                      onChange={(e) => setEditedPlan({ ...editedPlan, subject: e.target.value })}
                      className="text-lg font-serif text-[#141C2B] bg-[#EFE9DD] border border-[#141C2B]/20 px-3 py-1 w-full font-bold"
                    />
                  ) : (
                    <h2 className="text-xl font-serif text-[#141C2B] tracking-tight">{currentPlan.subject}</h2>
                  )}
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={editedPlan?.overview || ''}
                      onChange={(e) => setEditedPlan({ ...editedPlan, overview: e.target.value })}
                      className="text-xs text-[#141C2B] bg-[#EFE9DD] border border-[#141C2B]/20 px-3 py-1 w-full font-mono mt-1"
                    />
                  ) : (
                    <p className="text-xs text-[#141C2B]/75 font-mono leading-relaxed">{currentPlan.overview}</p>
                  )}
                </div>

                {/* F3 Translation Selector */}
                <div className="flex items-center gap-2 bg-[#EFE9DD] p-1.5 border border-[#141C2B]/20 self-start sm:self-auto flex-shrink-0">
                  <Globe className="w-4 h-4 text-[#2C4A8F] ml-1" />
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="bg-transparent text-[#141C2B] text-xs font-mono focus:outline-none pr-2 cursor-pointer"
                  >
                    <option value="hi">Hindi (हिंदी)</option>
                    <option value="mr">Marathi (मराठी)</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="te">Telugu (తెలుగు)</option>
                    <option value="kn">Kannada (ಕನ್ನಡ)</option>
                  </select>
                  <button
                    onClick={handleTranslate}
                    disabled={translating}
                    className="btn-filled text-[11px] px-2.5 py-1 disabled:opacity-50"
                  >
                    {translating ? '...' : '[ Translate ]'}
                  </button>
                </div>
              </div>

              {/* Translation Alert Banner */}
              {translatedText && (
                <div className="p-4 bg-[#2C4A8F]/10 border border-[#2C4A8F]/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#2C4A8F]">
                    <Languages className="w-4 h-4" /> IBM Granite 20B Multilingual Output
                  </div>
                  <pre className="text-xs text-[#141C2B] whitespace-pre-wrap font-mono bg-[#EFE9DD] p-3 border border-[#141C2B]/15 leading-relaxed">
                    {translatedText}
                  </pre>
                </div>
              )}

              {/* Day-by-Day Cards */}
              <div className="space-y-4">
                {(isEditing ? editedPlan?.plan : currentPlan.plan)?.map((dayItem, dayIdx) => (
                  <div key={dayItem.day || dayIdx} className="p-5 bg-[#EFE9DD]/60 border border-[#141C2B]/15 space-y-3">
                    
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-[#141C2B] text-[#EFE9DD] font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                          D{dayItem.day}
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={dayItem.topic}
                            onChange={(e) => handleDayFieldChange(dayIdx, 'topic', e.target.value)}
                            className="text-sm font-bold text-[#141C2B] bg-[#EFE9DD] border border-[#141C2B]/20 px-3 py-1 flex-1 font-mono"
                          />
                        ) : (
                          <h4 className="text-sm font-serif font-bold text-[#141C2B]">{dayItem.topic}</h4>
                        )}
                      </div>

                      {isEditing ? (
                        <input
                          type="text"
                          value={dayItem.duration}
                          onChange={(e) => handleDayFieldChange(dayIdx, 'duration', e.target.value)}
                          className="w-24 text-xs font-mono text-[#141C2B] bg-[#EFE9DD] border border-[#141C2B]/20 px-2 py-1"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#141C2B]/70 bg-[#E5DED0] px-2.5 py-1 border border-[#141C2B]/10 flex-shrink-0">
                          <Clock className="w-3.5 h-3.5 text-[#2C4A8F]" /> {dayItem.duration}
                        </div>
                      )}
                    </div>

                    {/* Objectives */}
                    {dayItem.objectives && dayItem.objectives.length > 0 && (
                      <div className="space-y-1">
                        <p className="mono-label text-[10px] text-[#2C4A8F]">Learning Objectives</p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {dayItem.objectives.map((obj, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs font-mono text-[#141C2B]/80">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Classroom Activities */}
                    {dayItem.activities && dayItem.activities.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-[#141C2B]/10">
                        <p className="mono-label text-[10px]">Classroom Activities</p>
                        <div className="flex flex-wrap gap-2">
                          {dayItem.activities.map((act, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-[#E5DED0] text-[#141C2B] text-[11px] font-mono border border-[#141C2B]/15">
                              • {act}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="stationery-card p-12 border border-[#141C2B]/15 bg-[#E5DED0] text-center space-y-4">
              <div className="w-16 h-16 border border-[#2C4A8F]/30 bg-[#2C4A8F]/10 flex items-center justify-center text-[#2C4A8F] mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-serif text-[#141C2B]">No Curriculum Plan Selected</h3>
              <p className="text-xs font-mono text-[#141C2B]/70 max-w-sm mx-auto leading-relaxed">
                Fill in the syllabus topics on the left or upload a PDF syllabus to let IBM BOB generate a detailed 5-day curriculum.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
