# Specification

## Summary
**Goal:** Add user profiles with a public opt-in directory and individual profile pages, including authenticated editing for profile owners.

**Planned changes:**
- Extend the backend user profile model to include optional avatar, display name, bio, links, plushie collection images, and a directory opt-in flag.
- Implement backend authorization so profiles are publicly viewable only when opted in; otherwise viewable only by the owner/admin; saving/updating requires authentication.
- Add backend methods to fetch the caller’s profile, fetch a profile by principal (with access rules), save/update the caller’s profile, and list opted-in directory profiles.
- Update typed frontend bindings and React Query hooks for directory listing, profile fetch (by principal and caller), and save; invalidate/refetch relevant queries after saves.
- Add a Profiles section in the frontend with a public directory page and individual profile detail pages, including clear empty/not-available states in English.
- Add an authenticated Edit Profile UI on the profile page for the owner to update avatar, text fields, links, plushie collection images, and directory opt-in/out (with previews and remove-before-save behavior for images).
- Add a “Profiles” link to existing site navigation without changing unrelated layout or immutable frontend paths.

**User-visible outcome:** Visitors can browse a Profiles directory of users who opted in and view their profile pages; signed-in users can edit their own profile (including images) and choose whether to appear in the public directory.
