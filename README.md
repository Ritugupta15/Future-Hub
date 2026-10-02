# FutureHub – Production Career Guidance & Student Profile Platform

FutureHub is an academic-tech career discovery platform engineered for Computer Science and Information Technology students. It pairs an intentional, restrained design system (`#F8FAFC` canvas, `#0F172A` dark navy, `#2563EB` blue) with a 100% deterministic, explainable mathematical recommendation engine, structured 5-stage progression roadmaps, practical portfolio projects, a comprehensive 6-subresource student profile identity center, and a secure CV / Resume upload & assisted extraction system.

---

## 1. Architectural Highlights

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS with atomic design tokens, Lucide icons, accessible keyboard navigation (`:focus-visible`), double-bezel hardware styling, and academic `@media print` reports.
- **Backend**: Node.js 24, TypeScript, Express HTTP layer, Helmet security headers, CORS protection, Multer secure file streaming.
- **Database**: Native Node.js 24 SQLite engine (`node:sqlite`) with `PRAGMA foreign_keys = ON;` and WAL journal mode. Zero external native driver compilation issues.
- **Authentication & Multi-Tenant Security**: Stateless JSON Web Tokens (JWT) with bcrypt-hashed passwords. Strict server-side Anti-IDOR / Anti-BOLA enforcement via verified JWT claims (`req.user.id`).
- **CV / Resume Assisted Extraction**: Real text stream parsing for `.pdf` and `.docx` using `pdf-parse` and `mammoth`. Deterministic catalog matching with an **Assisted Review Modal** (Accept, Edit, Ignore) that prohibits silent profile mutations.
- **Single Source of Truth**: Unified `UserDataContext` synchronizing profiles, assessments, bookmarks, roadmap milestone progress, and active CVs across all application pages without state loss.
- **Automated Verification**: 57 / 57 automated Jest tests passing across 6 test suites (100% pass rate) and end-to-end API verification.

---

## 2. Technology Stack & Verified Versions

| Layer | Technology | Version | Purpose |
| --- | --- | --- | --- |
| **Frontend Framework** | React | `^19.0.0` | Declarative UI rendering & portal architecture |
| **Language** | TypeScript | `~5.7.2` | Strict compile-time type safety across client & server |
| **Build Tool** | Vite | `^6.2.0` | Ultra-fast HMR bundling and static asset compilation |
| **Routing** | React Router DOM | `^7.2.0` | Client-side routing, protected routes, and smart portal layout |
| **Icons** | Lucide React | `^1.16.0` | Consistent, accessible iconography |
| **Backend Runtime** | Node.js | `>=24.0.0` | Asynchronous JavaScript/TypeScript execution environment |
| **HTTP Framework** | Express | `^4.21.2` | REST API routing and middleware composition |
| **Database** | Native SQLite (`node:sqlite`) | Built-in | Lightweight, zero-dependency ACID SQL storage |
| **Password Security** | bcryptjs | `^3.0.2` | Multi-round salted password hashing |
| **Tokens** | jsonwebtoken | `^9.0.2` | Signed bearer tokens for authenticated sessions |
| **File Parsing** | `pdf-parse` / `mammoth` | `^2.4.5` / `^1.11.0` | Real text parsing from PDF and DOCX documents |
| **Testing** | Jest & ts-jest | `^29.7.0` | Automated unit, integration, and security test suites |

---

## 3. Directory Structure (Production MVP Format)

