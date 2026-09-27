# Retrieval-Augmented Generation (RAG) Architecture — EduFlow AI

> **Purpose:** Detailed architectural specification of the curriculum ingestion, chunking, semantic retrieval, and source-grounded response generation pipeline.

---

## 1. RAG Pipeline Overview

EduFlow AI replaces raw prompt truncation with a multi-stage curriculum retrieval pipeline:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Ingestion & Preprocessing                                │
│    PDF / Text Syllabus Upload → Validation (≤10MB)          │
│    → Clean Whitespace → Page Boundary Detection             │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 2. Semantic Chunking                                        │
│    500–900 Character Windows | 10–15% Token Overlap         │
│    Metadata Enrichment: { chapterId, topicId, pageNumber }  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 3. Indexing & Storage                                       │
│    CurriculumChunk Schema in MongoDB / Fast In-Memory Index │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 4. Retrieval Layer (Similarity / BM25 Term Relevance)       │
│    Student Query / Quiz Topic → Retrieve Top-K (3–5 Chunks) │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 5. Grounded Prompt Assembly & Watsonx Inference             │
│    Grounded System Prompt + Retrieved Source Chunks          │
│    → IBM Granite 13B / 20B → Answer + Source Citations      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Grounding & Anti-Hallucination Prompt Policy

Every curriculum-grounded task strictly enforces the following prompt constraints:

```text
ROLE: You are the EduFlow AI Academic Assistant grounded strictly in the provided syllabus.
GROUNDING: You must formulate responses solely based on the provided curriculum chunks.
CITATION: Attach exact source markers: [Source: Chapter X, Page Y].
OUT-OF-SCOPE: If the query cannot be answered from the supplied material, explicitly state:
"That topic is outside the scope of this course curriculum. Please ask about the active chapters."
NO INVENTION: Do not fabricate formulas, historical events, or facts not present in the chunks.
```

---

## 3. Retrieval Service Implementation

Implemented in `server/services/ai/retrieval.service.js`:
- Chunks text into semantic slices.
- Scores query against stored chunks using token overlap and TF-IDF relevance.
- Returns top-ranked chunks with page numbers and chapter metadata.
- Out-of-scope detector identifies queries with zero similarity to syllabus topics and returns clean redirection.
