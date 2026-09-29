# EduFlow AI — IBM watsonx.ai Setup Guide

> This document describes the ACTUAL configuration required to activate IBM watsonx.ai
> in EduFlow AI. Every variable maps to a real code path in `server/services/ai/bob.provider.js`.

---

## 1. IBM Account & Project Requirements

You need:
1. An active **IBM Cloud account** (cloud.ibm.com)
2. A **watsonx.ai project** provisioned in your IBM Cloud account
3. An **IBM Cloud API key** (IAM → Manage → Access → API keys)
4. The **Project ID** from your watsonx.ai project settings

---

## 2. Required IBM Service

- Service: **IBM watsonx.ai** (formerly Watson Studio foundation models)
- Region: us-south recommended (default endpoint: `https://us-south.ml.cloud.ibm.com`)
- Authentication: IBM Cloud IAM OAuth 2.0 (API key → Bearer token exchange)

---

## 3. Required Environment Variables

Set these in `.env` (local) or Vercel Environment Variables (production):

```env
# IBM watsonx.ai Primary Credentials (REQUIRED to activate IBM)
WATSONX_APIKEY=<your_ibm_cloud_api_key>          # IAM API key from cloud.ibm.com
WATSONX_PROJECT_ID=<your_watsonx_project_id>     # Project ID from watsonx.ai dashboard

# IBM watsonx.ai Endpoint (default works for us-south region)
WATSONX_URL=https://us-south.ml.cloud.ibm.com    # Change for eu-de, jp-tok, etc.
WATSONX_VERSION=2023-05-29                        # API version — do not change unless IBM updates

# IBM Granite Model IDs (defaults are correct — change only if you have access to newer versions)
WATSONX_MODEL_TEXT=ibm/granite-13b-instruct-v2
WATSONX_MODEL_CHAT=ibm/granite-13b-chat-v2
WATSONX_MODEL_MULTILINGUAL=ibm/granite-20b-multilingual
```

**Alternative (No IBM Cloud account):** Use Hugging Face Granite runner:
```env
HF_API_TOKEN=<your_huggingface_token>            # Free at huggingface.co/settings/tokens
HF_GRANITE_MODEL=ibm-granite/granite-3.3-8b-instruct
```

---

## 4. Variables NOT Required for IBM

These are unrelated to IBM and serve separate functions:
```env
GEMINI_API_KEY=...     # Fallback only — not IBM
SUPABASE_URL=...       # Database — not IBM
JWT_SECRET=...         # Auth — not IBM
```

---

## 5. Local Setup

```bash
# 1. Clone repository
git clone https://github.com/24co35-ops/EduFlowAI.git
cd EduFlowAI

# 2. Copy example and fill in IBM credentials
cp .env.example .env
# Edit .env: set WATSONX_APIKEY and WATSONX_PROJECT_ID

# 3. Install dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# 4. Start application
npm run dev
```

---

## 6. Provider Configuration — How It Works

Once `WATSONX_APIKEY` and `WATSONX_PROJECT_ID` are set, IBM is activated automatically.

**File:** `server/services/ai/bob.provider.js` lines 55-62:
```javascript
isWatsonxConfigured() {
  return Boolean(
    this.apiKey && this.apiKey.trim().length > 10 &&
    this.projectId && this.projectId.trim().length > 5
  );
}
```

If configured, every AI feature will:
1. Fetch an IAM Bearer token from `iam.cloud.ibm.com`
2. POST to the watsonx.ai text generation endpoint
3. Parse and validate the Granite response
4. Attach `{ provider: "ibm_watsonx", model: "ibm/granite-13b-instruct-v2", ... }` to the response

---

## 7. Health Check

Verify IBM is active by calling:
```
GET /api/health
```

Expected response when IBM is configured:
```json
{
  "status": "online",
  "primaryProvider": "IBM watsonx.ai (Granite Foundation Models)",
  "providerType": "ibm_watsonx",
  "watsonxConfigured": true,
  "ibmBobConfigured": true
}
```

Expected response when IBM is NOT configured (current deployment):
```json
{
  "status": "online",
  "primaryProvider": "Curriculum Smart Engine (Deterministic Local)",
  "providerType": "curriculum_engine",
  "watsonxConfigured": false,
  "ibmBobConfigured": false
}
```

---

## 8. Integration Test

After setting IBM credentials, run:
```bash
cd server
node test_audit_fixes.js
```

Expected: All 14 tests pass. Test 6 (lesson generation), 7 (quiz generation), and 8 (NLP grading) will use IBM Granite when configured.

You can also test IBM specifically:
```bash
node -e "
const aiService = require('./services/ai');
console.log('IBM configured:', aiService.isBobConfigured());
aiService.generateQuiz('Ohm\\'s Law', 'medium', 2, 'Class 10')
  .then(r => console.log('Provider:', r._aiMetadata?.provider))
  .catch(e => console.error(e.message));
"
```

---

## 9. Failure Behavior

| Scenario | Behavior |
|---|---|
| `WATSONX_APIKEY` empty/missing | IBM provider skipped; Gemini or Curriculum Engine used |
| IAM token fetch fails (network/auth) | Error caught, fallback engaged, `fallbackUsed: true` recorded |
| watsonx.ai returns empty/malformed response | `safeExtractJson()` fails, validator rejects, fallback engaged |
| Both IBM and Gemini unavailable | Deterministic Curriculum Engine produces content, `executionState: LOCAL_FALLBACK` |
| Invalid project ID | IAM succeeds but watsonx returns 404/403; fallback engaged |

---

## 10. Fallback Behavior

Fallback is **honest** — never silently replaces IBM output with a claim of IBM origin.

Every fallback response carries:
```json
{ "provider": "curriculum_engine", "fallbackUsed": true, "executionState": "LOCAL_FALLBACK" }
```

The UI (`AIEvidenceBadge.jsx`) reads these fields and renders the appropriate provider label — IBM blue vs curriculum parchment.

---

## 11. Troubleshooting

| Issue | Check |
|---|---|
| `IBM BOB unavailable` in UI | `WATSONX_APIKEY` and `WATSONX_PROJECT_ID` are blank or placeholder |
| `Failed to retrieve IAM access token` | API key is invalid or expired; regenerate at cloud.ibm.com |
| `404` from watsonx endpoint | `WATSONX_URL` is wrong for your region, or model ID is unavailable in your project |
| `403` from watsonx endpoint | Project ID mismatch, or API key lacks watsonx.ai permissions |
| HF path not working | `HF_API_TOKEN` must be a real HF token with read access — not a placeholder |
