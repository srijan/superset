# Fish-Compatible Prompt Launch

**Patch ID:** PATCH_02

When the user submits a direct prompt to launch an agent, the prompt text must be passed to the agent CLI in a way that works across all supported shells: bash, zsh, and fish.

## Problem

The naive approach — embedding the prompt inline via a POSIX heredoc (`<<'DELIMITER' ... DELIMITER`) — works in bash and zsh but fails in fish, which does not support heredoc redirection syntax. Fish users would get a parse error on launch.

## Behavior

Prompts are passed to the agent CLI via a temporary file:

1. The prompt text is written to `.superset/prompt-<slug>.md` inside the workspace directory before the terminal command runs.
2. The agent CLI is invoked with `$(cat '.superset/prompt-<slug>.md')` as the prompt argument, which works in bash, zsh, and fish alike.
3. The filename slug is derived from the task slug when available (alphanumeric, dots, dashes, underscores only); otherwise a UUID is used.

## Scope

This applies to the renderer's direct-prompt launch path (when the user types a prompt and hits Run). MCP-built commands use a different code path and are not affected.
