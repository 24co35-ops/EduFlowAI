/**
 * Curriculum Semantic Chunking & Grounded Retrieval Service
 * Breaks course syllabus texts into structured chunks with page/chapter metadata
 * and performs relevance retrieval with strict out-of-scope detection.
 */

class RetrievalService {
  /**
   * Chunks a raw syllabus text into semantic segments with overlap and metadata.
   */
  chunkCurriculum(rawText, chapterTitle = 'Curriculum Overview', startPage = 1) {
    if (!rawText || typeof rawText !== 'string') return [];

    const chunkSize = 600;
    const overlap = 80;
    const chunks = [];
    let page = startPage;
    let index = 0;

    for (let i = 0; i < rawText.length; i += (chunkSize - overlap)) {
      const slice = rawText.slice(i, i + chunkSize).trim();
      if (slice.length > 50) {
        // Simple heuristic: increment page every ~1200 chars
        if (i > 0 && i % 1200 < (chunkSize - overlap)) {
          page += 1;
        }

        chunks.push({
          chunkId: `chk_${index + 1}`,
          chapter: chapterTitle,
          page,
          text: slice,
          charLength: slice.length
        });
        index++;
      }
    }

    return chunks;
  }

  /**
   * Retrieves top-K most relevant chunks for a student query or quiz topic.
   */
  retrieveRelevantChunks(query, chunks = [], topK = 3) {
    if (!query || !chunks || chunks.length === 0) {
      return {
        matchedChunks: [],
        isInScope: false,
        sourceCitation: 'Course Syllabus'
      };
    }

    const queryTokens = query.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 2);

    if (queryTokens.length === 0) {
      return {
        matchedChunks: chunks.slice(0, topK),
        isInScope: true,
        sourceCitation: `[Source: ${chunks[0]?.chapter || 'Syllabus'}, Page ${chunks[0]?.page || 1}]`
      };
    }

    // Score chunks by token presence and frequency
    const scored = chunks.map(chunk => {
      const chunkText = chunk.text.toLowerCase();
      let matchCount = 0;
      let matchedTokens = 0;

      queryTokens.forEach(token => {
        if (chunkText.includes(token)) {
          matchedTokens++;
          const occurrences = chunkText.split(token).length - 1;
          matchCount += occurrences;
        }
      });

      const score = (matchedTokens * 3) + matchCount;
      return { ...chunk, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const highestScore = scored[0]?.score || 0;
    const isInScope = highestScore > 0;
    const matchedChunks = scored.slice(0, topK).filter(c => c.score > 0);

    const citations = matchedChunks.map(c => `[Source: ${c.chapter}, Page ${c.page}]`);
    const uniqueCitations = [...new Set(citations)].join('; ');

    return {
      matchedChunks: matchedChunks.length > 0 ? matchedChunks : chunks.slice(0, 1),
      isInScope,
      sourceCitation: uniqueCitations || `[Source: ${chunks[0]?.chapter || 'Course Material'}, Page 1]`,
      topScore: highestScore
    };
  }

  /**
   * Formats retrieved chunks as grounded prompt context.
   */
  formatContextForPrompt(matchedChunks) {
    if (!matchedChunks || matchedChunks.length === 0) return 'No context available.';
    return matchedChunks.map((c, i) => `--- Chunk ${i + 1} (${c.chapter}, Page ${c.page}) ---\n${c.text}`).join('\n\n');
  }
}

module.exports = new RetrievalService();