```text
Future-Hub/
├── client/                               # Modern React 19 Frontend (Vite + TypeScript)
│   ├── public/                           # Static brand assets (favicon, logo)
│   ├── src/                              # Client source code
│   │   ├── api/                          # Centralized Axios/fetch HTTP client
│   │   ├── assets/                       # Images, illustrations, and logos
│   │   ├── components/                   # Reusable UI & business widgets
│   │   │   └── ui/                       # Atomic primitives (Button, Card, Badge, Input, etc.)
│   │   ├── context/                      # Global state (AuthContext, UserDataContext, ToastContext)
│   │   ├── layouts/                      # Layout wrappers (MainLayout, DashboardLayout, SmartPortal)
│   │   ├── pages/                        # Route pages (Dashboard, Assessment, Profile, Explorer, etc.)
│   │   ├── styles/                       # Tailwind CSS & design tokens
│   │   ├── types/                        # Client-side TypeScript contracts
│   │   ├── App.tsx                       # Root routing and application composition
│   │   ├── main.tsx                      # React DOM mount entrypoint
│   │   └── vite-env.d.ts                 # Vite environment typings
│   ├── index.html                        # SPA HTML root entrypoint
│   ├── package.json                      # Client dependencies & scripts
│   ├── tsconfig.json                     # Client TypeScript configuration
│   └── vite.config.ts                    # Vite build & reverse-proxy configuration
│
├── server/                               # Scalable Express Backend (Node.js 24 + TypeScript)
│   ├── src/                              # Server source code
│   │   ├── database/                     # Database access, schema & seeder
│   │   │   ├── db.ts                     # Native SQLite connection provider
│   │   │   ├── schema.sql                # Relational SQL DDL (Users, Careers, Skills, etc.)
│   │   │   └── seed.ts                   # 15-career benchmark catalog seeder
│   │   ├── middleware/                   # Express middlewares (Auth, Anti-IDOR security)
│   │   │   └── auth.middleware.ts        # Cryptographic JWT bearer token validator
│   │   ├── routes/                       # REST API route controllers
│   │   │   ├── assessment.routes.ts      # Assessment & recommendation endpoints
│   │   │   ├── auth.routes.ts            # Registration & login endpoints
│   │   │   ├── career.routes.ts          # Career exploration catalog endpoints
│   │   │   ├── profile.routes.ts         # 6-subresource student profile endpoints
│   │   │   ├── resume.routes.ts          # Resume upload & parsing endpoints
│   │   │   ├── roadmap.routes.ts         # Milestone progression endpoints
│   │   │   └── saved.routes.ts           # Saved career bookmark endpoints
│   │   ├── services/                     # Business logic layer
│   │   │   ├── auth.service.ts           # Password hashing & JWT issuance
│   │   │   ├── career.service.ts         # Career retrieval & filtering
│   │   │   ├── recommendation.service.ts # Mathematical recommendation engine
│   │   │   ├── resume.service.ts         # PDF/DOCX text parsing & skill extraction
│   │   │   └── user.service.ts           # User profiles & completeness calculation
│   │   ├── types/                        # Backend TypeScript contracts
│   │   ├── app.ts                        # Express application configuration & SPA static host
│   │   └── server.ts                     # HTTP listener entrypoint
│   ├── tests/                            # Automated Jest test suites (57 tests)
│   ├── uploads/resumes/                  # Private secure storage for uploaded resumes
│   ├── futurehub.db                      # SQLite database file
│   ├── jest.config.js                    # Jest test runner configuration
│   ├── package.json                      # Server dependencies & scripts
│   └── tsconfig.json                     # Server TypeScript configuration
│
├── docs/                                 # Project Documentation & Academic Artifacts
│   ├── ARCHITECTURE.md                   # Full architectural specification
│   └── presentation_summary.md           # Bilingual viva defense guide (English + Hinglish)
│
├── .env.example                          # Environment variable template
├── .gitignore                            # Production gitignore rules
├── .node-version                         # Node.js LTS version specification (22.13.0)
├── package.json                          # Monorepo root workspace orchestration
├── README.md                             # Comprehensive project guide
└── render.yaml                           # Infrastructure as Code (Render Web Service)
```

---

## 4. Deterministic Recommendation Algorithm

FutureHub replaces arbitrary black-box quiz models with a transparent, explainable scoring engine:

$$\text{Final Match Score} = (S \times 0.45) + (I \times 0.30) + (E \times 0.15) + (X \times 0.10) + D$$

Where:
- **Technical Skills ($S$, 45%)**: Compares the student's verified skills against career requirements, weighting core skills higher than secondary tools.
- **Domain Interests ($I$, 30%)**: Calculates affinity between student interests and career domains using deterministic set alignment.
- **Education Compatibility ($E$, 15%)**: Evaluates degree level (B.Sc, BCA, B.Tech, MCA) against prerequisite qualification expectations.
- **Practical Experience ($X$, 10%)**: Quantifies internship and project experience against career entry expectations.
- **Dream Career Alignment ($D$)**: Applies a documented subtle affinity preference ($+4$ points) without ever fabricating an unearned 100% match.

---

## 5. Security & Multi-Tenant Isolation (Anti-IDOR)

1. **Authoritative Server Sessions**: User identification is derived exclusively from cryptographically verified JSON Web Tokens (`req.user.id`). Client-provided `user_id` parameters in request bodies or query strings are ignored.
2. **Private File Storage**: Resumes are uploaded to private disk storage (`server/uploads/resumes/`) using randomized UUID filenames. Uploads are strictly outside public web roots.
3. **Safe Download & Deletion**: Every file operation verifies ownership via `WHERE id = ? AND user_id = ?`. Cross-user access returns immediate 404/403 responses.
4. **Assisted Review Guarantee**: Extracted CV details are treated as proposals. No information is written to the database until the student explicitly reviews and commits it.

