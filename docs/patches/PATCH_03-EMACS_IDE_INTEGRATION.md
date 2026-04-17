# Emacs IDE Integration

**Patch ID:** PATCH_03

Emacs is supported as an "Open In IDE" option alongside VS Code, Cursor, Zed, and others.

## Behavior

- "Emacs" appears in the Open In IDE dropdown in the workspace view.
- Clicking it opens the workspace path in an existing Emacs daemon via `emacsclient -n <path>`.
- The `-n` flag means the call returns immediately (no-wait), so the Superset UI is not blocked while Emacs opens the file.
- If no Emacs daemon is running, `emacsclient` will fail with an error — this is expected behavior for users who haven't started a daemon. The option is intended for users already running an Emacs server (e.g. via `emacs --daemon` or a systemd unit).

## Platform

The `emacsclient -n` invocation is identical on macOS and Linux. Unlike most other IDE integrations (which use macOS app bundles or platform-specific CLI names), Emacs uses the same command on all platforms and does not go through the normal platform-split launch logic.
