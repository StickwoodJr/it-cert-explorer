# AGENTS.md — Certification Explorer & Pathway Visualizer

> Place this file at the project root. Antigravity reads it automatically at the start of every session, before any conversation context. Treat this as the single source of truth for how agents should behave in this repo. Companion documents live in `docs/` — read them in the order listed in "Required Reading" before writing any code.

## 1. What This Project Is

A web application that (1) catalogs every significant IT certification across Linux, Microsoft/Windows/Azure, Networking, Cybersecurity, and AI/ML, (2) renders an interactive, filterable node-graph visualization of certification pathways (prerequisites, progression, alternatives) inspired by dense technical reference diagrams like OSI/protocol maps, and (3) provides per-vendor pages with their own pathway diagrams. It also computes a transparent, multi-factor "value/reputation" score per certification instead of a single subjective rating.

This is a **data-heavy, visualization-first** product. The hardest problems are (a) data modeling for messy real-world prerequisite logic (AND/OR/tiered), and (b) an interactive graph UI that supports multiple layout modes and live filtering without falling over at a few hundred nodes.

## 2. Required Reading (in order)

1. `docs/PROJECT_OVERVIEW.md` — vision, goals, non-goals, target users.
2. `docs/RESEARCH_BRIEF.md` — open questions and research tasks that must be resolved (or explicitly flagged as assumptions) before/during implementation. **Do not silently invent answers to items in this file — surface them to the user.**
3. `docs/DATA_MODEL_SPEC.md` — entity schema, prerequisite logic modeling, rating formula.
4. `docs/VISUALIZATION_SPEC.md` — graph UI requirements, layout modes, filter behavior.

## 3. Tech Stack (default assumptions — confirm with user before deviating)

- Frontend: React + Next.js (App Router), TypeScript.
- Graph visualization: React Flow for DAG/tree/ladder views; D3.js for force-directed and radial views, sharing one underlying JSON graph model.
- Backend: FastAPI (Python) or Node/Express — pick one and stay consistent; do not mix per-feature.
- Database: PostgreSQL (normalized relational schema per `docs/DATA_MODEL_SPEC.md`), accessed via an ORM (SQLAlchemy or Prisma depending on backend choice).
- Containerized with Docker; docker-compose for local dev (db + backend + frontend).
- No commitment yet to hosting/deployment target — flag this as an open decision, do not assume a cloud provider.

## 4. Working Rules

- **Research before code on ambiguous data questions.** If a certification's prerequisite structure, cost, or level is unclear or conflicting across sources, log it in `docs/RESEARCH_BRIEF.md` under "Unresolved" rather than guessing a value into the database.
- **Seed small, validate, then scale.** Build and validate the schema and graph rendering against ~40–60 flagship certs (see `docs/RESEARCH_BRIEF.md` §2) before attempting bulk data entry across hundreds of certifications.
- **Never fabricate cost, prerequisite, or rating data.** Every field in the cert database must trace to a cited source (vendor page, salary survey, job-postings dataset) recorded in a `sources` table/field — this is a hard requirement, not a nice-to-have, given the project's emphasis on being more trustworthy than existing single-author roadmap sites.
- **Rating score is a formula, not a field you set by hand.** Implement the weighted composite described in `docs/DATA_MODEL_SPEC.md` §4; never let an agent or contributor directly overwrite a computed score.
- **Model prerequisite logic explicitly.** Support AND groups, OR groups, and "recommended but not required" edges as distinct edge types — do not flatten these into a single "requires" relationship (this is the single most common data-modeling mistake to avoid here; see Cisco CCNP core+concentration structure as the canonical test case).
- **Ask before assuming scope boundaries.** "Every important certification" is undefined by default — confirm the inclusion bar (e.g., must have an official vendor exam, be currently active, appear in at least one salary/demand dataset) with the user before bulk-importing data; do not unilaterally decide scope.
- **Confirm before any destructive or bulk-write operation** on the database (bulk import, schema migration, deleting cert records) — propose a plan and wait for approval, consistent with Antigravity's plan → review → confirm workflow.
- **Attribution and legal care**: vendor logos and cert badge artwork may require permission; salary data from third-party reports (e.g., Skillsoft/Global Knowledge) is copyrighted — store summarized/derived values with a citation, never republish source tables verbatim.

## 5. Definition of Done for Any Feature Task

1. Implementation plan proposed and approved before edits (per Antigravity workflow).
2. Code changes plus tests where the codebase has a test suite; if none exists yet for the touched area, write one first.
3. Data changes include a source citation for every new/changed field.
4. Any assumption made due to missing research is logged in `docs/RESEARCH_BRIEF.md`, not left implicit in code comments only.
5. Walkthrough artifact summarizing what changed, which files, and how it was verified.
