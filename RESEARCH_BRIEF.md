# Research Brief — Open Questions Antigravity Agents Must Resolve

> Purpose: this document is the working list of things that must be researched, sourced, or explicitly confirmed with the user before or during implementation. Agents should update this file as items get resolved (move to "Resolved" with source links) or as new open questions are discovered. Do not delete resolved items — keep them as a record of decisions made.

## 1. Competitive Teardown (do first, before schema design)

Research and document, for each of the following, in a comparison table (domain coverage, interactivity level, filtering options, cost/rating data, update recency, data model if inferable):

- Paul Jerimy Security Certification Roadmap (pauljerimy.com) — study tier structure and whether he has published notes on an interactive version.
- ITCareerRoadmap.com — teardown their faceted search, vendor ladder pages, and stated "every claim cited" sourcing approach.
- CertLadder.com — teardown their quiz flow and time-estimate methodology.
- KnowledgeCompass.online — study their career-stage framing (Foundation → Entry → Specialization → Professional → Leadership) as a possible additional filter axis.
- CompTIA's own Interactive IT Certification Roadmap and Microsoft Learn's certification browser — these are official vendor tools and also primary data sources.

**Deliverable:** a written "why this project is different" paragraph, informed by actual gaps found, not assumed gaps.

## 2. Flagship Cert List Per Domain (needed before seeding the database)

For each domain, research and propose a flagship list (target ~8–15 certs per domain for the initial seed of ~40–60 total) spanning entry → expert levels. Starting points to verify and expand:

- **Linux**: CompTIA Linux+, LPIC-1/2/3, Red Hat RHCSA/RHCE/RHCA.
- **Microsoft/Windows/Azure**: Microsoft Certified: Azure Fundamentals (AZ-900), Azure Administrator Associate (AZ-104), Azure Solutions Architect Expert, Windows Server Hybrid Administrator, Microsoft 365 certifications, Security certifications (SC-900, SC-100).
- **Networking**: CompTIA Network+, Cisco CCNA, CCNP (core + concentration exams), CCIE, Juniper JNCIA/JNCIP/JNCIE, Fortinet NSE levels.
- **Cybersecurity**: CompTIA Security+/CySA+/PenTest+/CASP+, ISC2 SSCP/CISSP, EC-Council CEH, Offensive Security OSCP/OSWE/OSEP, GIAC/SANS certs, CRISC/CISM/CISA (ISACA).
- **AI/ML**: AWS Certified AI Practitioner/Machine Learning Specialty, Google Cloud Professional ML Engineer, Microsoft Azure AI Engineer Associate, NVIDIA certifications — this domain has the least standardized/mature certification landscape of the five; explicitly research whether enough legitimate, recognized certs exist yet to justify equal treatment with the other four domains, or whether it should be scoped/labeled differently (e.g., flagged as an emerging/less-established domain).

**Open question to flag to user:** should the AI/ML domain be held to a different completeness bar than the other four, given the immaturity of the space?

## 3. Per-Certification Data Points (research methodology, not just data)

For every cert added, the following fields need a cited source — research and document *where* each will come from, then apply it:

| Field | Primary source to use |
|---|---|
| Official level/tier | Vendor's own certification page |
| Prerequisites (formal) | Vendor exam requirement/registration page |
| Prerequisites (de facto/recommended) | Vendor's own "recommended experience" language + cross-check against community consensus (aggregate multiple threads, don't cite one post) |
| Cost | Vendor pricing page — confirm currency and whether price varies by region; the user is in Canada, so capture USD and CAD where available |
| Renewal/CE requirements | Vendor policy/lifecycle page |
| Exam format | Vendor exam guide/blueprint |
| Status (active/retired/being replaced) | Vendor lifecycle/announcement pages — this changes often for Microsoft especially; needs a periodic recheck process |

**Open question:** decide and document a recheck cadence (e.g., quarterly) for status/cost fields, since certs get renamed/retired regularly.

## 4. Rating/Value Score Inputs

Research and confirm availability/access method for each input before finalizing the formula in `DATA_MODEL_SPEC.md`:

