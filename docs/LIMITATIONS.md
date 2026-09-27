# Known Limitations & Future Enhancements — EduFlow AI

## 1. Current Architectural Boundaries

1. **PDF Parsing:** Uses pure text extraction from `pdf-parse`. Scanned images of PDF textbooks without OCR text layers require pre-OCR processing before upload.
2. **Context Window Limitations:** Very large syllabi (>50 pages) are currently truncated to the first 4,000 characters. Future iterations will incorporate vector embeddings / RAG chunking.
3. **Audio / Speech Synthesis:** Flashcards and doubt solver currently render text and equations. Multilingual voice synthesis (text-to-speech) is planned for the next release.
4. **Offline Evaluation:** In local environments without live IBM watsonx.ai credentials, the system automatically uses its Smart Curriculum Engine fallback. Live IBM credentials enable full cloud inference.

---

## 2. Recommended Next Steps for Scale

- **Vector Database (RAG):** Integrate Milvus or pgvector for multi-chapter textbook semantic search.
- **LMS Integration:** Implement LTI (Learning Tools Interoperability) 1.3 for direct integration into Canvas, Moodle, and Google Classroom.
- **Offline Mobile App:** Package the student portal as an offline PWA with local SQLite sync.
