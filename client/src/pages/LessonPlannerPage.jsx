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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
            <Cpu className="w-3.5 h-3.5" /> Feature F1 & F3: IBM BOB Automation
          </div>
          <h1 className="text-3xl font-extrabold text-white font-outfit">Syllabus to Lesson Plan Generator</h1>
          <p className="text-xs text-slate-400">Upload a syllabus PDF or paste text to generate a structured 5-day plan powered by watsonx.ai</p>
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
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                isEditing
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" /> {isEditing ? 'Cancel Edit' : 'Edit Plan'}
            </button>

            {isEditing && (
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Changes</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4 text-indigo-400" /> Export PDF
            </button>
          </div>
        )}
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" /> Lesson plan edits saved successfully!
        </div>
      )}

      {/* Input Form & Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleGenerate} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-5">
            
            <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" /> Syllabus Input Parameters
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subject / Course Name</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                placeholder="Class 10 Physics"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Upload Syllabus PDF / Document</label>
              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-900/50 relative">
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-6 h-6 text-indigo-400 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-300">
                  {file ? file.name : 'Click or Drag PDF file here'}
                </p>
                <p className="text-[10px] text-slate-500">Supports PDF & Text (Max 10MB)</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Or Paste Syllabus Text directly</label>
              <textarea
                rows={5}
                value={syllabusText}
                onChange={(e) => setSyllabusText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
                placeholder="Paste topics, chapters or outline..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>IBM BOB Generating 5-Day Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>Generate Lesson Plan with IBM BOB</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Output Render Panel */}
        <div className="lg:col-span-7 space-y-6">
          {currentPlan ? (
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
              
              {/* AI Evidence Badge */}
              <AIEvidenceBadge metadata={aiMetadata} />

              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase">
                    Generated Plan
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedPlan?.subject || ''}
                      onChange={(e) => setEditedPlan({ ...editedPlan, subject: e.target.value })}
                      className="text-lg font-bold text-white bg-slate-900 border border-slate-700 px-3 py-1 rounded-xl w-full"
                    />
                  ) : (
                    <h2 className="text-xl font-bold text-white font-outfit">{currentPlan.subject}</h2>
                  )}
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={editedPlan?.overview || ''}
                      onChange={(e) => setEditedPlan({ ...editedPlan, overview: e.target.value })}
                      className="text-xs text-slate-300 bg-slate-900 border border-slate-700 px-3 py-1 rounded-xl w-full"
                    />
                  ) : (
                    <p className="text-xs text-slate-400">{currentPlan.overview}</p>
                  )}
                </div>

                {/* F3 Translation Selector */}
                <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto flex-shrink-0">
                  <Globe className="w-4 h-4 text-indigo-400 ml-1" />
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="bg-slate-900 text-white text-xs font-medium focus:outline-none pr-2 cursor-pointer"
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
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {translating ? '...' : 'Translate'}
                  </button>
                </div>
              </div>

              {/* Translation Alert Banner */}
              {translatedText && (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                    <Languages className="w-4 h-4" /> IBM Granite 20B Multilingual Output
                  </div>
                  <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    {translatedText}
                  </pre>
                </div>
              )}

              {/* Day-by-Day Cards */}
              <div className="space-y-4">
                {(isEditing ? editedPlan?.plan : currentPlan.plan)?.map((dayItem, dayIdx) => (
                  <div key={dayItem.day || dayIdx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors">
                    
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 font-extrabold text-xs flex items-center justify-center border border-indigo-500/30 flex-shrink-0">
                          D{dayItem.day}
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={dayItem.topic}
                            onChange={(e) => handleDayFieldChange(dayIdx, 'topic', e.target.value)}
                            className="text-sm font-bold text-white bg-slate-950 border border-slate-700 px-3 py-1 rounded-xl flex-1"
                          />
                        ) : (
                          <h4 className="text-sm font-bold text-white">{dayItem.topic}</h4>
                        )}
                      </div>

                      {isEditing ? (
                        <input
                          type="text"
                          value={dayItem.duration}
                          onChange={(e) => handleDayFieldChange(dayIdx, 'duration', e.target.value)}
                          className="w-24 text-xs font-semibold text-slate-300 bg-slate-950 border border-slate-700 px-2 py-1 rounded-xl"
                        />
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg flex-shrink-0">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" /> {dayItem.duration}
                        </div>
                      )}
                    </div>

                    {/* Objectives */}
                    {dayItem.objectives && dayItem.objectives.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Learning Objectives</p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {dayItem.objectives.map((obj, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Classroom Activities */}
                    {dayItem.activities && dayItem.activities.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-slate-800/60">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Classroom Activities</p>
                        <div className="flex flex-wrap gap-2">
                          {dayItem.activities.map((act, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
                              🎯 {act}
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
            <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white font-outfit">No Lesson Plan Selected</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Fill in the syllabus topics on the left or upload a PDF syllabus to let IBM BOB generate a detailed 5-day curriculum.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
