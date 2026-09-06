# DailyOps AI — Enterprise Operational Copilot

> Production-ready operational intelligence application powered by **Google AI Studio**, **Gemini 3.8 Flash**, **Firebase Authentication**, **Cloud Firestore**, and **Google Cloud Run**.

DailyOps AI transforms messy daily operational requests, critical incident alerts, client escalations, and meeting notes into structured executive briefs and chronological daily execution sequences.

---

## 🧭 Dashboard Navigation Structure

DailyOps AI provides structured workspace navigation across both top header controls and an authenticated in-page subnav bar:

- **Dashboard**: The consolidated operations command center bringing together the morning priority dashboard, real-time input automation, active synthesis results, and user task history.
- **New Task**: Dedicated task input and automation workspace for drafting, pasting operational logs, selecting presets, and generating synthesized briefs.
- **History**: Full-screen operational task archive and audit log with search, priority filtering, inspection drilldown, and Firestore deletion.
- **Priority Dashboard**: Focused morning priority briefing showcasing KPI metrics, priority distribution (High / Medium / Low), the today's action items checklist with interactive checkboxes, and recent task alerts.
- **Logout**: Secure session termination invoking Firebase Authentication sign-out and resetting local state.

---

## ☀️ Morning Priority Dashboard

DailyOps AI features an executive **Morning Priority Dashboard** rendered at the top of the authenticated command center. The dashboard continuously reads the authenticated user's saved tasks from Cloud Firestore in real time:

- **Total Tasks**: Aggregate count of all operational tasks saved in the user's isolated Firestore database.
- **Priority Distribution Metrics**:
  - 🔴 **High Priority**: Immediate attention items with hard deadlines, SLA exposures, or blocking dependencies.
  - 🟡 **Medium Priority**: Core operational milestones requiring cross-team coordination.
  - 🟢 **Low Priority**: Routine backlog updates and standard maintenance items.
- **Open Action Items Checklist**: Aggregates actionable items across all user tasks, prioritizing high-urgency deliverables with interactive completion toggles (`localStorage` persisted per user).
- **Recent Operational Tasks**: Quick-access cards displaying recent task summaries, creation timestamps, deadline urgency tags, and one-click drilldown into the full synthesized brief.
- **Strict Data Isolation**: Fully conforms to the existing security model; queries are restricted to `users/{userId}/tasks` path rules so users only ever see their own records.

---

## 🏛️ Architecture Overview

DailyOps AI implements a secure, defense-in-depth full-stack architecture running behind Google Cloud Run:

```
                          ┌────────────────────────────────┐
                          │    Browser Client (React 19)   │
                          │   Firebase Auth / Google SSO   │
                          └───────────────┬────────────────┘
                                          │
                   1. User Google SSO     │ 2. Authenticated API Call
                   & ID Token Retrieval   │    (Bearer <idToken>)
                                          ▼
┌───────────────────────┐         ┌────────────────────────────────┐
│ Firebase Auth Service │         │ Google Cloud Run (Express.js)  │
│  Google OAuth Provider│         │  - Token Verification (Admin)  │
└───────────────────────┘         │  - Input Sanitization (25KB max)
                                  │  - Untrusted Content Guardrails│
                                  └───────────────┬────────────────┘
                                                  │
                                                  │ 3. Server-side Gemini Call
                                                  │    (process.env.GEMINI_API_KEY)
                                                  ▼
┌───────────────────────────────┐         ┌────────────────────────────────┐
│   Cloud Firestore Database    │         │  Google Cloud / AI Studio      │
│  - Path: users/{uid}/tasks/*  │         │  Gemini 2.5 Flash Model        │
│  - Isolated Security Rules    │         │  Structured JSON Output        │
└───────────────▲───────────────┘         └────────────────────────────────┘
                │
                │ 4. Client Direct Sync via Authenticated SDK
                │    (Enforced by path-level security rules)
```

---

## 🛡️ Security Architecture & Compliance

