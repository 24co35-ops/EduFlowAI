import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Layers,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle,
  Loader2,
  FileText,
  Upload,
  X,
  Lightbulb,
  Brain
} from 'lucide-react';
import { generateFlashcards, getFlashcards } from '../services/api';
import AIEvidenceBadge from '../components/AIEvidenceBadge';

export default function FlashcardsPage() {
  const [chapterText, setChapterText] = useState(
    'Photosynthesis is the chemical process through which plants convert solar light energy into chemical energy stored in glucose molecules. Chlorophyll is the main green pigment located inside the thylakoid membranes of chloroplasts that absorbs light energy. The process consists of light-dependent reactions in thylakoids and the Calvin cycle in the stroma.'
  );
  const [title, setTitle] = useState('Photosynthesis & Chloroplasts');
  const [pdfFile, setPdfFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentDeck, setCurrentDeck] = useState(null);
  const [concepts, setConcepts] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [aiMetadata, setAiMetadata] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getFlashcards()
      .then(res => { if (res.data.decks?.length > 0) setCurrentDeck(res.data.decks[0]); })
      .catch(() => {});
  }, []);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0] || e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are accepted.');
      return;
    }
    setError('');
    setPdfFile(file);
    // Auto-fill title from filename
    setTitle(file.name.replace(/\.pdf$/i, ''));
  };

  const clearFile = () => {
    setPdfFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerateDeck = async (e) => {
    e.preventDefault();
    if (!pdfFile && !chapterText.trim()) {
      setError('Upload a PDF or paste chapter text.');
      return;
    }
    setError('');
    setLoading(true);
    setIsFlipped(false);
    setCardIndex(0);

    // Always send FormData so the endpoint receives multipart
    const fd = new FormData();
    fd.append('title', title);
    if (pdfFile) {
      fd.append('file', pdfFile);
    } else {
      fd.append('text', chapterText);
    }

    try {
      const res = await generateFlashcards(fd);
      if (res.data.success) {
        setCurrentDeck(res.data.deck);
        setConcepts(Array.isArray(res.data.concepts) ? res.data.concepts : []);
        if (res.data._aiMetadata) setAiMetadata(res.data._aiMetadata);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error generating flashcards.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextCard = () => {
    if (!currentDeck?.cards) return;
    setIsFlipped(false);
    setCardIndex(prev => (prev + 1) % currentDeck.cards.length);
  };

  const handlePrevCard = () => {
    if (!currentDeck?.cards) return;
    setIsFlipped(false);
    setCardIndex(prev => (prev - 1 + currentDeck.cards.length) % currentDeck.cards.length);
  };

  const activeCard = currentDeck?.cards?.[cardIndex];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
          <Layers className="w-3.5 h-3.5" /> Feature F5: Flashcard &amp; Summary Engine
        </div>
        <h1 className="text-3xl font-extrabold text-white font-outfit">Instant Flashcard &amp; Summary Generator</h1>
        <p className="text-xs text-slate-400">Upload a PDF or paste chapter content to get interactive study cards and concept explanations</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Input Controls */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleGenerateDeck} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-5">
            <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" /> Source Chapter Input
            </h3>

            {/* Deck Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Deck Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                placeholder="e.g. Chapter 4 Chemistry"
              />
            </div>

            {/* PDF Upload Zone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Upload PDF (optional)</label>
              {pdfFile ? (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-500/40 text-xs text-purple-200">
                  <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="truncate flex-1">{pdfFile.name}</span>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                    dragOver
                      ? 'border-purple-400 bg-purple-500/10'
                      : 'border-slate-700 bg-slate-900/50 hover:border-purple-500/50 hover:bg-slate-900'
                  }`}
                >
                  <Upload className={`w-6 h-6 ${dragOver ? 'text-purple-400' : 'text-slate-500'}`} />
                  <p className="text-xs text-slate-400 text-center">
                    Drag &amp; drop a <span className="text-purple-300 font-semibold">.pdf</span> or{' '}
                    <span className="text-purple-400 font-semibold underline cursor-pointer">browse</span>
                  </p>
                  <p className="text-[10px] text-slate-500">Max 10 MB · PDF only</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileDrop}
                id="pdf-upload"
              />
            </div>

            {/* Paste Text (shown only when no PDF) */}
            {!pdfFile && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Or Paste Chapter / Lecture Notes
                </label>
                <textarea
                  rows={6}
                  value={chapterText}
                  onChange={e => setChapterText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500 font-sans"
                  placeholder="Paste chapter text..."
                />
              </div>
            )}

            {error && (
              <p className="text-xs text-red-400 font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{pdfFile ? 'Extracting PDF & Generating...' : 'IBM BOB Generating Flashcards...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Generate Flashcards &amp; Concepts</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Display Deck Area */}
        <div className="lg:col-span-7 space-y-6">
          {currentDeck ? (
            <div className="space-y-6">

              {/* AI Evidence Badge */}
              <AIEvidenceBadge metadata={aiMetadata} />

              {/* Summary Box */}
              <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-indigo-300 font-outfit uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" /> IBM BOB Chapter Summary
                </h3>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {currentDeck.summary}
                </div>
              </div>

              {/* 3D Flip Card */}
              {activeCard && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">
                      Card {cardIndex + 1} of {currentDeck.cards?.length}
                    </span>
                    <button
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="text-xs font-semibold text-purple-400 hover:underline flex items-center gap-1"
                    >
                      <RotateCw className="w-3.5 h-3.5" /> Flip Card (Click anywhere)
                    </button>
                  </div>

                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="cursor-pointer min-h-[220px] rounded-3xl p-8 glass-card border border-purple-500/30 bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-900 flex flex-col justify-between transition-all duration-300 hover:border-purple-500/60 shadow-xl relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-bold uppercase">
                        {isFlipped ? 'Answer / Definition (Back)' : 'Question / Term (Front)'}
                      </span>
                      <Sparkles className="w-4 h-4 text-purple-400 opacity-60" />
                    </div>

                    <div className="my-6 text-center">
                      <p className={`font-outfit transition-all ${isFlipped ? 'text-lg font-bold text-emerald-300' : 'text-xl font-bold text-white'}`}>
                        {isFlipped ? activeCard.back : activeCard.front}
                      </p>
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] text-slate-500 font-medium">Click card to reveal details</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={handlePrevCard}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <button
                      onClick={handleNextCard}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Concepts Explained */}
              {concepts.length > 0 && (
                <div className="glass-card p-6 rounded-3xl border border-emerald-500/20 space-y-4">
                  <h3 className="text-sm font-bold text-emerald-300 font-outfit uppercase tracking-wider flex items-center gap-2">
                    <Brain className="w-4 h-4 text-emerald-400" /> Concepts Explained
                    <span className="text-[10px] font-normal text-slate-500 normal-case tracking-normal">— key ideas from your chapter, simplified</span>
                  </h3>
                  <div className="space-y-3">
                    {concepts.map((c, i) => (
                      <div key={i} className="flex gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-200 mb-0.5">{c.term}</p>
                          <p className="text-xs text-slate-400 leading-relaxed">{c.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white font-outfit">No Flashcard Deck Created</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Upload a PDF or paste chapter text to let IBM BOB construct interactive flashcards, summaries, and concept explanations.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
