# Specification

## Summary
**Goal:** Add on-canister, AI-assisted moderation for Community Board post creation to block illegal content, route borderline cases to manual review, and provide an admin review queue.

**Planned changes:**
- Add backend moderation logic (local heuristics/rules only) that evaluates Community Board post title/body and attached video metadata and returns: allow, block, or manual-review.
- Enforce moderation policy on post creation: block underage content and copyright indicators; route borderline hate-speech cases to manual review so they are not published to the public feed until approved.
- Add backend admin-only APIs to list pending moderation items and approve (publish) or reject (discard) them, with authorization errors for non-admin callers.
- Add an admin-only Community Board UI section to view pending items and approve/reject them.
- Update frontend error normalization and Community Board UI messaging to show clear English messages for moderation outcomes (blocked for violating guidelines; pending manual review) without exposing internal error details.

**User-visible outcome:** When creating a Community Board post, content that violates guidelines is blocked with a clear message, borderline cases can be submitted for manual review, and admins can review pending posts and approve or reject them from an admin-only queue.