---

## 6. Installation & Production Setup

### Prerequisites
- **Node.js**: v24.x or higher
- **npm**: v10.x or higher

### 1. Install Dependencies
```bash
# In the repository root
npm install

# Install server and client dependencies
cd server && npm install
cd ../client && npm install
cd ..
```

### 2. Build the Application
```bash
# Build the React frontend bundle
cd client && npm run build
cd ..

# Build the TypeScript backend
cd server && npm run build
cd ..
```

### 3. Run Automated Tests
```bash
# Run all 5 backend test suites (44 tests)
cd server && npm test
```

### 4. Start the Production Server
```bash
# Start the production server (serves API on :5000 and static client bundle)
node server/dist/server.js
```
Open your browser and navigate to `http://localhost:5000`.

---

## 7. Verification Summary

- **Unit & Security Tests**: 44 / 44 tests passing across 5 Jest test suites.
- **End-to-End API Checks**: 12 / 12 automated verification points passing on live server.
- **TypeScript & Vite Builds**: 0 compilation errors, 0 lint warnings.

---

## 8. REST API Specification

### Authentication & Profile
- `POST /api/auth/register` — Student account registration with initial degree & experience.
- `POST /api/auth/login` — Authenticates credentials and returns JWT bearer token.
- `GET /api/auth/me` — Returns the authenticated student's profile from token.
- `GET /api/profile/full` — Aggregates basic identity, sub-resources, and 12-criterion completeness score.
- `PUT /api/profile` — Updates basic personal and academic identity fields.
- `POST /api/profile/skills` — Adds a technical skill with proficiency level and category.
- `DELETE /api/profile/skills/:id` — Removes a skill and updates completeness.
- `POST /api/profile/education` — Adds formal degree or academic background record.
- `POST /api/profile/experience` — Adds internship or practical work experience record.
- `POST /api/profile/projects` — Adds a portfolio project with GitHub repo link.
- `POST /api/profile/certifications` — Adds credential verification details.
- `PUT /api/profile/goals` — Updates target career and short/long-term milestones.
- `PUT /api/profile/links` — Updates GitHub, LinkedIn, and portfolio URLs.

### CV & Resume Management (Anti-IDOR)
- `POST /api/resume/upload` — Uploads PDF/DOCX (max 5MB) into private disk storage with UUID name.
- `GET /api/resume/active` — Returns active resume metadata and assisted extraction draft.
- `GET /api/resume/:id/download` — Securely streams file to authenticated owner only.
- `POST /api/resume/:id/review` — Merges student-confirmed items into `profile_*` tables.
- `DELETE /api/resume/:id` — Removes file from private disk and database.

### Catalog & Assessments
- `GET /api/careers` — Retrieves all 15 curated technology careers with category filtering.
- `GET /api/careers/:id` — Full details for a single career, including 5-stage roadmap and projects.
- `POST /api/assessment` — Evaluates student profile and returns deterministic recommendations.
- `GET /api/assessment/latest` — Retrieves the latest assessment evaluation for the student.
- `GET /api/history` — Returns immutable snapshots of previous student assessments.
- `POST /api/saved-careers` — Bookmarks a career (idempotent `UNIQUE(user_id, career_id)`).
- `DELETE /api/saved-careers/:careerId` — Removes a career from bookmarks.
- `PUT /api/roadmap/progress` — Persists milestone completion state per user.

---

## 9. Academic Viva Demonstration Guide

When presenting FutureHub to examiners:
1. **Explain the Architecture**:
   - React 19 Single Page Application communicating via REST API with a Node.js 24 Express backend.
   - Native `node:sqlite` database engine with strict relational foreign keys and indices.
   - Authentication secured by bcrypt password hashing and JWT bearer authorization.
2. **Demonstrate Determinism & Math-Backed Matching**:
   - Run the assessment with sample student inputs.
   - Show how the overall compatibility percentage is mathematically broken down into the 4 distinct pillars (Skills 45%, Interests 30%, Education 15%, Experience 10%).
   - Re-run with the same inputs to prove identical match scores, rankings, and reasons without random variance.
3. **Demonstrate Multi-Tenant Isolation (Anti-IDOR)**:
   - Log in as Student A and upload a CV; show extracted skills in the Assisted Review Modal.
   - Show that Student B cannot access, download, review, or delete Student A's CV or saved careers.
4. **Demonstrate State Continuity & Print Reporting**:
   - Toggle a roadmap milestone; navigate across Dashboard, Explorer, and Saved Careers to show synchronized state.
   - Click **Print Career Report** on Dashboard or **Print Pathway** on Career Detail to demonstrate academic print stylesheet formatting.
