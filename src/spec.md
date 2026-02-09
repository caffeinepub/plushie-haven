# Specification

## Summary
**Goal:** Allow a signed-in user to claim one-time admin status (if not already claimed) and use that status to delete other users’ posts.

**Planned changes:**
- Backend: add admin state with a query `isCallerAdmin : async Bool` and a one-time `claimAdmin : async ()` method with clear error behavior when an admin already exists.
- Backend: ensure `deletePost` authorization continues to permit admins to delete any post while non-admin users can delete only their own posts.
- Frontend: update `frontend/src/components/AuthControls.tsx` to call the backend one-time `claimAdmin` method, then refresh cached `['isAdmin']` status and show clear English success/error toasts (including a “still connecting” message if the actor isn’t ready).
- Frontend: regenerate/update backend bindings/types so frontend calls to `actor.isCallerAdmin()` and the admin-claim method type-check and build successfully.

**User-visible outcome:** A user can click “Claim Admin” to become the canister’s admin (only if no admin was set yet); once admin, they can delete any user’s posts, with clear success/error messages and controls updating without a page reload.
