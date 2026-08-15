# IT Certification Explorer & Pathway Visualizer

> An interactive, data-heavy reference platform and multi-paradigm pathway graph visualizer for IT certifications across Linux, Networking, Cybersecurity, Azure/Microsoft, Cloud, and AI/ML.

[![Tests](https://img.shields.io/badge/tests-21%20passing-success.svg)](#testing--verification)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black)](https://nextjs.org/)
[![React Flow](https://img.shields.io/badge/React%20Flow-12.4-ff0072)](https://reactflow.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748)](https://www.prisma.io/)

---

## Overview

Most certification roadmaps on the web are subjective, single-author tier lists filled with affiliate links, out-of-date exam pricing, and oversimplified linear arrows that ignore how prerequisites actually work.

**IT Certification Explorer** solves this with four core principles:

1. **Source-Grounded Fact Integrity**: Every voucher price, exam format, blueprint code, and prerequisite condition is tied to a primary source URL from official vendor documentation.
2. **Transparent Mathematical Scoring**: Reputation scores are computed in real time using a deterministic multi-factor formula (Market Value 30%, Hiring Demand 30%, Exam Rigor 20%, Community Sentiment 20%) with explicit data confidence indicators.
3. **True Recursive Prerequisite Logic**: Supports boolean `AND`/`OR` prerequisite groups, elective concentration paths (e.g. Cisco CCNP), and nested waiver hierarchies (e.g. CISSP experience + degree/credential waivers) rather than flattening relationships into misleading linear chains.
4. **Multi-Paradigm Visualizer**: Renders pathways across five synchronized view modes:
   - **Layered Ladder DAG** (React Flow bottom-to-top hierarchy: foundational certs at base, expert certs at top)
   - **Timeline / Duration View** (study duration pacing)
   - **Force-Directed Network** (D3 domain clustering)
   - **Radial Orbit View** (vendor drill-down hierarchy)
   - **Matrix Swimlane View** (tier-by-domain categorization)

---

## Tech Stack

* **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/)
* **Visualization**: [@xyflow/react](https://reactflow.dev/) (React Flow) with [Dagre](https://github.com/dagrejs/dagre) layout engine & [D3.js v7](https://d3js.org/)
* **Database & ORM**: [PostgreSQL 16](https://www.postgresql.org/), [Prisma ORM](https://www.prisma.io/)
* **Currency Forex**: Real-time USD to CAD conversion via official [Bank of Canada Valet API](https://www.bankofcanada.ca/valet/docs) with 24-hour cache TTL
* **Containerization**: [Docker](https://www.docker.com/) & Docker Compose
* **Testing**: [Vitest](https://vitest.dev/)

---

## Project Structure

```
.
├── src/
│   ├── app/                      # Next.js App Router routes
│   │   ├── page.tsx              # Unified catalog table & cross-vendor visualizer
│   │   ├── about/page.tsx        # Transparency methodology & scoring architecture
│   │   ├── vendors/[id]/         # Dedicated vendor portal & pathway pages
│   │   ├── certifications/[id]/  # Certification detail, provenance & waiver pages
│   │   └── api/                  # JSON API endpoints (/api/graph, /api/certifications)
│   ├── components/
│   │   ├── graph/                # Visualizer components (PathwayVisualizer, CustomCertNode)
│   │   └── common/               # UI tokens (VendorBadgeIcon)
│   ├── lib/                      # Core business logic
│   │   ├── graph-builder.ts      # Shared graph export & multi-tenant filter engine
│   │   ├── prerequisite-engine.ts# Recursive boolean prerequisite evaluation engine
│   │   ├── score-calculator.ts   # Multi-factor composite reputation calculator
│   │   ├── derived-cost.ts       # Voucher cost rollup & vendor CAD price overrides
│   │   └── currency.ts           # Bank of Canada Forex client
│   └── types/                    # Shared TypeScript interfaces
├── prisma/
│   ├── schema.prisma             # Normalized relational database schema
│   └── seed.ts                   # Verified seed script (54 flagship certs, 16 vendors)
├── scripts/
│   └── audit-verification.ts     # Automated quarterly data freshness & citation audit
├── tests/                        # Vitest test suites (prerequisites, scoring, graph, audit)
└── docs/                         # Specification & architecture documents
    ├── PROJECT_OVERVIEW.md       # Vision, target users, and non-goals
    ├── DATA_MODEL_SPEC.md        # Entity relational schema & formula specifications
    ├── VISUALIZATION_SPEC.md     # Multi-view visualizer & filter specifications
    └── RESEARCH_BRIEF.md         # Open research tracker & data provenance log
```

---

## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v20 or newer recommended)
* [Docker](https://www.docker.com/) & Docker Compose

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/StickwoodJr/it-cert-explorer.git
cd it-cert-explorer
npm install
```

### 2. Environment Configuration

Copy the example environment configuration:

```bash
cp .env.example .env
```

Default `.env` contents:
```ini
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/it_cert_explorer?schema=public"
NODE_ENV="development"
PORT=3000
```

### 3. Start PostgreSQL Database

```bash
docker compose up -d postgres
```

### 4. Apply Database Schema & Seed Data

```bash
# Push schema to database
npm run db:push

# Ingest all 54 verified flagship certifications & sources
npm run db:seed
```

### 5. Launch Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing & Verification

Run the full automated test suite:

```bash
npm test
```

Run the quarterly data freshness and primary source citation audit:

```bash
npm run audit:sources
```

Execute a clean production build:

```bash
npm run build
```

---

## Keyboard Shortcuts

When using the interactive visualizer:
* `1` — Switch to **Ladder DAG View**
* `2` — Switch to **Timeline / Duration View**
* `3` — Switch to **Force Network View**
* `4` — Switch to **Radial Orbit View**
* `5` — Switch to **Matrix Swimlane View**
* `f` — Toggle Multi-Facet Filter Sidebar
* `Esc` — Clear selected node & close drawer

---

## Documentation

Comprehensive design specifications and research briefs are maintained in the [`docs/`](docs/) directory:
* [`docs/PROJECT_OVERVIEW.md`](docs/PROJECT_OVERVIEW.md) — Product requirements, user personas, and design goals
* [`docs/DATA_MODEL_SPEC.md`](docs/DATA_MODEL_SPEC.md) — Detailed relational schema and prerequisite tree rules
* [`docs/VISUALIZATION_SPEC.md`](docs/VISUALIZATION_SPEC.md) — Visualizer interaction guidelines and view modes
* [`docs/RESEARCH_BRIEF.md`](docs/RESEARCH_BRIEF.md) — Ongoing audit notes and primary source tracking

---

## Nominative Fair Use & Legal Disclaimer

All certification names, acronyms, vendor names, exam codes, and trademarks referenced on this platform are the property of their respective owners. This project is an independent educational and technical reference platform operated under nominative fair use principles. It is not affiliated with, sponsored by, or endorsed by Cisco, CompTIA, Microsoft, AWS, Linux Foundation, LPI, Red Hat, ISC2, OffSec, GIAC/SANS, ISACA, EC-Council, Juniper, or Google Cloud.

---

## License

Distributed under the [MIT License](LICENSE).
