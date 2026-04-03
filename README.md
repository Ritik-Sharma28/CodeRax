<div align="center">

<img src="./FrontEnd/public/coderax_logo.png" alt="CodeRax Logo" width="120" />

# ⚔️ CodeRax

### A full-stack programming platform built for serious DSA practice, live battles, and AI-powered learning.

[![Live Demo](https://img.shields.io/badge/🌐_Frontend-Vercel-black?style=for-the-badge)](https://coderax-eosin.vercel.app)
[![API](https://img.shields.io/badge/🚀_Backend-Render-46E3B7?style=for-the-badge)](https://coderax.onrender.com)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](LICENSE)

</div>

---

## 🔗 Live Links

| Service | URL |
|---|---|
| 🌐 **Frontend** (Vercel) | `https://coderax-eosin.vercel.app` |
| 🚀 **Backend API** (Render) | `https://coderax.onrender.com` |

---

## 📸 Overview

CodeRax is a full-stack programming platform. It goes beyond a simple problem list — offering a feature-rich workspace with a custom judging engine, real-time 1v1 coding battles, AI-powered revision tools, voice-driven mock interviews, and an interactive DSA visualizer.

---

## ✨ Features

### 🏟️ Problem Arena
- Curated DSA problems across Easy, Medium, and Hard difficulties
- Monaco-powered code editor with syntax highlighting
- Instant run & submission against visible and hidden test cases
- Solve history, daily challenge tracking, and difficulty breakdown stats

### ⚔️ DSA Arena — Live 1v1 Battles
- Real-time competitive coding battles via WebSockets
- ELO-based ranking system
- Queue-based matchmaking with cancel support
- Battle history and win-rate analytics on your profile

### 🧠 Revision Mentor (AI)
- AI-powered detection of weak topics based on your solve history
- Conversational revision — ask follow-ups, go deep on concepts (powered by Groq)
- Save AI-generated insights as persistent notes
- Spaced-repetition habits that adapt to your specific gaps

### 🎙️ Mock Interview (AI)
- Voice-driven interview simulation powered by Gemini AI
- Timed sessions matching real interview standards
- Post-interview performance review and communication feedback
- Graded transcripts saved to your profile

### 📐 DSA Visualizer
- Animated sorting algorithms (Bubble, Merge, Quick Sort, and more)
- Tree and graph traversal step-by-step animations
- Pause, step forward, and speed control at any point

### 🔐 Auth & Sessions
- **OTP Email Verification** — new accounts require a 6-digit code sent to email before activation
- **Google Sign-In (OAuth2)** — one-click login/register via Google; profile picture synced automatically
- **Hybrid accounts** — users who registered with email can later link Google, treated as a `hybrid` provider
- **Forgot Password via OTP** — password reset flow uses a time-limited email OTP, no magic links needed
- **OTP resend with cooldown** — users can resend the code after a configurable cooldown window
- **Attempt locking** — too many wrong OTP entries locks the session to prevent brute-force
- Secure JWT authentication stored in HTTP-only cookies
- Redis-backed token blacklisting for logout invalidation
- Redis-backed pending sessions for OTP state (signup & reset)
- Role-based access control (User / Admin)
- `verifiedUserMiddleware` — AI endpoints gate-kept behind email verification
- Rate limiting on auth and AI endpoints (per-IP and per-email)

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React + Vite | UI framework |
| Redux Toolkit | Global state management |
| Tailwind CSS | Styling |
| Monaco Editor | Code editor |
| Socket.io Client | Real-time battle communication |
| Axios | HTTP client |
| Google Identity Services | Google One-Tap / OAuth2 login button |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | Server & REST API |
| MongoDB + Mongoose | Primary database |
| Redis | Session management, token blacklisting & OTP state |
| JWT + Bcrypt | Authentication, password hashing & OTP hashing |
| Socket.io | Real-time WebSocket communication |
| Nodemailer + Gmail OAuth2 | Transactional OTP emails |
| google-auth-library | Server-side Google ID token verification |
| Groq API | AI chat & revision mentor |
| Gemini API | AI mock interview engine |
| Rate Limiter | Per-IP & per-email middleware for auth and AI endpoints |

---

## 📂 Project Structure

```
CodeRax/
├── FrontEnd/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── home/           # Landing page & feature showcase
│   │   │   ├── problem/        # Problem list & individual problem workspace
│   │   │   ├── battle/         # Battle lobby, arena, and results
│   │   │   ├── visualizer/     # DSA algorithm visualizer
│   │   │   ├── features/       # Revision Mentor & Mock Interview
│   │   │   ├── profile/        # User profile & stats
│   │   │   ├── admin/          # Admin problem creation panel
│   │   │   └── auth/           # Login (+ Google, Forgot Password) & Signup (+ OTP verify)
│   │   ├── components/         # Shared UI components
│   │   ├── services/           # Axios clients, Redux store, API helpers
│   │   ├── context/            # Theme context
│   │   └── utils/              # Feature catalog, visualizer algorithms
│   └── public/
│
└── BackEnd/
    └── src/
        ├── config/             # DB & Redis connection
        ├── controllers/        # Request handlers
        │   └── authControl.js  # register, login, Google OAuth, OTP verify/resend,
        │                       # forgot-password, reset OTP verify/resend, logout
        ├── interview/          # Gemini AI interview engine
        ├── judge/              # Code execution & judging (C++, Python)
        │   ├── codeGenerator/
        │   ├── inputBuilder/
        │   └── outputComparator/
        ├── judge1/             # Extended judge (C++, Python, Java)
        │   ├── codeGenerator/
        │   ├── inputBuilder/
        │   ├── outputComparator/
        │   └── utils/
        ├── middleware/
        │   ├── authRateLimitMiddleware.js   # Per-IP + per-email rate limiting for auth routes
        │   ├── verifiedUserMiddleware.js    # Blocks unverified users from AI features
        │   ├── userMiddleware.js
        │   ├── adminMiddleware.js
        │   └── rateLimitMiddleware.js
        ├── models/             # Mongoose schemas
        ├── routes/             # API route definitions
        ├── utils/
        │   ├── otpAuth.js      # OTP generation, hashing, Redis pending-session helpers
        │   ├── authMailer.js   # Nodemailer + Gmail OAuth2 transactional email sender
        │   ├── authPayload.js  # buildAuthReply, getAuthProvider, isUserVerified helpers
        │   ├── rateLimits.js   # Daily AI usage quota reset logic
        │   └── ...
        ├── workers/            # Matchmaker background worker
        ├── socketManager.js    # WebSocket event management
        └── server.js           # Entry point
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB instance
- Redis instance
- Piston API access (free, no key needed)
- Groq API key
- Gemini API key
- Google Cloud project with OAuth2 credentials (for Google Sign-In + Gmail mailer)

### 1. Clone the Repository
```bash
git clone https://github.com/Ritik-Sharma28/CodeRax
cd CodeRax
```

### 2. Backend Setup
```bash
cd BackEnd
npm install
```

Create a `.env` file inside `BackEnd/src/`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_CONNECT_KEY=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>

# Redis
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Code Execution
COMPILER_API=https://emkc.org/api/v2/piston/execute

# AI APIs
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key

# CORS
FRONTEND_URL=http://localhost:5173

# ── Google OAuth2 (Sign-In + Gmail mailer) ──────────────────────────────────
GOOGLE_CLIENT_ID=your_google_oauth2_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth2_client_secret
GOOGLE_REFRESH_TOKEN=your_gmail_oauth2_refresh_token
GOOGLE_SENDER_EMAIL=your_gmail_address@gmail.com
AUTH_FROM_EMAIL="CodeRax <your_gmail_address@gmail.com>"

# ── OTP Settings (all optional — defaults shown) ────────────────────────────
OTP_TTL_SECONDS=600               # OTP valid for 10 minutes
OTP_RESEND_COOLDOWN_SECONDS=60    # Cooldown before resend is allowed
OTP_MAX_ATTEMPTS=5                # Wrong attempts before session is locked

# ── Auth Rate Limiting (all optional — defaults shown) ──────────────────────
AUTH_RATE_LIMIT_WINDOW_SECONDS=300   # 5-minute sliding window
AUTH_RATE_LIMIT_PER_IP=3            # Max attempts per IP per window
AUTH_RATE_LIMIT_PER_EMAIL=3         # Max attempts per email per window
```

> **Setting up Google OAuth2 for Gmail (nodemailer)**
> 1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
> 2. Create an OAuth2 Client ID (Web application)
> 3. Use the [OAuth2 Playground](https://developers.google.com/oauthplayground) to generate a refresh token scoped to `https://mail.google.com/`
> 4. Paste `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, and `GOOGLE_SENDER_EMAIL` into your `.env`
>
> The same `GOOGLE_CLIENT_ID` is used to verify Google Sign-In tokens from the frontend.

```bash
npm start
```

### 3. Frontend Setup
```bash
cd FrontEnd
npm install
```

Create a `.env` file inside `FrontEnd/`:
```env
VITE_BACKEND_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_oauth2_client_id
```

```bash
npm run dev
```

---

## 🧪 API Reference

> Base URL (Local): `http://localhost:3000`  
> Base URL (Production): `https://coderax.onrender.com`  
> Authentication: JWT token stored in HTTP-only cookie (`token`)

---

### 🔐 Authentication — `/auth`

| Method | Endpoint | Auth Required | Rate Limited | Description |
|---|---|---|---|---|
| `POST` | `/auth/register` | ❌ | ✅ (IP) | Initiate registration — sends OTP to email |
| `POST` | `/auth/verify-otp` | ❌ | ✅ (IP + email) | Verify OTP to complete registration & log in |
| `POST` | `/auth/resend-otp` | ❌ | ✅ (IP) | Resend signup verification OTP |
| `POST` | `/auth/login` | ❌ | ❌ | Email/password login |
| `POST` | `/auth/google` | ❌ | ❌ | Google Sign-In (ID token from frontend) |
| `POST` | `/auth/forgot-password` | ❌ | ✅ (IP) | Request password reset OTP |
| `POST` | `/auth/verify-reset-otp` | ❌ | ✅ (IP + email) | Verify OTP and set new password |
| `POST` | `/auth/resend-reset-otp` | ❌ | ✅ (IP) | Resend password reset OTP |
| `POST` | `/auth/logout` | ✅ | ❌ | Invalidate session via Redis |
| `GET` | `/auth/check` | ✅ | ❌ | Verify current session & refresh user state |
| `POST` | `/auth/delete` | ✅ | ❌ | Delete user account and all submissions |
| `POST` | `/auth/adminRegister` | ✅ (Admin) | ❌ | Register a new admin account |

---

#### Registration & OTP Verification Flow

```
POST /auth/register
→ { verificationRequired: true, emailId, resendAvailableAt, expiresAt }

POST /auth/verify-otp
→ Sets session cookie, returns user object (logged in)
```

<details>
<summary><b>POST /auth/register — Request Body</b></summary>

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "emailId": "john@example.com",
  "password": "StrongPas$123"
}
```

**Success Response (200):**
```json
{
  "verificationRequired": true,
  "emailId": "john@example.com",
  "resendAvailableAt": 1712345678000,
  "expiresAt": 1712346278000,
  "message": "Verification code sent to your email."
}
```

**Error — account already exists (409):**
```json
{ "error": "account_exists", "message": "An account already exists for this email. Please log in instead." }
```

**Error — account linked to Google (409):**
```json
{ "error": "account_exists_google", "message": "This email is already registered with Google sign-in." }
```
</details>

<details>
<summary><b>POST /auth/verify-otp — Request Body</b></summary>

```json
{
  "emailId": "john@example.com",
  "otp": "482901"
}
```

**Success Response (200):** Sets `token` cookie and returns user object.

**Error responses:**
| `error` code | Meaning |
|---|---|
| `otp_expired` | Code has passed its 10-minute TTL |
| `otp_invalid` | Wrong code — `attemptsLeft` included in response |
| `otp_locked` | Max attempts exceeded — session must be restarted |
| `otp_missing` | No pending signup session found for this email |
</details>

<details>
<summary><b>POST /auth/resend-otp — Request Body</b></summary>

```json
{ "emailId": "john@example.com" }
```

Returns same shape as `/auth/register` success. Returns `otp_cooldown` (429) if called too soon.
</details>

---

#### Google Sign-In Flow

```
Frontend loads Google Identity Services script
→ User clicks "Continue with Google"
→ Google returns a credential (ID token)
→ POST /auth/google { credential: "<id_token>" }
→ Backend verifies token, creates/updates user, sets session cookie
```

<details>
<summary><b>POST /auth/google — Request Body</b></summary>

```json
{ "credential": "<google_id_token>" }
```

**Behaviour:**
- **New email** → creates account with `authProvider: "google"`, `verified: true`, profile picture synced
- **Existing email/password account** → links Google, sets `authProvider: "hybrid"`
- **Existing Google account** → updates `googleId`, syncs picture if missing, logs in

**Error responses:**
| `error` code | Meaning |
|---|---|
| `google_not_configured` | `GOOGLE_CLIENT_ID` env var is missing |
| `google_invalid` | Token failed verification or email not verified by Google |
| `google_login_failed` | Unexpected server error |
</details>

---

#### Forgot Password Flow

```
POST /auth/forgot-password  → sends reset OTP to email
POST /auth/verify-reset-otp → verifies OTP + sets new password
POST /auth/resend-reset-otp → resends reset OTP (same cooldown rules)
```

<details>
<summary><b>POST /auth/forgot-password — Request Body</b></summary>

```json
{ "emailId": "john@example.com" }
```

Always returns a generic success message (prevents email enumeration). If the account exists and has a password set, a reset OTP is emailed.

**Error — Google-only account (400):**
```json
{ "error": "google_signin_required", "message": "This account uses Google sign-in. Please continue with Google." }
```
</details>

<details>
<summary><b>POST /auth/verify-reset-otp — Request Body</b></summary>

```json
{
  "emailId": "john@example.com",
  "otp": "391042",
  "password": "NewStrongPas$456"
}
```

Same OTP error codes as signup verification apply. On success, password is updated and the reset session is cleared.
</details>

---

#### Login Flow

<details>
<summary><b>POST /auth/login — Request Body</b></summary>

```json
{
  "emailId": "john@example.com",
  "password": "StrongPas$123"
}
```

**Special case — unverified account (403):**  
If the user registered but never verified their email, login will re-trigger OTP sending and return:
```json
{
  "error": "verification_required",
  "message": "Verify your email to unlock AI features.",
  "emailId": "john@example.com",
  "resendAvailableAt": 1712345678000
}
```
The frontend redirects to the OTP verification screen automatically.
</details>

---

### 📚 Problems — `/problem`

| Method | Endpoint | Auth Required | Role | Description |
|---|---|---|---|---|
| `GET` | `/problem/getAllProblem` | ✅ | User | Fetch all problems |
| `GET` | `/problem/problemById/:id` | ✅ | User | Get a specific problem by ID |
| `POST` | `/problem/create` | ✅ | **Admin** | Create a new coding problem |
| `PUT` | `/problem/update/:id` | ✅ | **Admin** | Update an existing problem |
| `DELETE` | `/problem/delete/:id` | ✅ | **Admin** | Delete a problem |

<details>
<summary><b>POST /problem/create — Request Body</b></summary>

```json
{
  "title": "Two Sum",
  "description": "Given an array of integers nums and an integer target...",
  "difficulty": "easy",
  "tags": "array",
  "problemSignature": {
    "functionName": "twoSum",
    "returnType": "vector<int>",
    "args": [
      { "name": "nums", "type": "vector<int>" },
      { "name": "target", "type": "int" }
    ]
  },
  "visibleTestCases": [
    { "input": "[2,7,11,15]\n9", "output": "[0,1]", "explanation": "nums[0] + nums[1] == 9" }
  ],
  "hiddenTestCases": [
    { "input": "[3,2,4]\n6", "output": "[1,2]" }
  ],
  "referenceSolution": [
    { "language": "cpp", "completeCode": "..." }
  ]
}
```
</details>

---

### 🖥️ Submissions — `/submission`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/submission/run/:id` | ✅ | Dry run code against custom input |
| `POST` | `/submission/submit/:id` | ✅ | Submit code for judging vs all test cases |

<details>
<summary><b>POST /submission/submit/:id — Request Body</b></summary>

```json
{
  "code": "class Solution { ... }",
  "language": "cpp"
}
```

**Supported Languages:** `cpp` · `python` · `java`

**Possible Verdicts:** `Accepted` · `Wrong Answer` · `Time Limit Exceeded` · `Runtime Error` · `Compilation Error`
</details>

<details>
<summary><b>POST /submission/run/:id — Request Body</b></summary>

```json
{
  "code": "class Solution { ... }",
  "language": "python",
  "input": [
    { "input": "[2,7,11,15]\n9" }
  ]
}
```
</details>

---

### ⚔️ Matches — `/match`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/match/queue` | ✅ | Join matchmaking queue |
| `POST` | `/match/cancel-queue` | ✅ | Leave matchmaking queue |
| `POST` | `/match/create` | ✅ | Create a private match |
| `POST` | `/match/join` | ✅ | Join a private match by code |
| `GET` | `/match/:matchId` | ❌ | Get match details |
| `POST` | `/match/:matchId/submit-final` | ✅ | Submit final solution in a battle |
| `POST` | `/match/:matchId/finish` | ✅ | Finalize and close a match |

---

### 🤖 AI Features — `/ai`

> All AI endpoints also require the user to be **email-verified** (`verifiedUserMiddleware`). Unverified users receive a `403 verification_required` error.

| Method | Endpoint | Auth Required | Rate Limited | Description |
|---|---|---|---|---|
| `POST` | `/ai/chat` | ✅ | ✅ | Doubt solver — ask questions about a problem |
| `POST` | `/ai/memory` | ✅ | ❌ | Save a revision memory note |
| `POST` | `/ai/quick-note` | ✅ | ❌ | Save a quick concept note |
| `GET` | `/ai/memories` | ✅ | ❌ | Fetch all revision memories |
| `DELETE` | `/ai/memory/:id` | ✅ | ❌ | Delete a revision memory |
| `POST` | `/ai/revision-chat` | ✅ | ✅ | AI-guided revision chat session |
| `POST` | `/ai/mock-interview/token` | ✅ | ❌ | Generate live interview session token |
| `POST` | `/ai/mock-interview/grade` | ✅ | ✅ | Grade completed interview session |
| `POST` | `/ai/mock-interview/save` | ✅ | ❌ | Save interview session to profile |

---

### 👤 User Profile — `/profile`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/profile/me` | ✅ | Get current user's profile & stats |
| `GET` | `/profile/:userId` | ✅ | Get any user's public profile |

---

## 🏗️ Deployment

### Frontend → Vercel
1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set root directory to `FrontEnd`
3. Add environment variables:
   ```
   VITE_BACKEND_URL=https://your-render-url.onrender.com
   VITE_GOOGLE_CLIENT_ID=your_google_oauth2_client_id
   ```
4. Deploy

### Backend → Render
1. Connect your GitHub repo to [Render](https://render.com)
2. Set root directory to `BackEnd`
3. Build command: `npm install`
4. Start command: `node src/server.js`
5. Add all environment variables from the `.env` template above (including all Google OAuth2 and OTP variables)

> ⚠️ Render free tier spins down after inactivity. The first request after idle may take ~30 seconds.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is **proprietary and all rights reserved.**

You may **not** copy, use, modify, distribute, or build upon this code without explicit written permission from the author. See [LICENSE](LICENSE) for full terms.

---

<div align="center">

Built with ⚡ by Ritik Sharma

</div>
