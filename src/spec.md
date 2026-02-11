# Specification

## Summary
**Goal:** Auto-embed supported video links (YouTube and Vimeo) anywhere user-generated text is linkified, while keeping all other URLs as normal external links.

**Planned changes:**
- Extend the existing URL parsing/rendering used for Community Board posts and comments to detect YouTube/Vimeo URLs and render a responsive embedded player for those links.
- Keep non-video URLs rendering exactly as they do today (clickable external links opening in a new tab).
- Apply the same video-embed behavior consistently anywhere the app uses `LinkifiedText` (including CommunityBoardPage post title/body and PostComments comment content).
- Ensure embeds use a strict provider allowlist (YouTube/Vimeo only) and safe token-based rendering (no arbitrary iframe embedding).

**User-visible outcome:** When users paste a YouTube or Vimeo link in a post title, post body, or comment, it displays an in-page video player; other links remain standard clickable external links.
