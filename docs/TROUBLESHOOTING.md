# Troubleshooting & Diagnostic Guide — EduFlow AI

## 1. Common Issues & Solutions

### 1. "Service temporarily unavailable. Database connection required in production."
- **Cause:** `NODE_ENV=production` is set, but `MONGO_URI` is unset or unreachable.
- **Fix:** In local development, ensure `NODE_ENV=development` is set in `.env` to enable the zero-setup in-memory database engine. In production, verify MongoDB Atlas IP whitelist allows connection from your host.

### 2. "IBM BOB API key invalid or rate limited"
- **Cause:** `IBM_API_KEY` expired or watsonx project quota exceeded.
- **Fix:** The system automatically falls back to the Smart Curriculum Engine and records `fallbackUsed: true` in telemetry. Verify your IBM Cloud IAM API Key and Project ID in `.env`.

### 3. "Too many AI generation requests. Please wait 15 minutes."
- **Cause:** Rate limiter triggered on AI generation routes (limit: 20 requests per 15 minutes per IP).
- **Fix:** Wait for the window to reset or adjust `aiLimiter` in route files for test environments.

### 4. "CORS policy blocked request"
- **Cause:** Request origin is not listed in `CLIENT_URL`.
- **Fix:** Update `CLIENT_URL=http://localhost:5173,https://your-domain.vercel.app` in `.env` or leave blank for same-origin serverless deployments.

---

## 2. Real-Time Diagnostic Verification

To view live telemetry and connectivity:
1. Open the EduFlow AI web app.
2. Click the **"Diagnostics"** button in the top navigation bar.
3. Review IBM Granite connection status, active model IDs, latency counters, and total successful calls.
