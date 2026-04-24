# Workspace Notes (v2 only)

**Patch ID:** PATCH_01

A per-workspace scratchpad accessible directly from the v2 workspace sidebar, persisted locally without any database involvement.

## Behavior

- A collapsible notes panel sits at the bottom of the v2 `WorkspaceSidebar`, below the active tab content (Files / Changes / Review).
- When collapsed, a "Notes" button with a sticky-note icon appears at the very bottom of the sidebar. Clicking it opens the notes panel.
- When open, the notes panel has a header row (with the same icon and label) that collapses it when clicked. The panel is resizable via a drag handle above it.
- The panel contains a plain textarea. Text typed there is auto-saved after a short debounce (500ms). Switching away and back, or closing and reopening the app, preserves the content.
- Notes are scoped to the workspace: each workspace has its own independent note. Switching workspaces shows that workspace's note.
- Blank notes are not persisted — clearing a note removes it from storage.
- v1 workspaces do not have this panel.

## Storage

Note content is stored in `~/.superset/workspace-notes.json` as a JSON object keyed by workspace ID, accessed through the `notes` tRPC router (`apps/desktop/src/lib/trpc/routers/notes.ts`). This is a local file; it is never synced or sent to any server.

Panel UI preferences (`notesPanelOpen`, `notesPanelSize`) live on the v2 user-preferences row alongside `rightSidebarOpen` / `rightSidebarWidth` and are managed via `useV2UserPreferences`.

## Panel Sizing

- Default size: 30% of the sidebar height.
- Minimum: 10%, maximum: 70%.
- The user's last-used size is remembered across sessions.
