# Specification

## Summary
**Goal:** Remove the Coloring page feature completely from the frontend.

**Planned changes:**
- Remove the `/coloring` route from `frontend/src/App.tsx`, including deleting the `ColoringPage` import, the `coloringRoute` definition, and its entry in the route tree.
- Remove the “Coloring” navigation link from `navLinks` in `frontend/src/components/Nav.tsx` so it no longer appears in desktop or mobile navigation.
- Delete `frontend/src/pages/ColoringPage.tsx` and ensure no remaining imports or references exist.
- Delete Coloring-related static assets (the coloring PNG and any associated coloring PDFs/assets) and remove any remaining UI text/links/references to “Coloring” or `/coloring`.

**User-visible outcome:** The app no longer shows any Coloring option in navigation, and the `/coloring` page/feature is no longer accessible or referenced anywhere in the UI.
