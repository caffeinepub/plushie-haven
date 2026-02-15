# Specification

## Summary
**Goal:** Fix profile directory/profile routing and editing behavior so profiles reliably load and can be edited, and add a teddy-themed storybook item to the Gallery viewer experience.

**Planned changes:**
- Update backend profile directory listing to include each profile owner’s Principal so the frontend can link correctly per entry.
- Update the Profiles directory UI to route each card to `/profiles/$principal` using the entry’s Principal (remove index/non-principal fallbacks and avoid reusing the viewer’s principal for all cards).
- Update Profile page behavior so visiting `/profiles/$principal?edit=true` for the signed-in user automatically opens the Edit Profile panel, and closing the editor returns to normal view and clears the edit state.
- Improve Profile page data loading so the signed-in user can always view their own existing profile even if it is not public, while keeping current privacy behavior when viewing other users.
- Add a new teddy-themed storybook item into the mixed Gallery feed; make it readable in the gallery lightbox/viewer with story text bundled in the app.

**User-visible outcome:** Profiles in the directory open the correct person’s profile, signed-in users can reliably view and edit their own profiles (including via `?edit=true`), and the Gallery includes a new teddy storybook entry that opens and can be read in the viewer.