| # | Requirement | Implementation in DailyOps AI |
|---|-------------|--------------------------------|
| **1** | **No Hardcoded Credentials** | All keys injected via environment variables (`GEMINI_API_KEY`) and Google Cloud Secret Manager. |
| **2** | **Firebase Google Sign-In** | Authenticates through Google Identity Provider via Firebase Auth (`signInWithPopup`). |
| **3** | **Strict User Data Isolation** | Data isolated to `users/{userId}/tasks/{taskId}`. No user can read or query another user's collection. |
| **4** | **No Insecure Firestore Rules** | `firestore.rules` prohibits open access. Default-deny rule `match /{document=**} { allow read, write: if false; }`. |
| **5** | **Input Validation & Sanitization** | Both client and server reject empty inputs, enforce length boundaries (5 – 25,000 chars), and trim whitespace. |
| **6** | **Untrusted Content Mitigation** | User text is wrapped in `<untrusted_user_input>` XML tags with strict system instructions and structured JSON schema enforcement to neutralize prompt injection attacks. |
| **7** | **Zero Client API Key Leakage** | Gemini API is strictly invoked on the backend server (`server.ts`). Client code has zero access to Gemini tokens. |
| **8** | **Server-Side Gemini Access** | Uses `@google/genai` TypeScript SDK on Node.js with lazy client initialization. |
| **9** | **Server-Side Token Verification** | Express `/api/analyze-task` endpoint extracts `Authorization: Bearer <idToken>` and verifies credentials via Firebase Admin SDK. |
| **10**| **Secret Manager Integration** | Configured for Cloud Run secret mounting via `--set-secrets="GEMINI_API_KEY=projects/$PROJECT_ID/secrets/gemini-api-key:latest"`. |
| **11**| **Resilient Error Handling** | Structured error codes and user-safe error messages. Internal stack traces and credential dumps are suppressed. |
| **12**| **No Leaked Stack Traces** | Client receives clean `{ error: "..." }` responses; low-level driver logs remain server-side only. |
| **13**| **Enforced Security Rules** | Verified rules deployed with schema validation for all operational task fields. |
| **14**| **Automated Verification** | Pre-commit and CI linting (`tsc --noEmit`) and full build verification (`vite build && esbuild`). |
| **15**| **User Data Deletion** | Complete CRUD self-service: users can delete their own history records at any time. |

---

## 📂 Firestore Data Model

Data path:
```
/users/{userId}/tasks/{taskId}
```

### Document Schema:

```typescript
{
  originalInput: string;            // Raw operational email, incident alert, or note
  summary: string;                  // Executive 2-3 sentence overview
  priority: 'High' | 'Medium' | 'Low'; // Calculated operational priority
  priorityReason: string;           // Business reason (e.g. SLA impact, revenue risk)
  actionItems: string[];            // Concrete actionable task list
  deadlines: [                      // Milestone & deadline extractions
    {
      item: string;
      timeframe: string;
      urgency: 'Immediate' | 'This Week' | 'Upcoming' | 'Flexible'
    }
  ];
  stakeholders: [                   // Key personnel & departments involved
    {
      nameOrRole: string;
      department?: string;
      responsibilities: string;
    }
  ];
  actionPlan: [                     // Phased daily execution sequence
    {
      step: number;
      phase: string;
      action: string;
      expectedOutcome: string;
    }
  ];
  suggestedResponse: string;        // Formatted, ready-to-send email or response draft
  createdAt: string;                // ISO 8601 creation timestamp
  savedAt?: string;                 // ISO 8601 timestamp of persistence
}
```

---

## 🔒 Active Firestore Security Rules

Deployed in `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/tasks/{taskId} {
      // User must be authenticated and matching the document's path userId
      allow read, delete: if request.auth != null && request.auth.uid == userId;
      
      // Enforce schema completeness, string bounds, and enum validation
      allow create: if request.auth != null && request.auth.uid == userId
                    && request.resource.data.keys().hasAll(['originalInput', 'summary', 'priority', 'actionItems', 'deadlines', 'stakeholders', 'actionPlan', 'suggestedResponse', 'createdAt'])
                    && request.resource.data.originalInput is string
                    && request.resource.data.originalInput.size() > 0
                    && request.resource.data.originalInput.size() <= 20000
                    && request.resource.data.summary is string
                    && request.resource.data.summary.size() <= 5000
                    && request.resource.data.priority in ['High', 'Medium', 'Low']
                    && request.resource.data.actionItems is list
                    && request.resource.data.deadlines is list
                    && request.resource.data.stakeholders is list
                    && request.resource.data.actionPlan is list
                    && request.resource.data.suggestedResponse is string;

      allow update: if request.auth != null && request.auth.uid == userId;
    }

    // Default deny all other paths
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🚀 Deployment Instructions

### Prerequisites
- Google Cloud Project with billing enabled
- Google Cloud SDK (`gcloud` CLI)
- Firebase CLI (`firebase-tools`)

### 1. Configure Secret Manager for Gemini API Key

```bash
# Enable required Google Cloud APIs
gcloud services enable secretmanager.googleapis.com run.googleapis.com cloudbuild.googleapis.com

# Create the secret in Google Cloud Secret Manager
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key \
    --data-file=- \
    --replication-policy="automatic"

