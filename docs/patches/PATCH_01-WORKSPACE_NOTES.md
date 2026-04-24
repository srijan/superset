# Workspace Notes

**Patch ID:** PATCH_01

A per-workspace scratchpad accessible directly from the right sidebar, persisted locally without any database involvement.

## Behavior

- A collapsible notes panel sits at the bottom of the right sidebar, below the Changes/Files panels.
- When collapsed, a "Notes" button with a sticky-note icon appears at the very bottom of the sidebar. Clicking it opens the notes panel.
- When open, the notes panel has a header row (with the same icon and label) that collapses it when clicked. The panel is resizable via a drag handle above it.
- The panel contains a plain textarea. Text typed there is auto-saved after a short debounce (500ms). Switching away and back, or closing and reopening the app, preserves the content.
- Notes are scoped to the workspace: each workspace has its own independent note. Switching workspaces shows that workspace's note.
- Blank notes are not persisted — clearing a note removes it from storage.

## Storage

Notes are stored in `~/.superset/workspace-notes.json` as a JSON object keyed by workspace ID. This is a local file; it is never synced or sent to any server.

## Panel Sizing

- Default size: 30% of the sidebar height.
- Minimum: 10%, maximum: 70%.
- The user's last-used size is remembered across sessions.
