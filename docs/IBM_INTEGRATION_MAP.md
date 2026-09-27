# IBM watsonx.ai / BOB Integration Map & Audit Trail

**Platform:** EduFlow AI  
**AI Vendor:** IBM Cloud — watsonx.ai  
**Primary URL:** `https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2024-05-31`  
**Authentication:** IBM Cloud IAM OAuth 2.0 (`https://iam.cloud.ibm.com/identity/token`)  

---

## 1. Feature-to-IBM Model Mapping Table

| Feature ID | Feature Name | Implementation File | Function Name | Target Model ID | Input Parameters | Output Format & Validation |
|---|---|---|---|---|---|---|
| **F1** | **Syllabus to Lesson Plan** | `server/services/ai/bob.provider.js` | `generateLessonPlan()` | `ibm/granite-13b-instruct-v2` | `syllabusText`, `subject`, `language`, `max_new_tokens: 1200` | Structured JSON with 5-day plan, daily objectives, classroom activities. Validated by `outputValidator.validateLessonPlan()`. |
| **F2** | **Auto Quiz Generation** | `server/services/ai/bob.provider.js` | `generateQuiz()` | `ibm/granite-13b-instruct-v2` | `topic`, `difficulty`, `questionCount`, `assignedGrade` | JSON Array of MCQ, True/False, and Short Answer questions with explanations. Deduplicated and validated by `validateQuiz()`. |
| **F3** | **Multilingual Localization** | `server/services/ai/bob.provider.js` | `translateText()` | `ibm/granite-20b-multilingual` | `text`, `targetLang: 'hi'\|'mr'\|'ta'\|'te'\|'kn'` | Localized educational text in target Indian/global language with preserved formatting. |
| **F4** | **Curriculum Doubt Solver** | `server/services/ai/bob.provider.js` | `solveDoubt()` | `ibm/granite-13b-chat-v2` | `userQuestion`, `chatHistory`, `syllabusScope` | Natural-language step-by-step tutoring reply with real-world examples and formula explanations. |
| **F5** | **Flashcards & Summary** | `server/services/ai/bob.provider.js` | `generateFlashcards()` | `ibm/granite-13b-instruct-v2` | `chapterText`, `title`, `max_new_tokens: 1000` | JSON object containing 3-bullet executive summary and 5 revision cards with `front` and `back`. Validated by `validateFlashcards()`. |
| **F6 & F7** | **NLP Auto-Grading** | `server/services/ai/bob.provider.js` | `autoGradeAnswer()` | `ibm/granite-13b-instruct-v2` | `question`, `expectedAnswer`, `studentAnswer` | JSON object with `score` (0–5), `maxScore: 5`, and constructive explanatory `feedback`. Validated by `validateGrading()`. |
| **F8 & P1** | **Adaptive Remediation Loop** | `server/services/ai/bob.provider.js` | `generateRemediation()` | `ibm/granite-13b-instruct-v2` | `topic`, `studentScore`, `weakSubtopics` | JSON object containing 3-min explanation, real-world analogy, misconception alert, 3 practice questions, and next action. Validated by `validateRemediation()`. |

---

## 2. IBM Authentication Flow & Token Security

```text
[ EduFlow Server ]
       │
       ▼ (1) POST API Key (grant_type=urn:ibm:params:oauth:grant-type:apikey)
[ IBM Cloud IAM: https://iam.cloud.ibm.com/identity/token ]
       │
       ▼ (2) Returns 3600s JWT Access Token
[ Token Cache in BobProvider ] ─── (Stored in memory with 50-minute TTL)
       │
       ▼ (3) POST with Bearer Token & Project ID
[ watsonx.ai Text Generation: /ml/v1/text/generation?version=2024-05-31 ]
       │
       ▼ (4) Returns Granite Model Generated Output
[ Output Validation & Repair Pipeline: outputValidator.js ]
```

### Security Measures:
- **Zero Client Exposure:** IBM API keys and Project IDs are never sent to the browser or stored in frontend code.
- **Token Caching:** IAM tokens are cached for 3,000 seconds (50 minutes) to eliminate redundant authentication roundtrips and avoid rate limits.
- **Fail-Safe Fallback:** If IBM BOB credentials are not provided during local evaluation, the application uses a smart curriculum fallback engine while clearly recording `fallbackUsed: true` in telemetry.

---

## 3. Telemetry & Observability Verification

The endpoint `GET /api/health?diagnostics=true` exposes real-time status and request counters:
```json
{
  "status": "online",
  "appName": "EduFlow AI Enterprise Backend",
  "databaseConnected": true,
  "primaryProvider": "IBM BOB (watsonx.ai Granite 13B & 20B)",
  "ibmBobConfigured": true,
  "models": {
    "instruct": "ibm/granite-13b-instruct-v2",
    "chat": "ibm/granite-13b-chat-v2",
    "multilingual": "ibm/granite-20b-multilingual"
  },
  "telemetry": {
    "totalRequests": 48,
    "successfulRequests": 48,
    "ibmBobRequests": 42,
    "fallbackRequests": 6,
    "validationFailures": 0,
    "avgLatencyMs": 340
  }
}
```
