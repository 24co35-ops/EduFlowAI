export const WORKFLOW_TEMPLATES = [
  {
    id: 'lecture-to-study',
    title: 'Lecture to Flashcards & Adaptive Quiz',
    description: 'Transform an uploaded lecture or YouTube URL into concise notes, key concepts, Anki flashcards, and a 5-question mastery quiz.',
    category: 'Student Study Workflows',
    tags: ['YouTube', 'Flashcards', 'Quiz', 'Granite'],
    nodes: [
      {
        id: 'node-yt',
        type: 'agentNode',
        position: { x: 50, y: 180 },
        data: {
          agentId: 'youtube-analyzer',
          label: 'YouTube Analyzer',
          category: 'files',
          status: 'completed',
          selectedModel: 'Whisper-v3 + Granite',
          temperature: 0.0,
          videoUrl: 'https://www.youtube.com/watch?v=0k1q2w3e4r5',
          previewOutput: 'Analyzed: MIT 6.006 Algorithmic Complexity, Big-O bounds, divide-and-conquer recurrences.'
        }
      },
      {
        id: 'node-sum',
        type: 'agentNode',
        position: { x: 440, y: 180 },
        data: {
          agentId: 'summarizer',
          label: 'Summarizer',
          category: 'text',
          status: 'completed',
          selectedModel: 'IBM Granite 20B',
          temperature: 0.2,
          previewOutput: '• Master Theorem solves divide-and-conquer recurrences T(n) = aT(n/b) + f(n).\n• Average-case Quicksort partitions in O(n log n).\n• Worst-case tree depth requires randomized pivots.'
        }
      },
      {
        id: 'node-concepts',
        type: 'agentNode',
        position: { x: 820, y: 80 },
        data: {
          agentId: 'concept-extractor',
          label: 'Concept Extractor',
          category: 'study',
          status: 'completed',
          selectedModel: 'IBM Granite 13B',
          temperature: 0.2,
          previewOutput: 'Extracted 5 core concepts: Master Theorem, Divide-and-Conquer, Recursion Tree, Asymptotic Invariant, Amortized Analysis.'
        }
      },
      {
        id: 'node-quiz',
        type: 'agentNode',
        position: { x: 820, y: 320 },
        data: {
          agentId: 'quiz-generator',
          label: 'Adaptive Quiz Gen',
          category: 'study',
          status: 'completed',
          selectedModel: 'IBM Granite 13B Instruct',
          temperature: 0.1,
          previewOutput: 'Generated 5 verified questions on recurrence bounds. Answer keys validated deterministically.'
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'node-yt', target: 'node-sum', sourceHandle: 'full_transcript', targetHandle: 'source_text', type: 'dataFlow' },
      { id: 'e2', source: 'node-sum', target: 'node-concepts', sourceHandle: 'key_takeaways', targetHandle: 'context_notes', type: 'dataFlow' },
      { id: 'e3', source: 'node-sum', target: 'node-quiz', sourceHandle: 'key_takeaways', targetHandle: 'study_material', type: 'dataFlow' }
    ]
  },

  {
    id: 'essay-polish',
    title: 'Essay Rubric Scoring & Fact Verification',
    description: 'Verify essay claims against grounding documents, grade with rigorous rubric criteria, and generate high-polish revision diffs.',
    category: 'Teacher Assessment Pipelines',
    tags: ['Essay Grader', 'Fact Checker', 'Text Improver', 'Rubrics'],
    nodes: [
      {
        id: 'node-fact',
        type: 'agentNode',
        position: { x: 60, y: 150 },
        data: {
          agentId: 'fact-checker',
          label: 'Fact Checker',
          category: 'research',
          status: 'idle',
          selectedModel: 'Granite RAG Engine',
          temperature: 0.0,
          previewOutput: 'Cross-checks factual assertions against verified syllabus knowledge chunks.'
        }
      },
      {
        id: 'node-essay',
        type: 'agentNode',
        position: { x: 440, y: 150 },
        data: {
          agentId: 'essay-grader',
          label: 'Essay Grader',
          category: 'study',
          status: 'idle',
          selectedModel: 'IBM Granite 20B Instruct',
          temperature: 0.1,
          previewOutput: 'Evaluates Thesis, Evidence, Organization, and Scholarly Voice with deterministic rubric point scoring.'
        }
      },
      {
        id: 'node-improve',
        type: 'agentNode',
        position: { x: 820, y: 150 },
        data: {
          agentId: 'text-improver',
          label: 'Text Improver',
          category: 'text',
          status: 'idle',
          selectedModel: 'IBM Granite 13B',
          temperature: 0.3,
          previewOutput: 'Produces sentence-by-sentence diff highlighting vocabulary upgrades and sentence conciseness.'
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'node-fact', target: 'node-essay', sourceHandle: 'citations', targetHandle: 'rubric', type: 'dataFlow' },
      { id: 'e2', source: 'node-essay', target: 'node-improve', sourceHandle: 'annotated_text', targetHandle: 'draft_text', type: 'dataFlow' }
    ]
  },

  {
    id: 'exam-crammer',
    title: 'Syllabus to Spaced Repetition Study Plan',
    description: 'Ingest course syllabus or textbook chapter, extract hierarchical milestones, and produce an adaptive calendar with SM-2 intervals.',
    category: 'Student Study Workflows',
    tags: ['Syllabus', 'Study Plan', 'PDF', 'Schedule'],
    nodes: [
      {
        id: 'node-pdf',
        type: 'agentNode',
        position: { x: 60, y: 180 },
        data: {
          agentId: 'pdf-reader',
          label: 'PDF Reader',
          category: 'files',
          status: 'idle',
          selectedModel: 'pdf-parse + OCR Engine',
          temperature: 0.0,
          previewOutput: 'Chunks syllabus modules into granular weekly competency targets.'
        }
      },
      {
        id: 'node-concepts',
        type: 'agentNode',
        position: { x: 440, y: 180 },
        data: {
          agentId: 'concept-extractor',
          label: 'Concept Extractor',
          category: 'study',
          status: 'idle',
          selectedModel: 'IBM Granite 13B',
          temperature: 0.2,
          previewOutput: 'Identifies prerequisite topic chains and conceptual dependencies.'
        }
      },
      {
        id: 'node-plan',
        type: 'agentNode',
        position: { x: 820, y: 180 },
        data: {
          agentId: 'study-plan-gen',
          label: 'Study Plan Gen',
          category: 'study',
          status: 'idle',
          selectedModel: 'IBM Granite 20B',
          temperature: 0.3,
          previewOutput: 'Creates day-by-day revision milestones leading up to target exam date.'
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'node-pdf', target: 'node-concepts', sourceHandle: 'parsed_markdown', targetHandle: 'context_notes', type: 'dataFlow' },
      { id: 'e2', source: 'node-concepts', target: 'node-plan', sourceHandle: 'concepts_json', targetHandle: 'topics_list', type: 'dataFlow' }
    ]
  },

  {
    id: 'research-synthesizer',
    title: 'Autonomous Academic Research Synthesizer',
    description: 'Execute focused academic web queries, verify claims against peer-reviewed citations, and generate an executive research brief.',
    category: 'Research & Verification',
    tags: ['Web Search', 'Fact Checker', 'Summarizer', 'Citations'],
    nodes: [
      {
        id: 'node-search',
        type: 'agentNode',
        position: { x: 60, y: 180 },
        data: {
          agentId: 'web-search',
          label: 'Web Search',
          category: 'research',
          status: 'idle',
          selectedModel: 'Brave Academic Search',
          temperature: 0.0,
          previewOutput: 'Searches .edu and peer-reviewed arXiv repositories for literature.'
        }
      },
      {
        id: 'node-fact',
        type: 'agentNode',
        position: { x: 440, y: 180 },
        data: {
          agentId: 'fact-checker',
          label: 'Fact Checker',
          category: 'research',
          status: 'idle',
          selectedModel: 'Granite RAG Engine',
          temperature: 0.0,
          previewOutput: 'Validates claims and extracts explicit source citations.'
        }
      },
      {
        id: 'node-summary',
        type: 'agentNode',
        position: { x: 820, y: 180 },
        data: {
          agentId: 'summarizer',
          label: 'Summarizer',
          category: 'text',
          status: 'idle',
          selectedModel: 'IBM Granite 20B',
          temperature: 0.2,
          previewOutput: 'Synthesizes literature findings into an annotated executive briefing.'
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'node-search', target: 'node-fact', sourceHandle: 'search_results', targetHandle: 'claims_text', type: 'dataFlow' },
      { id: 'e2', source: 'node-fact', target: 'node-summary', sourceHandle: 'citations', targetHandle: 'source_text', type: 'dataFlow' }
    ]
  }
];
