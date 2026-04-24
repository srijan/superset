---
description: Show upstream changelog, confirm, rebase, build the desktop app, and install to ~/Applications
allowed-tools: Bash, AskUserQuestion, Read, Edit
---

Fetch upstream changes, show the changelog, ask for confirmation, rebase, build the desktop app, and copy it to ~/Applications.

## Fork Features Reference

This fork carries three custom features on top of upstream. Read the corresponding spec before reimplementing any of them after a conflict:

- **PATCH_01 — Workspace Notes**: `docs/patches/PATCH_01-WORKSPACE_NOTES.md`
- **PATCH_02 — Fish-compatible prompt launch**: `docs/patches/PATCH_02-FISH_PROMPT_LAUNCH.md`
- **PATCH_03 — Emacs IDE integration**: `docs/patches/PATCH_03-EMACS_IDE_INTEGRATION.md`

## Steps

### 1. Fetch upstream and show changelog

```bash
git fetch upstream
git log HEAD..upstream/main --oneline
```

If there are no new commits, tell the user and stop — do not proceed.

### 2. Ask for confirmation

Use AskUserQuestion to ask:
> "Rebase against upstream and rebuild the desktop app? (y/n)"

If the user says no, stop.

If the command is being run in an environment where `AskUserQuestion` is not exposed but shell escalation prompts are available, use the required `git rebase upstream/main` approval prompt as the confirmation gate with the exact same question. Do not proceed to the rebase without an explicit user approval path.

### 3. Rebase

```bash
git rebase upstream/main
```

If the rebase has conflicts, resolve them autonomously:

1. Find conflicted files: `git diff --name-only --diff-filter=U`
2. For each conflicted file, read the full conflict — understand what upstream changed vs. what your commit changed, then write the correct merged result that preserves both intentions.
3. Stage the resolved file: `git add <file>`
4. Continue: `git rebase --continue`

Repeat until the rebase completes. Do not ask the user about conflicts — reason through them and resolve. If a conflict is complex (e.g. upstream restructured the surrounding code significantly), don't just mechanically merge conflict markers — understand the intent of both sides and reimplement the feature correctly in the new upstream shape.

If `git rebase --continue` fails because the configured editor cannot open (for example `emacsclient: could not get terminal name`), continue non-interactively with:

```bash
GIT_EDITOR=true git rebase --continue
```

This reuses the existing commit message after staged conflict resolutions.

### 4. Verify each commit is still lint-clean

Rebase can silently invalidate lint on the user's commits without producing a conflict. Common case: upstream adds a new sibling file that sorts between items the user's commit already added (e.g. a new `model-providers` router slotting between `menu` and `notes`), so the user's import order becomes stale. Another case: upstream bumps Biome and changes a formatting rule. CI then fails on a commit that rebased cleanly.

Run:

```bash
bun run lint
```

If clean, proceed to step 5.

If errors, fix each commit with its own fixes (do not pile all fixes into one tail commit — each commit must be individually lint-clean so `main` stays green after push):

1. For each failing file, find the commit that introduced it or last touched it:

```bash
git log upstream/main..HEAD --oneline -- <file>
```

2. If all errors trace to one commit, rebase with `edit` on that commit. Example for the oldest commit:

```bash
GIT_SEQUENCE_EDITOR="sed -i '' '1s/^pick/edit/'" git rebase -i upstream/main
```

(Adjust the `1s` line-number selector for a different commit.)

3. When rebase stops, fix only that commit's files, then amend and continue:

```bash
bunx @biomejs/biome check --write --unsafe <files>
git add <files>
git commit --amend --no-edit
git rebase --continue
```

4. If errors span multiple commits, repeat — one `edit` stop per commit.

5. Re-run `bun run lint` to confirm clean before proceeding.

Do NOT skip this step. A successful `git rebase upstream/main` does not imply each commit passes lint; the failure is silent until CI runs on the fork.

If Bun fails with `bun is unable to write files to tempdir: PermissionDenied`, rerun the same command with the environment's shell escalation/approval flow. This is a sandbox permission issue, not a lint failure.

### 5. Build the desktop app

From the repo root:

```bash
bun run --cwd apps/desktop build -- --mac dir
```

This runs the full prebuild (clean, generate icons, compile, copy native modules, validate) then packages a macOS `.app` directory.

If the build fails during `electron-vite build` with a dependency that is present in `bun.lock` or a workspace `package.json` but cannot be resolved (for example `Rollup failed to resolve import "@mastra/core/agent"`), refresh Bun's workspace install layout, then rebuild:

```bash
bun install
bun run --cwd apps/desktop build -- --mac dir
```

This can happen after rebasing dependency or package export changes when the existing Bun isolated linker state is stale. Do not add fork tarball overrides or custom Mastra patch steps to work around this; the fork uses published upstream `mastracode` and `@mastra/*` packages.

Expected build warnings that do not require action:

- `Module level directives cause errors when bundled, "use client" ... was ignored`
- `superset-font://... didn't resolve at build time`
- CSS optimizer warnings about `::highlight(...)`
- electron-builder `missing optional dependencies` for non-target platforms while building macOS arm64
- `falling back to ad-hoc signature` and skipped notarization for the local directory build

### 6. Quit Superset if running

Replacing the `.app` while Superset is running causes both instances to run simultaneously — old process holds IPC ports, SQLite connections, and the URL scheme registration, so the new instance starts in a broken state.

```bash
osascript -e 'quit app "Superset"' 2>/dev/null
# Wait until the process is actually gone (up to 30 seconds)
for i in $(seq 1 60); do pgrep -x "Superset" > /dev/null || break; sleep 0.5; done
```

If it was already quit, the `osascript` command exits silently and the loop terminates immediately. If you have an active Claude session inside Superset, the app will show a confirmation dialog before quitting — the loop handles that delay by polling instead of using a fixed sleep.

### 7. Copy to ~/Applications

Delete any existing install first so leftover files from prior builds don't linger inside the `.app` bundle:

```bash
rm -rf ~/Applications/Superset.app
cp -R apps/desktop/release/mac-arm64/Superset.app ~/Applications/
```

### 8. Report

Tell the user the build is done and the app has been installed to `~/Applications/Superset.app`.
