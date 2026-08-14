# Visualization Spec — Interactive Pathway Graph

## 1. Design Reference

The requesting user's inspiration is a dense technical reference poster (a "Network Communication Protocols Map" style diagram) that groups items into categorical bands (by OSI layer, by protocol family, e.g. TCP/IP vs. Novell vs. Microsoft vs. ISO) and draws explicit connecting lines showing relationships/dependencies between items, with clear "From X" / "To Y" labeling on edges. The certification graph should carry over: (a) strong categorical grouping (by domain and/or vendor, visually banded or clustered), (b) legible, labeled connective edges rather than an unlabeled hairball, and (c) enough density to feel comprehensive, while remaining navigable via interactivity that a static poster can't offer.

## 2. Required View Modes

1. **Layered Tree / Ladder View** (primary, build first) — top-to-bottom or left-to-right DAG per vendor, mirroring how vendors present their own official roadmaps (e.g., Cisco CCNA → CCNP → CCIE). Use React Flow for this.
2. **Cross-Vendor Force-Directed View** — all filtered certs as a connected graph, letting users see cross-vendor relationships and clustering by domain. Use D3-force, sharing the same node/edge JSON as the tree view.
3. **Radial/Domain Drill-Down View** — center node = domain, radiating out to vendors, then to individual certs; useful for "zoom into cybersecurity, then narrow to GRC" style exploration.
4. **Timeline/Duration View** — certs positioned along a horizontal axis by estimated study time to reach them from a chosen starting point, similar to CertLadder's date-range framing; this view answers "how long until I could realistically hold this cert" rather than pure prerequisite structure.

All four views must render from the same underlying graph export (see `DATA_MODEL_SPEC.md` §5) — do not maintain separate data structures per view.

## 3. Node Requirements

- Visual encoding: color or icon by domain, shape or border style by level (entry/associate/professional/expert), size optionally by rating score or popularity.
- Hover/click reveals a summary card: name, vendor, level, cost, one-line description, current rating score with sub-score breakdown, link to full detail page.
- Retired/being-replaced certs should be visually distinguished (e.g., dashed border, muted color) rather than hidden by default — let the user filter status but default to showing everything, since knowing a cert is being phased out is itself valuable information.

## 4. Edge Requirements

- Distinguish edge types visually: `required` (solid, bold), `recommended` (dashed), `alternative`/OR-group membership (dotted or grouped with a shared connector node/bracket).
- For AND-groups (e.g., CCNP core + concentration), consider a small "junction" indicator or grouping box rather than just multiple lines converging ambiguously.
- Edges should be interactive: hovering an edge highlights the connected nodes and shows the prerequisite rule in plain language (e.g., "Requires CCNP Core AND one concentration exam").

## 5. Filtering Requirements

Filters must be combinable (AND across filter types, e.g., domain=Networking AND vendor=Cisco AND level in [associate, professional]) and must persist across view-mode switches:

- Domain (multi-select: Linux, Networking, Cybersecurity, Microsoft/Windows/Azure, AI/ML)
- Vendor (multi-select)
- Level (multi-select: entry/associate/professional/expert/specialty)
- Cost ceiling (range slider)
- Job role preset (single-select, applies a pre-curated cert tag set as an additional filter)
- Status (toggle to include/exclude retired/being-replaced)
- Rating score threshold (range slider on overall_score)

Filtering should visually fade/remove non-matching nodes and their exclusive edges rather than reflowing the entire layout abruptly — preserve spatial memory where feasible, especially in the force-directed view.

## 6. Vendor Page Reuse Pattern

Each `/vendors/[vendor]` page embeds the same graph component pre-filtered to `vendor = X` with the vendor filter UI hidden/locked, so the vendor pathway diagram is never a separately maintained artifact — it's a filtered view of the same live data. This guarantees vendor pages never drift out of sync with the main dataset.

## 7. Performance Notes to Validate During Build

- Confirm React Flow and D3-force both remain responsive (no dropped frames on pan/zoom, filter updates apply in well under a second) at the target v1 scale (~40–60 nodes) before committing to the shared-schema, multi-renderer approach at full scale (~300–600 nodes) — see `RESEARCH_BRIEF.md` §6.
- If full-scale performance becomes a problem, plan a fallback (e.g., server-side filtering that reduces the node count sent to the client, rather than sending the full graph and filtering purely client-side).
