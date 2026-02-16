# Specification

## Summary
**Goal:** Enable deletion of individual uploaded gallery media items with proper authorization, and expose safe delete controls in the gallery grid and lightbox.

**Planned changes:**
- Add a backend canister method to delete a single uploaded gallery media item by a stable id, enforcing that only the item’s author or an admin can delete it (with auth and not-found errors).
- Update the backend gallery media model so uploaded items have stable ids returned by `listGalleryMediaItems`, with a conditional migration to keep existing stored items working after upgrade.
- Add a React Query mutation hook to delete a gallery media item via the backend actor and invalidate/refetch `['galleryMediaItems']` on success (including consistent `ACTOR_CONNECTING` handling).
- Update the Gallery UI to show delete controls only for deletable uploaded items (never for static/storybook items), require confirmation, and show English errors on failure.
- Add delete controls to the lightbox for deletable uploaded items, ensuring the lightbox closes or moves to a valid adjacent item after deletion while keeping keyboard navigation working.

**User-visible outcome:** Signed-in users can delete their own uploaded gallery items (and admins can delete any uploaded item) from the gallery grid or lightbox with confirmation; deleted items disappear from the gallery without a full page refresh.
