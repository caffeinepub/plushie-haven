# Specification

## Summary
**Goal:** Update the downloadable Coloring Book PDF to include two newly uploaded coloring-page images while keeping the download URL unchanged.

**Planned changes:**
- Add `colorifyai-1770544927646.png` and `colorifyai-1770544979559.png` to the frontend static assets without renaming them.
- Update the static PDF served at `/assets/coloring-book.pdf` to include the two uploaded images as additional pages, formatted to print cleanly on letter/A4 with high-contrast black line art on a white background.
- Ensure the existing Home page download button continues to open `/assets/coloring-book.pdf` in a new tab.

**User-visible outcome:** Downloading the coloring book from the Home page (or visiting `/assets/coloring-book.pdf`) opens an updated PDF that includes two new coloring pages matching the uploaded line-art images.
