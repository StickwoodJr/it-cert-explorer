# Project Overview — IT Certification Explorer & Pathway Visualizer

## Problem Statement

People researching IT certifications across Linux, Microsoft/Windows/Azure, Networking, Cybersecurity, and AI/ML currently have to piece together information from dozens of vendor sites, forum threads, and static roadmap posters. No single tool combines: full cross-domain certification coverage, an interactive (not static-image) pathway visualization, and a transparent, source-backed value/reputation rating. Existing tools each solve one piece:

- **Paul Jerimy's Security Certification Roadmap** is a well-known, carefully tiered static image, but it's cybersecurity-only and not interactive.
- **ITCareerRoadmap.com** has broad coverage (hundreds of certs, dozens of vendors, 12 domains) with faceted search, but its visualization depth and cross-domain graph interactivity are limited.
- **CertLadder.com** offers a nice quiz-driven personalized path with time estimates, across a smaller set of ~10 vendors.
- Vendor-official roadmaps (CompTIA, Cisco, Microsoft Learn) are accurate for their own certs but never show how vendors relate to each other or compare in value.

## What We're Building

A single site with three integrated layers:

1. **Certification Database** — every notable cert in the five target domains, with normalized fields: domain(s), level, prerequisites (with AND/OR logic), cost, renewal/CE requirements, exam format, status (active/retired), and a computed value/reputation score.
2. **Interactive Pathway Visualizer** — a node-link graph (nodes = certs, edges = prerequisite/progression relationships) supporting multiple layout modes (layered tree/ladder, force-directed cross-vendor, radial domain drill-down, timeline-by-study-duration) and live filtering by domain, vendor, level, cost ceiling, and job role.
3. **Vendor Pages** — one page per certifying body with a scoped pathway diagram (reusing the same graph component, pre-filtered) plus a cert list and vendor-specific context.

## Visual Inspiration

The requesting user specifically likes the visual language of dense technical reference diagrams — e.g., a "Network Communication Protocols Map" style poster that groups items by category/layer and draws explicit connective relationships between them. The certification pathway graph should evoke that same feeling: clear categorical grouping (by domain/vendor/level) with legible connective edges, but interactive rather than a fixed static image.

## Goals

- Cover all five domains (Linux, Microsoft/Windows/Azure, Networking, Cybersecurity, AI/ML) in one unified graph, not siloed per-domain tools.
- Make the visualization genuinely interactive: pan/zoom, filter in/out by multiple facets simultaneously, switch layout/view type without losing filter state.
- Make the rating system transparent and reproducible: every score decomposes into disclosed sub-metrics with cited sources, not a single opaque number.
- Support vendor-specific and role-specific views as filtered slices of the same underlying data/graph, not separately maintained content.

## Non-Goals (initial scope)

- Not building a learning platform, course marketplace, or exam simulator — this is a reference/planning tool, not a study tool.
- Not attempting to cover every conceivable vendor cert in v1 — start with flagship certs per domain (see `RESEARCH_BRIEF.md` §2) and scale coverage deliberately.
- Not building user accounts/progress-tracking in the first version unless the user explicitly requests it later.
- Not claiming a single "best cert" ranking — the rating system is multi-factor and shows trade-offs, not a leaderboard.

## Target User

The requesting user's own profile is representative of the primary persona: a technical student/hobbyist working toward certifications across Linux, networking, cybersecurity, and AI, who wants to plan a multi-year certification path efficiently and avoid low-value certs. Secondary users: career-changers into IT, and IT professionals planning their next cert.

## Success Criteria for a v1

- All five domains represented with at least the flagship/most-recognized certs per major vendor.
- At least two working visualization layout modes with cross-filtering.
- At least one vendor page fully built out (pathway diagram + cert list) as a template for the rest.
- A documented, working rating formula applied consistently to the seeded cert set.
- Every data field traceable to a cited source.
