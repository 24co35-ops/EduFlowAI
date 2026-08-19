import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Layers, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  CheckCircle,
  Loader2,
  FileText
} from 'lucide-react';
import { generateFlashcards, getFlashcards } from '../services/api';

export default function FlashcardsPage() {
  const [chapterText, setChapterText] = useState(
    'Photosynthesis is the chemical process through which plants convert solar light energy into chemical energy stored in glucose molecules. Chlorophyll is the main green pigment located inside the thylakoid membranes of chloroplasts that absorbs light energy. The process consists of light-dependent reactions in thylakoids and the Calvin cycle in the stroma.'
  );
  const [title, setTitle] = useState('Photosynthesis & Chloroplasts');
  const [loading, setLoading] = useState(false);
  const [currentDeck, setCurrentDeck] = useState(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    async function loadDecks() {
      try {
        const res = await getFlashcards();
        if (res.data.decks && res.data.decks.length > 0) {
          setCurrentDeck(res.data.decks[0]);
        }
      } catch (err) {
        console.warn('Flashcard fetch error:', err);
      }
    }
    loadDecks();
  }, []);

  const handleGenerateDeck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setIsFlipped(false);
    setCardIndex(0);

    try {
      const res = await generateFlashcards({ text: chapterText, title });
      if (res.data.success) {
        setCurrentDeck(res.data.deck);
      }
    } catch (err) {
      alert('Error generating flashcards: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleNextCard = () => {
    if (!currentDeck?.cards) return;
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % currentDeck.cards.length);
  };

  const handlePrevCard = () => {
    if (!currentDeck?.cards) return;
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 + currentDeck.cards.length) % currentDeck.cards.length);
  };

  const activeCard = currentDeck?.cards?.[cardIndex];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
          <Layers className="w-3.5 h-3.5" /> Feature F5: Flashcard & Summary Engine
        </div>
        <h1 className="text-3xl font-extrabold text-white font-outfit">Instant Flashcard & Summary Generator</h1>
        <p className="text-xs text-slate-400">Paste chapter content to get interactive 3D study cards and key bullet-point summaries</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Controls */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleGenerateDeck} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-5">
            <h3 className="text-base font-bold text-white font-outfit flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" /> Source Chapter Input
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Deck Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                placeholder="e.g. Chapter 4 Chemistry"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Paste Chapter / Lecture Notes</label>
              <textarea
                rows={7}
                value={chapterText}
                onChange={(e) => setChapterText(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500 font-sans"
                placeholder="Paste chapter text..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>IBM BOB Generating Flashcards...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Generate Flashcards & Summary</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Display Deck Area */}
        <div className="lg:col-span-7 space-y-6">
          {currentDeck ? (
            <div className="space-y-6">
              
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

                  {/* Interactive Flip Container */}
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

                  {/* Navigation controls */}
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

            </div>
          ) : (
            <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white font-outfit">No Flashcard Deck Created</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Paste chapter text on the left to let IBM BOB construct interactive flashcards and bullet-point summaries.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
