# Specification

## Summary
**Goal:** Add functional user profiles (directory, view, and owner edit) using Internet Identity, including profile interactions (follow/like) and navigation entry points.

**Planned changes:**
- Add TanStack Router routes for a profiles directory page (`/profiles`) and an individual profile page by principal (`/profiles/$principal`).
- Replace the “Profiles Currently Unavailable” placeholder with a working Profiles Directory page that lists public profiles from the backend and links to each profile.
- Implement a Profile page UI that fetches by principal and displays avatar (or fallback), display name, bio, links, and a plushie image grid, plus follower/following counts and profile like count; enable Like/Unlike and Follow/Unfollow for authenticated users and show a sign-in prompt otherwise.
- Implement an owner-only Edit Profile experience for the signed-in user, prefilled from `getCallerUserProfile`, allowing editing of display name, bio, avatar image, links, plushie images, and public directory opt-in; save via `saveCallerUserProfile` with English success/error feedback and refresh relevant queries.
- Add missing profile editor components (AvatarUploader, PlushieImagesEditor, EditProfilePanel) with image validation, local previews, ExternalBlob conversion, and preview URL cleanup.
- Expose navigation entry points so users can reach the profiles directory and their own profile/edit view easily.

**User-visible outcome:** Users can browse a public profiles directory, view individual profiles by principal, and (when signed in) like/follow other profiles; signed-in users can edit and publish their own profile details, including avatar, links, and plushie images, with easy navigation to profiles.
