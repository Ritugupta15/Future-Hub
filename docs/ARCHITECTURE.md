# FutureHub — Minimum Viable Product (MVP) Project Architecture

This document details the standardized full-stack MVP architecture for **FutureHub**. The project follows a decoupled, clean Monorepo layout with clear separation of concerns across the client, server, database, and documentation layers.

---

## 1. Directory Structure

```text
MINI-PROJECT/
├── client/                              # Modern Frontend Client (React 19 + TypeScript)
│   ├── public/                          # Static brand assets (favicons, logos)
│   ├── src/                             # Frontend source code
│   │   ├── api/                         # Centralized typed HTTP API client
│   │   ├── assets/                      # Application icons & imagery
│   │   ├── components/                  # Domain & layout components
│   │   │   └── ui/                      # Atomic design system components (Button, Card, Input, etc.)
│   │   ├── context/                     # Global state providers (AuthContext, UserDataContext, ToastContext)
│   │   ├── layouts/                     # Page layout wrappers (MainLayout, DashboardLayout, SmartPortal)
│   │   ├── pages/                       # Application view controllers (Dashboard, Assessment, Profile, etc.)
│   │   ├── styles/                      # Tailwind atomic CSS & design tokens
│   │   ├── types/                       # Shared frontend TypeScript interfaces
│   │   ├── App.tsx                      # Top-level route definition & navigation shell
│   │   └── main.tsx                     # Vite DOM bootstrap entrypoint
│   ├── index.html                       # Single-page application HTML entrypoint
│   ├── package.json                     # Frontend dependencies & build commands
│   ├── tsconfig.json                    # Frontend TypeScript strict compiler options
│   └── vite.config.ts                   # Vite HMR bundler configuration & /api reverse proxy
│
├── server/                              # Authoritative REST API Server (Node.js 24 + Express)
│   ├── src/                             # Backend source code
│   │   ├── database/                    # Native SQLite engine, schema definition, and seeding script
│   │   │   ├── db.ts                    # Resilient database connection provider
│   │   │   ├── schema.sql               # Relational SQL DDL (Users, Careers, Skills, Roadmaps)
│   │   │   └── seed.ts                  # 15-career benchmark knowledge base seeder
│   │   ├── middleware/                  # Security, rate limiting & Anti-IDOR authentication
│   │   │   └── auth.middleware.ts       # Cryptographic JWT bearer token claim verifier
│   │   ├── routes/                      # REST API endpoint definitions
│   │   │   ├── assessment.routes.ts     # Career assessment & recommendation endpoint
│   │   │   ├── auth.routes.ts           # Student registration & login endpoint
│   │   │   ├── career.routes.ts         # Career catalog & exploration endpoint
│   │   │   ├── profile.routes.ts        # 6-subresource student identity endpoint
│   │   │   ├── resume.routes.ts         # Secure resume upload & assisted extraction endpoint
│   │   │   ├── roadmap.routes.ts        # 5-stage milestone tracking endpoint
│   │   │   └── saved.routes.ts          # Student career bookmarking endpoint
│   │   ├── services/                    # Core business logic & algorithmic engines
│   │   │   ├── auth.service.ts          # Credential verification & JWT generation
│   │   │   ├── career.service.ts        # Career metadata & search operations
│   │   │   ├── recommendation.service.ts # Deterministic mathematical recommendation formula
│   │   │   ├── resume.service.ts        # In-memory PDF/DOCX stream extraction
│   │   │   └── user.service.ts          # Profile aggregation & completeness calculator
│   │   ├── types/                       # Backend TypeScript interfaces & request contracts
│   │   ├── app.ts                       # Express application composition & static client serving
│   │   └── server.ts                    # HTTP server listener bootstrap
│   ├── tests/                           # Automated Jest test suites (57 tests, 100% pass)
│   ├── uploads/                         # Secure, private disk storage (Anti-IDOR isolated)
│   │   └── resumes/                     # Student uploaded PDF/DOCX files
│   ├── futurehub.db                     # Canonical SQLite database file (WAL mode)
│   ├── .env                             # Local server environment variables
│   ├── .env.example                     # Environment variable template
│   ├── jest.config.js                   # Jest test runner configuration
│   ├── package.json                     # Backend dependencies & scripts
│   └── tsconfig.json                    # Backend TypeScript strict compiler options
│
├── docs/                                # Project documentation & presentation guides
│   ├── ARCHITECTURE.md                  # This architecture guide
│   └── presentation_summary.md          # Complete bilingual (English & Hinglish) viva defense guide
│
├── .env.example                         # Root environment variable template
├── .gitignore                           # Git ignore specification for production hygiene
├── package.json                         # Root orchestration scripts for full-stack dev/build/test
└── README.md                            # Complete project guide and setup instructions
```

---

## 2. Core Execution Commands

Run all commands from the project root (`MINI-PROJECT/`):

### Development Mode (Concurrent with HMR)
```powershell
# Run backend API server (:5000)
npm run dev:server

# Run frontend Vite dev server (:5173 with hot reload)
npm run dev:client
```

### Automated Testing
```powershell
# Run all 6 Jest test suites (57 tests)
npm test
```

### Production Build & Serve
```powershell
# Build both frontend bundle and backend TypeScript
npm run build

# Start the unified production server (serves API & React client on :5000)
npm start
```
