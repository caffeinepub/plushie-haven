# Specification

## Summary
**Goal:** Let authenticated members upload gallery media (images/videos) with optional metadata and delete only their own items (or any item if admin), with UI kept in sync via React Query.

**Planned changes:**
- Backend: Add an authenticated method to create gallery media items (image/video) with optional title/description and persist the caller as the item’s author.
- Backend: Add/enforce delete permissions so only the item’s author (or an admin) can delete; return clear unauthorized/not-found errors.
- Frontend: Build a gallery page that lists media and provides an upload flow with file type/size validation and clear errors.
- Frontend: Show delete controls only for items the signed-in user can delete (own items or admin), including in both grid and lightbox, with confirmation + success/error feedback.
- Frontend/Backend integration: Use React Query for listing and for upload/delete mutations, including loading states, query invalidation/refetch, and graceful handling when the actor/auth isn’t ready.

**User-visible outcome:** Signed-in members can upload images/videos to the gallery with optional title/description, see the gallery update without a full reload, and delete their own uploads (admins can delete any), with clear confirmation and error messages.
