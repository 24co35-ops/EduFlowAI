# Deployment & Infrastructure Guide — EduFlow AI

## 1. Local Development Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- (Optional) MongoDB local or MongoDB Atlas connection URI

### Step-by-Step Instructions
1. **Clone repository:**
   ```bash
   git clone https://github.com/24co35-ops/EduFlowAI.git
   cd EduFlowAI
   ```
2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```
3. **Configure Environment (`.env`):**
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=eduflow_dev_jwt_secret_change_in_production
   CLIENT_URL=http://localhost:5173

   # Optional IBM watsonx.ai credentials
   WATSONX_URL=https://us-south.ml.cloud.ibm.com
   IBM_API_KEY=your_ibm_api_key_here
   WATSONX_PROJECT_ID=your_watsonx_project_id_here

   # Optional MongoDB URI
   MONGO_URI=mongodb://localhost:27017/eduflow
   ```
4. **Run development server:**
   ```bash
   npm run dev
   ```
   - Client: `http://localhost:5173`
   - Server: `http://localhost:5000`

---

## 2. Production Vercel Serverless Deployment

EduFlow AI is configured with `vercel.json` and `api/index.js` for single-command deployment:

```json
{
  "version": 2,
  "builds": [
    { "src": "api/index.js", "use": "@vercel/node" },
    { "src": "client/package.json", "use": "@vercel/static-build" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.js" },
    { "src": "/(.*)", "dest": "/client/dist/$1" }
  ]
}
```

### Deployment Commands
```bash
vercel --prod
```

### Production Environment Variables Checklist
- `JWT_SECRET`: Secure 64-character random string (enforced in production mode)
- `IBM_API_KEY`: IBM Cloud API key with watsonx.ai access
- `WATSONX_PROJECT_ID`: Targeted IBM Cloud project ID
- `MONGO_URI`: MongoDB Atlas cluster connection string
- `NODE_ENV`: `production`
