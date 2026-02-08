# Specification

## Summary
**Goal:** Build “Plushie Haven,” a responsive adult plushie lover lifestyle website with a cohesive cozy theme, seeded content, an 18+ entry gate, and an authenticated Community Board backed by a Motoko canister.

**Planned changes:**
- Create responsive site layout with header navigation and footer; add pages/sections: Home (hero + intro), Articles/Guides (list + detail), Gallery (image grid), Community Board (posts list + create post UI), Events (upcoming list), About, Contact (non-email form UI with copy-to-clipboard or mailto link).
- Implement a consistent “cozy / plush / lifestyle” visual theme that is adult-oriented and not blue/purple-dominant.
- Add an 18+ age confirmation gate shown on first visit, persisted locally; block access if declined.
- Seed Articles/Guides (≥6) and Events (≥5) with safe, non-explicit adult-oriented content.
- Integrate Internet Identity sign-in/out; allow browsing Community Board posts without auth, but require auth to create posts.
- Implement a single Motoko actor backend with canister methods to create and list posts (and get by id if needed), persisting posts with author principal, optional display name, title, body, and createdAt.
- Generate and include brand images under `frontend/public/assets/generated` and use them (logo in header, hero on home, subtle background pattern).

**User-visible outcome:** Visitors see an 18+ gate before entering; once inside they can browse themed lifestyle pages, read seeded articles and events, view a gallery, and browse Community Board posts; signed-in users can create posts that persist and appear in the list.
