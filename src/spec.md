# Specification

## Summary
**Goal:** Fix the public profile creation flow so the “Create My Public Profile” entry point works, the editor opens directly when requested, and users are redirected to their new profile after saving.

**Planned changes:**
- Update the “Create My Public Profile” button in the empty profiles directory state to navigate authenticated users to `/profiles/<callerPrincipal>?edit=true`; keep sign-in CTA for unauthenticated users.
- Adjust profile page routing/render logic so visiting `/profiles/<callerPrincipal>?edit=true` with no existing profile shows the EditProfilePanel (creation form) immediately, skipping the intermediate empty state.
- After successfully saving a newly created profile, redirect to `/profiles/<callerPrincipal>` (non-edit mode) and show the saved profile content without requiring a manual refresh.

**User-visible outcome:** Clicking “Create My Public Profile” reliably opens the profile creation form for signed-in users, and after saving, the user is taken to their view-mode profile page with the newly created profile visible.