# Grant Secret Accessor role to the Cloud Run default service account
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding gemini-api-key \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

### 2. Deploy Cloud Firestore Rules

```bash
# Deploy firestore.rules to Firebase
firebase deploy --only firestore:rules
```

### 3. Build & Deploy to Google Cloud Run

```bash
# Build container image with Cloud Build
gcloud builds submit --tag gcr.io/$(gcloud config get-value project)/dailyops-ai

# Deploy to Cloud Run with mounted secret
gcloud run deploy dailyops-ai \
    --image gcr.io/$(gcloud config get-value project)/dailyops-ai \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 3000 \
    --set-secrets="GEMINI_API_KEY=projects/$(gcloud config get-value project)/secrets/gemini-api-key:latest" \
    --set-env-vars="NODE_ENV=production"
```

---

## 🧪 Testing Instructions

### A. Local Development Testing
```bash
# 1. Install dependencies
npm install

# 2. Start full-stack development server
npm run dev

# 3. Open browser at http://localhost:3000
```

### B. Functional Verification Matrix
1. **Authentication Flow**:
   - Navigate to application.
   - Verify unauthenticated landing displays with Google Sign-In button.
   - Click "Sign in with Google". Complete OAuth flow.
   - Verify user avatar, email, and sign-out controls appear in the header.

2. **Automated Task Analysis**:
   - Click one of the preset buttons (e.g. *P0 Incident Escalation* or *Enterprise Client Contract Sync*).
   - Click **Automate My Task** (or press `⌘+Enter`).
   - Observe loader animation while Gemini 2.5 Flash processes the input.
   - Verify all sections render:
     - Priority Badge & Reasoning
     - Executive Summary
     - Interactive Action Items checklist
     - Deadlines & Milestones with urgency tags
     - Key Stakeholders & Departments
     - Phased Daily Action Plan (Step 1, 2, 3)
     - Suggested Professional Response with one-click copy

3. **Cloud Firestore Persistence**:
   - Click **Save Plan to Firestore**.
   - Verify button updates to "Saved in Firestore".
   - Scroll to the **Task History** section. Confirm the newly saved task appears in real time.

4. **Task History & Isolation**:
   - Search for a keyword from your task in the history search bar.
   - Filter by Priority tabs (All, High, Medium, Low).
   - Click any card in the history list to reload its data into the active view.
   - Click the **Delete** button, confirm deletion. Verify record is removed from Firestore.

5. **Security Negative Testing**:
   - Open browser DevTools Network tab.
   - Trigger an analysis. Inspect the request to `/api/analyze-task`.
   - Confirm that the `GEMINI_API_KEY` is **never** sent in request payload, query params, or headers. Only the `Authorization: Bearer <idToken>` is transmitted.
   - Attempt an unauthenticated curl to `/api/analyze-task`:
     ```bash
     curl -X POST http://localhost:3000/api/analyze-task \
       -H "Content-Type: application/json" \
       -d '{"input": "test request"}'
     ```
     Verify that the server rejects with `401 Unauthorized`.

---

## 📁 Project Structure

```
├── .env.example                     # Environment variables schema
├── .gitignore                       # Git ignored files & directories
├── firebase-applet-config.json      # Client Firebase project configuration
├── firestore.rules                  # Deployed user-isolated security rules
├── index.html                       # HTML5 application entry point
├── metadata.json                    # AI Studio applet metadata & capabilities
├── package.json                     # NPM dependencies & scripts (Express + Vite)
├── server.ts                        # Secure Express backend with Gemini & Admin SDK
├── tsconfig.json                    # TypeScript compiler configuration
├── vite.config.ts                   # Vite client build configuration
├── src/
│   ├── App.tsx                      # Main application view & auth orchestration
│   ├── index.css                    # Tailwind CSS imports & animations
│   ├── main.tsx                     # React 19 root bootstrap
│   ├── types.ts                     # Strict TypeScript interfaces & enums
│   ├── lib/
│   │   ├── api.ts                   # Client-to-server authenticated proxy helper
│   │   └── firebase.ts              # Firebase client SDK initialization & queries
│   └── components/
│       ├── Header.tsx               # Top navigation, branding & user status
│       ├── MorningPriorityDashboard.tsx # Top morning KPI metrics & action items
│       ├── TaskInput.tsx            # Input textarea, presets & automation triggers
│       ├── TaskAnalysisView.tsx     # Structured executive output & action plans
│       ├── TaskHistory.tsx          # Real-time user-isolated task records
│       └── SecurityArchitectureModal.tsx # Enterprise security compliance inspector
```
