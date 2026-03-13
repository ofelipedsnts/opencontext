---
name: opencontext
description: >
  Use opencontext to fetch documentation before writing or modifying any code.
  This skill teaches the agent how to use the OpenContext CLI (`opencontext`) to
  search, retrieve, and annotate documentation from three sources: local private
  docs (~/.config/opencontext/private/), team docs (./content/ in the repo), and
  public API docs via chub. Always use this skill when the user asks to consume
  an API, follow internal conventions, implement an integration, or asks "how do
  we do X here". Do not skip this step — fetching context before coding
  significantly reduces hallucinated APIs and incorrect implementations.
  Use opencontext search before opencontext get whenever the exact doc id is unknown.
---

# OpenContext Skill (`opencontext`)

OpenContext is a unified CLI context hub for AI agents. It gives you access to
three documentation sources through a single interface:

| Source | Prefix | Backed by |
|--------|--------|-----------|
| Local (personal) | `local/` | `~/.config/opencontext/private/` |
| Team (repo) | `team/` | `./content/` in the project repository |
| Public (external) | `<provider>/` e.g. `openai/` | chub (`@aisuite/chub`) |

When no prefix is given, opencontext searches in cascade: local → team → chub.

---

## Core Workflow

**Always follow this order before writing code:**

1. **Search** for relevant docs — `opencontext search <query>`
2. **Fetch** the relevant doc — `opencontext get <id>`
3. **Read and apply** the returned content
4. **Annotate** if you discover something missing — `opencontext annotate <id> "<note>"`

---

## Commands Reference

### `opencontext init`
Creates local config and directories on first use. Run once after install.
```bash
opencontext init
```

---

### `opencontext search <query>`
Searches across all sources (local, team, chub). Always run this first when
you don't know the exact doc id.

```bash
opencontext search "authentication"
opencontext search "stripe webhook"
opencontext search "deploy pipeline" --source team
opencontext search "rate limits" --json
```

**Flags:**
- `--source local|team|chub|cascade` — restrict to a specific source
- `--json` — return structured JSON (use when parsing results programmatically)

---

### `opencontext get <id>`
Fetches a document by id. The id comes from the frontmatter of the `.md` file.
Ids support `/` as a path separator, which maps to subdirectories.

```bash
# Personal/local doc
opencontext get local/auth-api
opencontext get local/zapsign/python/zapsign-docs

# Team doc
opencontext get team/internal/infra/deploy

# Public doc via chub (no prefix needed — provider name acts as namespace)
opencontext get openai/chat
opencontext get openai/chat --lang py
opencontext get stripe/api --lang js

# Cascade (tries local → team → chub automatically)
opencontext get auth-api
```

**Flags:**
- `--lang py|js` — language variant filter (passed to chub when delegating)
- `--source local|team|chub` — force a specific source, skip cascade
- `--no-cache` — bypass cached chub results and fetch fresh
- `--json` — return JSON with `{ metadata, content, source }` shape

---

### `opencontext list`
Lists all available docs across local and team stores.

```bash
opencontext list
opencontext list --source local
opencontext list --source team
opencontext list --json
```

---

### `opencontext add <path>`
Adds a markdown file to the local store. The file must have valid YAML
frontmatter with at minimum `id` and `title`. The `id` determines where the
file is saved — each `/` creates a subdirectory.

```bash
opencontext add ./docs/auth-api.md            # adds to local private store
opencontext add ./docs/deploy.md --team       # adds to ./content/ (team store)
```

**Document format (required):**
```markdown
---
id: zapsign/python/zapsign-docs
title: Zapsign Python SDK
description: How to use the Zapsign Python SDK
tags: [zapsign, python, sdk]
lang: [py]
version: "1.0"
---

# Zapsign Python SDK

Content here...
```

Minimum required fields: `id`, `title`.
Optional fields: `description`, `tags`, `lang`, `version`.

---

### `opencontext annotate <id> "<note>"`
Attaches a local note to any document (local, team, or chub). Annotations
persist across sessions and appear automatically on future `get` calls.
Use this when you discover a gap, a workaround, or an important caveat.

```bash
# Add a note
opencontext annotate stripe/api "Webhook endpoint requires raw body, not parsed JSON"

# List all annotations
opencontext annotate --list

# Clear annotations for a doc
opencontext annotate stripe/api --clear
```

---

### `opencontext sync` (team mode)
Synchronizes the team doc store with a remote git repository.

```bash
opencontext sync init git@github.com:my-team/opencontext-docs.git
opencontext sync pull     # pull latest from remote
opencontext sync push     # push local changes to remote
```

---

### `opencontext config`
Shows or updates configuration values.

```bash
opencontext config
opencontext config chub.enabled false     # disable chub delegation
opencontext config defaults.lang py       # set default language filter
```

---

## Global Flags (work with any command)

| Flag | Effect |
|------|--------|
| `--source local\|team\|chub\|cascade` | Force a specific source |
| `--lang py\|js` | Language filter (forwarded to chub) |
| `--no-cache` | Bypass chub cache |
| `--json` | Machine-readable JSON output |

---

## ID and Path Conventions

Ids use `/` as a namespace separator, which maps to filesystem subdirectories.

| Store | Base path | Id example | Resulting file |
|-------|-----------|------------|----------------|
| local | `~/.config/opencontext/private/` | `zapsign/python/zapsign-docs` | `~/.config/opencontext/private/zapsign/python/zapsign-docs.md` |
| team | `./content/` | `internal/infra/deploy` | `./content/internal/infra/deploy.md` |

**Routing rules:**
- `local/<id>` → forces local store only
- `team/<id>` → forces team store only
- `<provider>/<doc>` (e.g. `openai/chat`) → delegated directly to chub
- `<id>` with no prefix → cascade: local → team → chub

---

## Decision Guide: When to Use Each Source

| Situation | Command to use |
|-----------|---------------|
| Don't know if docs exist | `opencontext search <query>` |
| Internal API or private service | `opencontext get local/<id>` |
| Team conventions, architecture decisions | `opencontext get team/<id>` |
| Public API (OpenAI, Stripe, etc.) | `opencontext get <provider>/<doc>` |
| Unsure of source | `opencontext get <id>` (cascade) |
| Found a missing detail while coding | `opencontext annotate <id> "<note>"` |

---

## Quick Examples

```bash
# Before implementing an auth flow
opencontext search "authentication"
opencontext get local/auth-api

# Before calling the OpenAI API in Python
opencontext get openai/chat --lang py

# Before deploying — check team guide
opencontext get team/internal/infra/deploy

# You found a gotcha with the Stripe webhook
opencontext annotate stripe/api "Use express.raw() middleware, not express.json()"

# List everything available
opencontext list
```
