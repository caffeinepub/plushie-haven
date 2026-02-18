# Specification

## Summary
**Goal:** Fix Community Board image uploads end-to-end so attached images are accepted in the moderation flow and displayed on approved posts.

**Planned changes:**
- Update backend types to add an optional `image : ?Storage.ExternalBlob` field on `ModeratedContent`, `Post`, and (if applicable) `PostEdit`, and expose it through the Candid interface.
- Extend backend moderation submission to accept an optional `image` parameter in `createModerationRequest` and persist it on queued moderation items.
- Extend backend moderation approval to copy `image` from the approved moderation request into the created `Post`.
- Update the frontend create-post mutation (`useCreatePost` in `frontend/src/hooks/useQueries.ts`) to send the selected image as an `ExternalBlob` to the updated `createModerationRequest`.
- Update the Community Board feed to render an inline image attachment (via `PostImageAttachment`) when a post includes an `image` field.

**User-visible outcome:** Users can attach an image when creating a Community Board post; after moderation approval, the image appears inline in the Community Board feed, while posts without images behave as before.