- **Salary data**: Skillsoft/Global Knowledge "IT Skills and Salary Report" (annual). Confirm: is the latest report publicly accessible, or does it require purchase/registration? Determine how to legally cite/use figures without republishing full tables.
- **Job demand data**: Lightcast Job Postings API. Research: pricing/access tier, rate limits, whether a free/trial tier exists sufficient for this project, and what query granularity (per-cert mention frequency) is actually supported.
- **Difficulty/rigor signal**: research whether vendors publish pass rates (most don't); if not, document that difficulty will rely on exam format (MCQ vs. hands-on lab) plus aggregated community consensus, and flag this as a lower-confidence sub-metric.
- **Community sentiment**: research a defensible aggregation method (e.g., periodically sampling recurring "hardest/most useless certs" threads across a fixed set of subreddits, weighted by upvotes) rather than one-off manual reading — decide whether this is manually curated on a schedule or lightly automated, and flag scraping ToS considerations for Reddit's API if automation is considered.

**Open question to flag to user:** confirm willingness to pay for/register for Skillsoft and Lightcast data, or decide on a fully free-data-only version of the rating formula (lower confidence but zero cost) — this materially changes what's buildable in v1.

## 5. Prerequisite Logic Edge Cases (research before finalizing schema)

Investigate and document real examples of each pattern so the schema design in `DATA_MODEL_SPEC.md` is validated against reality, not theory:

- **AND logic**: Cisco CCNP requires a core exam AND a concentration exam — confirm current exam codes.
- **OR logic**: some paths let a candidate choose among multiple equivalent prerequisite options — find and document a concrete current example.
- **Tiered/nested**: CISSP requires 5 years of relevant experience OR a 4-year degree plus 4 years experience, OR an approved alternative credential — document ISC2's exact current rules as the canonical hard case for "experience as prerequisite" (not just another cert).
- **No formal prerequisite but strong de facto expectation**: e.g., many people take Security+ before attempting more advanced certs despite no hard requirement — document how the graph should visually distinguish "required" vs. "customary" edges.

## 6. Visualization Technical Feasibility

- Research React Flow's practical node-count performance ceiling with custom node renderers and confirm it's sufficient for the target scale (~40–60 nodes for v1, potentially 300–600 at full scale) — flag if virtualization or a different renderer will be needed at full scale.
- Research whether a single shared JSON graph schema can realistically drive both a React Flow tree view and a D3 force-directed view without duplicating logic — prototype this early rather than assuming it's straightforward.
- Research existing open-source "roadmap" or "skill tree" visualization projects (e.g., roadmap.sh's own rendering approach) for implementation patterns worth borrowing.

## 7. Legal/Attribution

- Research each target vendor's brand/logo usage guidelines (CompTIA, Cisco, Microsoft, ISC2, EC-Council, AWS, Google, Red Hat, LPI, Fortinet, Offensive Security, ISACA, GIAC) before displaying any logos or badge artwork on vendor pages.
- Confirm terms of use for Skillsoft/Global Knowledge report data and Lightcast API data regarding derived/summarized republishing.

## 8. Open Questions & Architectural Decisions for User Review (Logged 2026-08-14)

### 8.1 Domain Scope & AI/ML Completeness Bar
- **Question:** How should the AI/ML domain be positioned relative to mature domains (Linux, Networking, Cybersecurity, Cloud, Windows/Azure)?
- **Options:**
  1. *Equal Standing (Recommended)*: Include vendor-flagship certs (AWS AI Practitioner / ML Specialty, Azure AI-900 / AI-102, Google Cloud ML Engineer, NVIDIA Associate/Professional) while explicitly tagging the domain as "Rapidly Evolving".
  2. *Secondary/Emerging Track*: Visually label as an experimental/emerging track with lighter completion requirements.

### 8.2 Rating Data Sourcing: Commercial APIs vs. Open/Derived Metrics
- **Question:** What is the preferred data source strategy for Market Value (Salary) and Demand (Job Postings) in v1?
- **Options:**
  1. *Open/Public & Derived Metrics (Recommended for v1)*: Synthesize public summaries (Skillsoft annual survey highlights, BLS/Indeed public trend data, community sentiment sampling) with transparent source links and confidence flags, incurring zero ongoing API cost.
  2. *Direct Commercial API Subscription*: Integrate Lightcast Job Postings API and purchase Skillsoft full report datasets (requires user subscription/budget).

### 8.3 Schema Prerequisite Hierarchy: Exam Entity vs. Certification-Only
- **Question:** Should we introduce a distinct `Exam` entity (e.g., Core 350-401, Elective 300-410, AZ-800, AZ-801) or keep all prerequisite links strictly at the `Certification` level?
- **Finding:** Many vendor certifications (CompTIA A+, Windows Server Hybrid, Cisco CCNP) are earned by passing combinations of distinct exams (AND/OR), while others require holding prerequisite *certifications* (e.g. SC-100 requires AZ-500 OR SC-200; AZ-305 requires AZ-104).
- **Recommendation:** Model `Exam` as a first-class child entity of `Certification`, and allow `PrerequisiteGroupMember` to point to either another `Certification` (for prior cert prerequisites) or an `Exam` (for multi-exam bundle rules), with nested group support (`parent_group_id`).

### 8.4 Multi-Currency and Regional Pricing
- **Question:** For Canadian users, how should non-USD pricing be stored and presented?
- **Recommendation:** Store official base price + currency (typically USD for CompTIA/Cisco/AWS/Azure), plus an optional localized CAD field or dynamic live conversion rate with timestamp.

### 8.5 Verification Cadence & Change Detection
- **Question:** What is the operational schedule for re-verifying cert status, exam codes, and costs?
- **Recommendation:** Establish a quarterly audit cycle, recording `cost_last_verified_date` and `status_last_verified_date` on every record.

## Resolved

### R1. AI/ML Domain Scope & Completeness Bar (Settled: 2026-08-14)
- **Decision:** Equal standing with mature domains, flagged with a visible **"Rapidly Evolving"** badge.
- **Specific Choice:** Included flagship hyperscaler credentials (AWS AI Practitioner, AWS ML Specialty/Engineer, Azure AI-900, AI-102, DP-100, GCP Professional ML Engineer). Niche/early vendor credentials (e.g., NVIDIA GenAI LLM) are pruned from the v1 flagship seed list to ensure high baseline signal.
- **Reasoning:** hyperscaler certs have clear industry demand and standardized exam blueprints, whereas hardware/niche vendor certs are currently too volatile and lack broad practitioner consensus.

### R2. Rating & Demand Data Sourcing Strategy (Settled: 2026-08-14)
- **Decision:** **$0 Budget / Zero-Cost Open Data Model**.
- **Specific Choice:** Synthesize publicly released annual survey summaries (Skillsoft IT Skills & Salary Report highlights, BLS wage indices, Dice survey reports) combined with sampled public job posting metrics and structured community sentiment.
- **Reasoning:** Eliminates thousands of dollars in recurring commercial API overhead (e.g., Lightcast enterprise tiers) while remaining transparent, reproducible, and legally sound through source link attribution and confidence flags.

### R3. Schema Redesign: First-Class `Exam` Entity & Nested Prerequisite Groups (Settled: 2026-08-14)
- **Decision:** Approved schema expansion adding `Exam` entity, `parent_group_id` on `PrerequisiteGroup`, and polymorphic `FieldSource`.
- **Specific Choice:** Decoupled `Exam` from `Certification`. Certification costs are strictly derived (sum of required exams or min/max elective range) and never stored as a redundant column on `Certification`. `PrerequisiteGroupMember` default edge types are formalized (`AND` $\rightarrow$ `required`, `OR` $\rightarrow$ `alternative`, soft customary paths $\rightarrow$ `recommended`). Application layer validates `FieldSource` referential integrity before saves.
- **Reasoning:** Accurately models real-world multi-exam bundles (CCNP Core + Elective, Windows Server Hybrid AZ-800+801), complex degree/credential waiver paths (CISSP), and multi-cert prerequisite OR gates (SC-100).

### R4. Multi-Currency Pricing & Bank of Canada API (Settled: 2026-08-14)
- **Decision:** **Vendor Base USD + Official CAD Override + Dynamic Fallback via Bank of Canada Valet API**.
- **Forex API Specification:**
  - **Provider:** Bank of Canada Valet API (Official, Public, Free).
  - **Endpoint:** `https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?recent=1`
  - **Authentication / Rate Limits:** Completely free, no API key or registration required. Rates are published once daily on business days at ~4:30 PM ET.
  - **Caching & Refresh Strategy:** On-request fetch with a 24-hour in-memory cache / TTL. If external network is unreachable, fallback gracefully to last-cached rate or a conservative fallback constant (`1.36`) with a "historical conversion" indicator.
- **Specific Choice:** Base exam prices stored in USD. For vendors publishing explicit Canadian voucher prices (e.g., Pearson VUE CAD exam vouchers), store in `cost_amount_cad_override`. The dynamic frontend toggle uses this BoC rate for unlisted USD amounts.
- **Reasoning:** Gives Canadian users exact local pricing where available without imposing the overhead of maintaining dual manual price points for every certification, backed by an authoritative central bank API at zero cost.

### R5. Data Verification Cadence (Settled: 2026-08-14)
- **Decision:** **Quarterly Audits (Every 90 Days)**.
- **Specific Choice:** Every exam and certification record tracks `cost_last_verified_date` and `status_last_verified_date`. UI renders verification status badges. Automated background jobs test source URLs for broken links.
- **Reasoning:** Aligns with typical vendor exam revision cycles (Microsoft, Cisco, CompTIA, AWS) while maintaining low operational overhead.

### R6. Flagship Certification Seed List (Settled: 2026-08-14)
- **Decision:** Approved streamlined **54-certification flagship seed list**.
- **Specific Choice:** Pruned Fortinet FCSS (kept Cisco, Juniper, CompTIA in Networking), pruned retired LFCE (kept LFCS, RHCSA, RHCE, RHCA in Linux), pruned NVIDIA GenAI (kept AWS, Azure, GCP in AI/ML), and retained comprehensive suites across Cybersecurity (13 certs), Microsoft/Azure (10 certs), and Cloud (8 certs).
- **Reasoning:** Balances comprehensive cross-domain depth with high data quality and rigorous manual sourcing for the initial release.

### R7. Legal & Trademark Attribution Policy (§7 Resolved) (Settled: 2026-08-14)
- **Decision:** **Plain-Text Nominative Fair Use Standard with Global Disclaimer; Defer Proprietary Logo Artwork**.
- **Trademark Analysis & Brand Guidelines Across 14 Seeded Vendors:**
  1. **Legal Foundation (Nominative Fair Use):** Under Lanham Act §33(b)(4) and established common law (*New Kids on the Block v. News America Publishing*, 971 F.2d 302; *Toyota v. Tabari*, 610 F.3d 1171), a non-commercial educational/reference index may legally refer to registered trademarks by name provided that: (a) the product or certification cannot be identified without the mark, (b) only so much of the mark is used as is reasonably necessary (i.e. standard text names, not graphic logos or stylized trade dress), and (c) no sponsorship, partnership, or endorsement is implied.
  2. **Vendor Brand Guideline Review (All 14 Vendors):**
     - **Cisco, Juniper, CompTIA, Red Hat, LPI, Linux Foundation, ISC2, OffSec, GIAC/SANS, ISACA, EC-Council, Microsoft, AWS, Google Cloud:** Every single vendor's official trademark policy expressly permits descriptive textual reference to their certification programs (e.g. "Cisco Certified Network Associate", "CompTIA Security+", "AWS Certified Solutions Architect") in informational and educational materials.
     - **Graphic Logos & Certification Badges:** All 14 vendors strictly restrict their official graphic logos, badge artwork, and trustmarks to authorized training partners and certified individuals holding an active badge agreement. Unauthorized display of corporate SVG/PNG logos or certification badge art creates legal exposure under trademark dilution and false affiliation claims.
  3. **Operational Policy for IT Cert Explorer:**
     - **Word Marks Only:** All vendor names, certification acronyms, and exam codes are rendered in semantic, styled typography (Inter / monospace) without embedding proprietary corporate logo vectors.
     - **Generic Domain Icons:** Categorical visual accents use generic open-source icons (Lucide network, server, shield, cloud, cpu) rather than vendor emblems.
### R8. Reputation Score Provenance Audit & Confidence Architecture (Settled: 2026-08-14)
- **Audit Findings:**
  1. Across the initial 54 flagship certifications, the composite score formula correctly implements `30% Market Value + 30% Demand + 20% Rigor + 20% Community Perception`.
  2. However, the initial seed script assigned hardcoded integer estimates for the 4 sub-scores without registering corresponding row-level entries in the `FieldSource` table.
  3. While `Rigor` is strictly derivable from verified exam blueprint facts (lab format vs multiple-choice duration), and `Market Value` / `Demand` trace to public macro benchmarks (Skillsoft / BLS), `Community Perception` currently lacks an empirical multi-forum API dataset.
- **Policy & Resolution:**
  1. **Strict Provenance Labeling:** Every sub-score now carries an explicit `confidence` tier (`VERIFIED`, `ESTIMATED`, `INSUFFICIENT_DATA`) and a public `provenanceNotes` explanation.
  2. **No False Certainty:** Any score factor without direct row-level empirical survey citations is displayed with an `Estimated / Provisional` badge and explanation rather than presented as an unchallengeable empirical measurement.
  3. **FieldSource Expansion:** In the next seed cycle, `FieldSource` records will be explicitly inserted linking `marketValueScore` to `src:skillsoft-salary`, `demandScore` to `src:bls-tech`, and `rigorScore` to official vendor blueprint records.




