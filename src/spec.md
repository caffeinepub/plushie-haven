# Specification

## Summary
**Goal:** Add a dedicated on-device, scripted “Plushie Assistant” chat experience to Plushie Pal.

**Planned changes:**
- Add a new “Plushie Assistant” page/route (e.g., `/assistant`) registered in the TanStack Router route tree and linked from the main navigation.
- Build a chat UI on the assistant page (message list, text input, send button) with Enter-to-send and English-only user-facing strings.
- Implement scripted, on-device conversation logic supporting: plushie facts/care Q&A, plushie recommendations (asking at least 2 preference questions), short plushie story generation (~5+ sentences, optionally personalized), and friendly plushie-themed small talk/personality.
- Add quick-action prompt chips/buttons for the main intents (e.g., care tips, recommend a plushie, tell a story).
- Add basic chat UX/state handling: prevent empty submissions with an inline/toast message, persist chat history locally across reloads, provide a “Clear chat” button with confirmation, and ensure long messages wrap with a scrollable transcript that stays scrolled to the latest message.
- Ensure the feature makes no external AI/network calls and requires no backend changes.

**User-visible outcome:** Users can open a new “Plushie Assistant” page from navigation, chat with a cozy plushie-themed scripted assistant for care tips, recommendations, and short stories, and keep/clear their chat history on the device.
