# Specification

## Summary
**Goal:** Let authenticated users upload both images and videos to the Gallery and view them together in a single mixed media feed.

**Planned changes:**
- Add backend storage and listing for user-uploaded gallery items (image/video), including stable IDs, created timestamps, and blob references usable by the frontend.
- Add an authenticated backend method for creating gallery items by uploading an image or video file via the existing blob storage mixin; block anonymous uploads.
- Update the /gallery UI to provide an upload entry point for signed-in users (and a sign-in prompt for anonymous users), validate image/video files using existing utilities, and show validation errors.
- Display uploaded items mixed with existing gallery content in one grid feed, with favorites and search filtering continuing to work across the combined list (and favorites persisting without ID collisions).
- Extend the lightbox/viewer to support videos (with standard controls, no autoplay by default) alongside images, with accessible controls and keyboard navigation across mixed media.

**User-visible outcome:** Signed-in users can upload images or videos to the Gallery and see them appear in the same grid alongside existing items without a full refresh; users can open items in a lightbox that supports both image viewing and video playback with keyboard navigation and accessible controls.
