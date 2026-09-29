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
  Brain,
  ShieldCheck
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
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-[#E5DED0] border border-[rgba(20,28,43,0.16)] p-6">
        <div className="inline-flex items-center gap-1.5 text-[10px] mono-label text-[#2C4A8F] mb-1">
          <Layers className="w-3.5 h-3.5" /> [ CURRICULUM STUDY DECK LEDGER • FEATURE F5 ]
        </div>
        <h1 className="serif-display text-3xl font-bold">
          Instant Flashcard &amp; <span className="serif-italic">Summary Engine</span>
        </h1>
        <p className="text-xs text-[#4A5364]">
          Upload a PDF or paste syllabus notes to generate calibrated study cards, key concept extractions, and structured chapter summaries.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Input Controls */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleGenerateDeck} className="bg-[#E5DED0] p-6 border border-[rgba(20,28,43,0.16)] space-y-4">
            <h3 className="serif-display text-lg font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#2C4A8F]" /> Source Chapter Input
            </h3>

            {/* Deck Title */}
            <div>
              <label className="block mono-label text-[10px] text-[#767E8C] mb-1">DECK TITLE</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-[#EFE9DD] border border-[rgba(20,28,43,0.2)] text-xs mono-label text-[#141C2B] focus:outline-none focus:border-[#141C2B]"
                placeholder="e.g. Chapter 4 Chemistry"
              />
            </div>

            {/* PDF Upload Zone */}
            <div>
              <label className="block mono-label text-[10px] text-[#767E8C] mb-1">UPLOAD PDF SYLLABUS (OPTIONAL)</label>
              {pdfFile ? (
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#EFE9DD] border border-[rgba(44,74,143,0.3)] text-xs mono-label text-[#141C2B]">
                  <FileText className="w-4 h-4 text-[#2C4A8F] shrink-0" />
                  <span className="truncate flex-1">{pdfFile.name}</span>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="text-[#767E8C] hover:text-[#141C2B]"
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
                  className={`flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed cursor-pointer transition-all bg-[#EFE9DD] ${
                    dragOver
                      ? 'border-[#2C4A8F]'
                      : 'border-[rgba(20,28,43,0.2)] hover:border-[#141C2B]'
                  }`}
                >
                  <Upload className="w-5 h-5 text-[#2C4A8F]" />
                  <p className="mono-label text-xs text-[#141C2B] text-center">
                    Drag &amp; drop a <span className="text-[#2C4A8F] font-bold">.pdf</span> or browse
                  </p>
                  <p className="mono-label text-[9px] text-[#767E8C]">Max 10 MB · Textbook PDF</p>
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
                <label className="block mono-label text-[10px] text-[#767E8C] mb-1">
                  OR PASTE CHAPTER / LECTURE NOTES
                </label>
                <textarea
                  rows={6}
                  value={chapterText}
                  onChange={e => setChapterText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#EFE9DD] border border-[rgba(20,28,43,0.2)] text-xs text-[#141C2B] focus:outline-none focus:border-[#141C2B] font-typewriter"
                  placeholder="Paste chapter notes here..."
                />
              </div>
            )}

            {error && (
              <p className="mono-label text-xs text-[#141C2B] font-bold">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-filled w-full justify-center text-[10px] py-2.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#EFE9DD]" />
                  <span>[ EXTRACTING PDF &amp; COMPILING DECK... ]</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>[ GENERATE FLASHCARDS &amp; CONCEPTS ]</span>
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
              <div className="bg-[#E5DED0] p-6 border border-[rgba(20,28,43,0.16)] space-y-3">
                <h3 className="mono-label text-xs text-[#2C4A8F] flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" /> [ IBM BOB CHAPTER SUMMARY ]
                </h3>
                <div className="p-4 bg-[#EFE9DD] border border-[rgba(20,28,43,0.14)] text-xs text-[#141C2B] leading-relaxed whitespace-pre-wrap">
                  {currentDeck.summary}
                </div>
              </div>

              {/* 3D Flip Card */}
              {activeCard && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mono-label text-xs">
                    <span className="text-[#767E8C]">
                      [ CARD {cardIndex + 1} OF {currentDeck.cards?.length} ]
                    </span>
                    <button
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="text-[#2C4A8F] hover:underline flex items-center gap-1"
                    >
                      <RotateCw className="w-3.5 h-3.5" /> [ FLIP CARD ]
                    </button>
                  </div>

                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="cursor-pointer min-h-[220px] p-8 bg-[#EFE9DD] border border-[rgba(20,28,43,0.2)] flex flex-col justify-between transition-all hover:border-[#141C2B] relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="tag-proficient text-[9px]">
                        [ {isFlipped ? 'ANSWER / DEFINITION' : 'QUESTION / TERM'} ]
                      </span>
                      <Sparkles className="w-4 h-4 text-[#2C4A8F]" />
                    </div>

                    <div className="my-6 text-center">
                      <p className={`serif-display transition-all ${isFlipped ? 'text-lg font-bold text-[#2C4A8F]' : 'text-xl font-bold text-[#141C2B]'}`}>
                        {isFlipped ? activeCard.back : activeCard.front}
                      </p>
                    </div>

                    <div className="text-center mono-label text-[10px] text-[#767E8C]">
                      [ Click to rotate card ]
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={handlePrevCard}
                      className="btn-outline text-[10px] py-1.5 px-3 flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> [ Previous ]
                    </button>
                    <button
                      onClick={handleNextCard}
                      className="btn-filled text-[10px] py-1.5 px-3 flex items-center gap-1"
                    >
                      [ Next ] <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Concepts Explained */}
              {concepts.length > 0 && (
                <div className="bg-[#E5DED0] p-6 border border-[rgba(20,28,43,0.16)] space-y-3">
                  <h3 className="mono-label text-xs text-[#2C4A8F] flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5" /> [ CONCEPTS EXTRACTED FROM CHAPTER ]
                  </h3>
                  <div className="space-y-2.5">
                    {concepts.map((c, i) => (
                      <div key={i} className="p-3 bg-[#EFE9DD] border border-[rgba(20,28,43,0.14)] space-y-1">
                        <p className="mono-label text-xs text-[#2C4A8F]">{c.term}</p>
                        <p className="text-xs text-[#4A5364] leading-relaxed">{c.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-[#E5DED0] p-12 border border-[rgba(20,28,43,0.16)] text-center space-y-3">
              <div className="w-12 h-12 border border-[rgba(20,28,43,0.2)] bg-[#EFE9DD] flex items-center justify-center text-[#2C4A8F] mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="serif-display text-xl font-bold">No Study Deck Active</h3>
              <p className="text-xs text-[#4A5364] max-w-sm mx-auto">
                Upload a course textbook chapter or paste lecture notes to let IBM BOB compile interactive study cards and concept summaries.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
