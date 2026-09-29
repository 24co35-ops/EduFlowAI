import {
  FileText,
  CheckCircle,
  Sparkles,
  AlignLeft,
  Lightbulb,
  Calendar,
  Search,
  Video,
  FileCode,
  Globe,
  HelpCircle,
  UploadCloud,
  Download,
  Cpu
} from 'lucide-react';

export const AGENT_CATEGORIES = [
  { id: 'all', label: 'All Agents' },
  { id: 'study', label: 'Study & Mastery' },
  { id: 'text', label: 'Writing & Synthesis' },
  { id: 'research', label: 'Research & Verification' },
  { id: 'files', label: 'Multi-Modal Ingest' },
  { id: 'automation', label: 'Automation & Web' }
];

export const AGENT_REGISTRY = {
  // 1. Essay Grader
  'essay-grader': {
    type: 'agentNode',
    agentId: 'essay-grader',
    label: 'Essay Grader',
    category: 'study',
    icon: 'FileText',
    color: 'rose',
    accentColor: '#f43f5e',
    description: 'Rubric-based scoring, structural analysis, and actionable feedback.',
    defaultModel: 'IBM Granite 20B Instruct',
    defaultTemperature: 0.1,
    models: ['IBM Granite 20B Instruct', 'Gemini 1.5 Pro', 'Claude 3.5 Sonnet'],
    inputs: [
      { id: 'essay_text', name: 'Draft Essay', type: 'text', color: '#38bdf8' },
      { id: 'rubric', name: 'Rubric Criteria', type: 'structured', color: '#8b5cf6' }
    ],
    outputs: [
      { id: 'grade_breakdown', name: 'Score & Feedback', type: 'structured', color: '#8b5cf6' },
      { id: 'annotated_text', name: 'Annotated Essay', type: 'text', color: '#38bdf8' }
    ],
    configFields: [
      { key: 'academicLevel', label: 'Academic Level', type: 'select', options: ['High School', 'Undergraduate', 'Post-Graduate'], default: 'Undergraduate' },
      { key: 'strictness', label: 'Grading Strictness', type: 'select', options: ['Lenient', 'Standard', 'Rigorous'], default: 'Standard' },
      { key: 'maxScore', label: 'Total Points', type: 'number', default: 100 }
    ],
    defaultPreview: 'Rubric evaluated: Thesis (28/30), Evidence (27/30), Structure (18/20), Style (17/20). Overall: 90/100 (A-).'
  },

  // 2. Fact Checker
  'fact-checker': {
    type: 'agentNode',
    agentId: 'fact-checker',
    label: 'Fact Checker',
    category: 'research',
    icon: 'CheckCircle',
    color: 'emerald',
    accentColor: '#10b981',
    description: 'Cross-reference claims with primary academic sources & citations.',
    defaultModel: 'Granite RAG Engine',
    defaultTemperature: 0.0,
    models: ['Granite RAG Engine', 'Brave Search Grounding', 'Perplexity API'],
    inputs: [
      { id: 'claims_text', name: 'Claims to Verify', type: 'text', color: '#38bdf8' },
      { id: 'source_doc', name: 'Source Chunks', type: 'document', color: '#f43f5e' }
    ],
    outputs: [
      { id: 'verification_report', name: 'Verification Report', type: 'structured', color: '#8b5cf6' },
      { id: 'citations', name: 'Verified Citations', type: 'text', color: '#38bdf8' }
    ],
    configFields: [
      { key: 'confidenceThreshold', label: 'Min Confidence %', type: 'number', default: 85 },
      { key: 'includeCounterEvidence', label: 'Include Counter Evidence', type: 'boolean', default: true }
    ],
    defaultPreview: '3 of 3 claims VERIFIED against MIT OpenCourseWare Syllabus with 98% grounding confidence.'
  },

  // 3. Text Improver
  'text-improver': {
    type: 'agentNode',
    agentId: 'text-improver',
    label: 'Text Improver',
    category: 'text',
    icon: 'Sparkles',
    color: 'purple',
    accentColor: '#a855f7',
    description: 'Enhances clarity, academic tone, syntax, and conciseness.',
    defaultModel: 'IBM Granite 13B',
    defaultTemperature: 0.3,
    models: ['IBM Granite 13B', 'Gemini 1.5 Flash', 'Claude 3.5 Haiku'],
    inputs: [
      { id: 'draft_text', name: 'Draft Text', type: 'text', color: '#38bdf8' }
    ],
    outputs: [
      { id: 'improved_text', name: 'Polished Text', type: 'text', color: '#38bdf8' },
      { id: 'diff_summary', name: 'Diff Breakdown', type: 'structured', color: '#8b5cf6' }
    ],
    configFields: [
      { key: 'tone', label: 'Target Tone', type: 'select', options: ['Formal Academic', 'Scholarly Publication', 'Plain English', 'Persuasive'], default: 'Formal Academic' },
      { key: 'readabilityTarget', label: 'Reading Level', type: 'select', options: ['Grade 10', 'Grade 12', 'Collegiate'], default: 'Collegiate' }
    ],
    defaultPreview: 'Replaced 14 passive constructs, enhanced vocabulary specificity, readability increased by +12%.'
  },

  // 4. Summarizer
  'summarizer': {
    type: 'agentNode',
    agentId: 'summarizer',
    label: 'Summarizer',
    category: 'text',
    icon: 'AlignLeft',
    color: 'cyan',
    accentColor: '#06b6d4',
    description: 'Condenses long lectures and papers into concise executive points.',
    defaultModel: 'IBM Granite 20B',
    defaultTemperature: 0.2,
    models: ['IBM Granite 20B', 'Gemini 1.5 Flash', 'Local Smart Engine'],
    inputs: [
      { id: 'source_text', name: 'Source Content', type: 'text', color: '#38bdf8' }
    ],
    outputs: [
      { id: 'key_takeaways', name: 'Key Points', type: 'structured', color: '#8b5cf6' },
      { id: 'executive_summary', name: 'Abstract', type: 'text', color: '#38bdf8' }
    ],
    configFields: [
      { key: 'format', label: 'Summary Format', type: 'select', options: ['Bullet Points', 'Executive Brief', 'Cornell Method'], default: 'Bullet Points' },
      { key: 'length', label: 'Detail Level', type: 'select', options: ['Ultra-Concise (10%)', 'Balanced (25%)', 'Comprehensive (40%)'], default: 'Balanced (25%)' }
    ],
    defaultPreview: '• Master Theorem solves recurrences T(n) = aT(n/b) + f(n).\n• Divide-and-conquer runtime dominates when a > b^d.\n• Quicksort average is O(n log n).'
  },

  // 5. Concept Extractor
  'concept-extractor': {
    type: 'agentNode',
    agentId: 'concept-extractor',
    label: 'Concept Extractor',
    category: 'study',
    icon: 'Lightbulb',
    color: 'amber',
    accentColor: '#f59e0b',
    description: 'Extracts core concepts, ontology relationships, and key definitions.',
    defaultModel: 'IBM Granite 13B',
    defaultTemperature: 0.2,
    models: ['IBM Granite 13B', 'Gemini 1.5 Flash'],
    inputs: [
      { id: 'context_notes', name: 'Course Notes', type: 'text', color: '#38bdf8' }
    ],
    outputs: [
      { id: 'concepts_json', name: 'Concepts Matrix', type: 'structured', color: '#8b5cf6' },
      { id: 'flashcard_seeds', name: 'Flashcard Seeds', type: 'dataset', color: '#10b981' }
    ],
    configFields: [
      { key: 'maxConcepts', label: 'Max Concepts', type: 'number', default: 8 },
      { key: 'includeAnalogies', label: 'Include Real-World Analogies', type: 'boolean', default: true }
    ],
    defaultPreview: 'Extracted 6 atomic concepts: [Recursion Tree, Asymptotic Bounds, Pivot Partitioning, Amortized Cost, B-Tree Balancing, Master Case 2].'
  },

  // 6. Study Plan Generator
  'study-plan-gen': {
    type: 'agentNode',
    agentId: 'study-plan-gen',
    label: 'Study Plan Gen',
    category: 'study',
    icon: 'Calendar',
    color: 'indigo',
    accentColor: '#6366f1',
    description: 'Generates spaced repetition study calendars based on exam deadlines.',
    defaultModel: 'IBM Granite 20B',
    defaultTemperature: 0.3,
    models: ['IBM Granite 20B', 'Claude 3.5 Sonnet'],
    inputs: [
      { id: 'topics_list', name: 'Topic List', type: 'structured', color: '#8b5cf6' },
      { id: 'deadline_date', name: 'Exam Target', type: 'text', color: '#38bdf8' }
    ],
    outputs: [
      { id: 'daily_schedule', name: 'Daily Calendar', type: 'structured', color: '#8b5cf6' },
      { id: 'ics_calendar', name: 'iCal Export (.ics)', type: 'text', color: '#38bdf8' }
    ],
    configFields: [
      { key: 'dailyCapacityHours', label: 'Daily Study Hours', type: 'number', default: 2.5 },
      { key: 'spacedRepetitionAlgorithm', label: 'Algorithm', type: 'select', options: ['SuperMemo SM-2', 'Leitner 5-Box', 'Fibonacci Schedule'], default: 'SuperMemo SM-2' }
    ],
    defaultPreview: '14-day mastery schedule generated: Days 1-4 Foundations, Days 5-9 Problem Sets, Days 10-14 Mock Exams & Remediation.'
  },

  // 7. Web Search Agent
  'web-search': {
    type: 'agentNode',
    agentId: 'web-search',
    label: 'Web Search',
    category: 'research',
    icon: 'Search',
    color: 'blue',
    accentColor: '#3b82f6',
    description: 'Gathers verified academic research papers, arXiv preprints & articles.',
    defaultModel: 'Brave Academic Search',
    defaultTemperature: 0.0,
    models: ['Brave Academic Search', 'Semantic Scholar API', 'Google Scholar Scraper'],
    inputs: [
      { id: 'search_query', name: 'Query String', type: 'text', color: '#38bdf8' }
    ],
    outputs: [
      { id: 'search_results', name: 'Search Excerpts', type: 'text', color: '#38bdf8' },
      { id: 'source_urls', name: 'Citations & URLs', type: 'structured', color: '#8b5cf6' }
    ],
    configFields: [
      { key: 'domainFilter', label: 'Domain Restriction', type: 'select', options: ['.edu / .org only', 'Peer-Reviewed Journals', 'Unrestricted'], default: '.edu / .org only' },
      { key: 'maxResults', label: 'Max Results', type: 'number', default: 5 }
    ],
    defaultPreview: 'Found 4 peer-reviewed sources from ACM Digital Library and arXiv on transformer attention mechanisms.'
  },

  // 8. YouTube Analyzer
  'youtube-analyzer': {
    type: 'agentNode',
    agentId: 'youtube-analyzer',
    label: 'YouTube Analyzer',
    category: 'files',
    icon: 'Video',
    color: 'red',
    accentColor: '#ef4444',
    description: 'Extracts timestamped video transcripts, slide summaries & chapters.',
    defaultModel: 'Whisper-v3 + Granite',
    defaultTemperature: 0.0,
    models: ['Whisper-v3 + Granite', 'YouTube Native Captions'],
    inputs: [
      { id: 'video_url', name: 'YouTube URL', type: 'text', color: '#38bdf8' }
    ],
    outputs: [
      { id: 'full_transcript', name: 'Full Transcript', type: 'text', color: '#38bdf8' },
      { id: 'timestamped_chapters', name: 'Chapters & Timestamps', type: 'structured', color: '#8b5cf6' }
    ],
    configFields: [
      { key: 'autoPunctuate', label: 'Punctuation & Clean', type: 'boolean', default: true },
      { key: 'chunkIntervalMinutes', label: 'Chapter Interval (mins)', type: 'number', default: 10 }
    ],
    defaultPreview: 'Extracted 1h 42m lecture from MIT 6.006. 12 chapters identified with 99.2% transcription accuracy.'
  },

  // 9. PDF Reader & Ingestion
  'pdf-reader': {
    type: 'agentNode',
    agentId: 'pdf-reader',
    label: 'PDF Reader',
    category: 'files',
    icon: 'FileCode',
    color: 'rose',
    accentColor: '#f43f5e',
    description: 'Parses complex textbooks, slides, tables, and mathematical formulas.',
    defaultModel: 'pdf-parse + OCR Engine',
    defaultTemperature: 0.0,
    models: ['pdf-parse + OCR Engine', 'Tesseract OCR'],
    inputs: [
      { id: 'pdf_file', name: 'PDF Upload', type: 'document', color: '#f43f5e' }
    ],
    outputs: [
      { id: 'parsed_markdown', name: 'Extracted Markdown', type: 'text', color: '#38bdf8' },
      { id: 'vector_chunks', name: 'Vector Chunks', type: 'dataset', color: '#10b981' }
    ],
    configFields: [
      { key: 'chunkSize', label: 'Chunk Size (tokens)', type: 'number', default: 512 },
      { key: 'extractTables', label: 'Extract Tables as Markdown', type: 'boolean', default: true }
    ],
    defaultPreview: 'Parsed 38 pages of "Chapter 4: Algorithmic Paradigms". Generated 42 vector embeddings.'
  },

  // 10. Web Browser Agent
  'browser-agent': {
    type: 'agentNode',
    agentId: 'browser-agent',
    label: 'Browser Agent',
    category: 'automation',
    icon: 'Globe',
    color: 'teal',
    accentColor: '#14b8a6',
    description: 'Navigates academic databases, extracts documentation, and scrapes portals.',
    defaultModel: 'Playwright Headless Agent',
    defaultTemperature: 0.1,
    models: ['Playwright Headless Agent', 'Direct HTTP Reader'],
    inputs: [
      { id: 'target_url', name: 'Web Target URL', type: 'text', color: '#38bdf8' }
    ],
    outputs: [
      { id: 'page_content', name: 'Clean Content', type: 'text', color: '#38bdf8' },
      { id: 'metadata_json', name: 'Page Metadata', type: 'structured', color: '#8b5cf6' }
    ],
    configFields: [
      { key: 'stripNavigation', label: 'Strip Headers & Footers', type: 'boolean', default: true },
      { key: 'renderJavascript', label: 'Render Dynamic JS', type: 'boolean', default: true }
    ],
    defaultPreview: 'Extracted main documentation article from Wikipedia and Stanford Encyclopedia of Philosophy.'
  },

  // 11. Adaptive Quiz Generator
  'quiz-generator': {
    type: 'agentNode',
    agentId: 'quiz-generator',
    label: 'Adaptive Quiz Gen',
    category: 'study',
    icon: 'HelpCircle',
    color: 'violet',
    accentColor: '#8b5cf6',
    description: 'Generates deterministically grounded multiple-choice questions & cards.',
    defaultModel: 'IBM Granite 13B Instruct',
    defaultTemperature: 0.1,
    models: ['IBM Granite 13B Instruct', 'Gemini 1.5 Flash', 'Deterministic RAG'],
    inputs: [
      { id: 'study_material', name: 'Curriculum Material', type: 'text', color: '#38bdf8' }
    ],
    outputs: [
      { id: 'mcq_questions', name: 'Verified Questions', type: 'quiz', color: '#8b5cf6' },
      { id: 'flashcards_deck', name: 'Flashcard Deck', type: 'dataset', color: '#10b981' }
    ],
    configFields: [
      { key: 'questionCount', label: 'Number of Questions', type: 'number', default: 5 },
      { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['Easy', 'Medium', 'Hard', 'Adaptive'], default: 'Adaptive' },
      { key: 'deterministicKeys', label: 'Deterministic Scoring Lock', type: 'boolean', default: true }
    ],
    defaultPreview: '5 questions generated with strict curriculum groundings. Answer keys indexed deterministically.'
  }
};
