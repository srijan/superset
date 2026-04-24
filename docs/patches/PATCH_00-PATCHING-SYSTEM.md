# Fork Patch System

**Patch ID:** PATCH_00

This repository is a personal fork of the upstream Superset desktop app. Local customizations are maintained as a small, numbered set of patches that sit on top of upstream `main` and rebase forward as upstream evolves.

## Conventions

- Each patch has a unique ID: `PATCH_00`, `PATCH_01`, etc.
- `PATCH_00` is always this meta-patch — it introduces the patching system itself and is the first commit in the fork.
- Each subsequent patch corresponds to exactly one git commit.
- Commit messages start with the patch ID: `PATCH_NN: <conventional-commit subject>`.
- Each patch has a spec document at `docs/patches/PATCH_NN-<NAME>.md` describing its behavior and intent. The spec is committed as part of the patch it documents.

## Spec Documents

Specs describe *what* a patch does and *why*, not the exact code changes. They serve as the authoritative reference when a patch must be reimplemented after a rebase conflict with upstream.

## Updating (rebasing against upstream)

Use the `/update-superset-desktop` skill (`.agents/commands/update-superset-desktop.md`). It:

1. Fetches upstream, shows the changelog, and asks for confirmation.
2. Rebases the fork commits onto `upstream/main`, resolving any conflicts autonomously using the patch specs as the source of truth.
3. Verifies lint cleanliness on each commit.
4. Builds the desktop app and installs it to `~/Applications`.

## Current Patches

| ID | Description | Spec |
|----|-------------|------|
| PATCH_00 | This patching system | `docs/patches/PATCH_00-PATCHING-SYSTEM.md` |
| PATCH_01 | Workspace notes panel | `docs/patches/PATCH_01-WORKSPACE_NOTES.md` |
| PATCH_02 | Fish-compatible prompt launch | `docs/patches/PATCH_02-FISH_PROMPT_LAUNCH.md` |
| PATCH_03 | Emacs IDE integration | `docs/patches/PATCH_03-EMACS_IDE_INTEGRATION.md` |
