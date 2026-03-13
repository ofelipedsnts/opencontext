# OpenContext

OpenContext is a CLI that provides a unified context hub for AI agents. It combines
private local documentation with public docs from the context-hub (chub).

## Install

Global install:

```bash
npm install -g opencontext
opencontext init
```

Team install (repo mode):

```bash
git clone <your-repo-url>
cd opencontext
npm install -g .
```

## Quick start

```bash
opencontext init
opencontext add ./docs/auth-api.md
opencontext get auth-api
opencontext search "authentication"
```

## Commands

- `opencontext init` — create local config and directories
- `opencontext add <path>` — add a markdown file to the local store
- `opencontext add <path> --team` — add a markdown file to the repo `content/` directory
- `opencontext get <id>` — fetch documentation (local, team, or chub)
- `opencontext list` — list available documentation (local and team)
- `opencontext search <query>` — search across sources
- `opencontext annotate <id> <note>` — add a local note
- `opencontext annotate <id> --clear` — clear notes for a document
- `opencontext annotate --list` — list all annotations
- `opencontext sync init <git-url>` — configure team sync
- `opencontext sync pull` — pull updates from remote
- `opencontext sync push` — push updates to remote
- `opencontext config` — show or update configuration

### Global flags

- `--lang <py|js>` — language filter for chub
- `--source <local|team|chub|cascade>` — force a source
- `--no-cache` — bypass chub cache
- `--json` — JSON output for agent integration

## Modes

### Personal mode

Documents live in `~/.config/opencontext/private/`.

### Team mode

Documents live in `./content/` inside the repository. This enables versioned,
shared documentation for a team.

## chub integration

OpenContext delegates to `chub` when a document is not found locally or in the
team repository. Example:

```bash
opencontext get openai/chat --lang py
```

## Agent skill

Copy `skills/opencontext-skill.md` into your agent skill directory and instruct
the agent to use `opencontext` before writing code.

## Document format

Markdown files must include YAML frontmatter with at least `id` and `title`:

```markdown
---
id: auth-api
title: Auth API
description: Authentication service documentation
tags: [auth, api]
lang: [js, py]
version: "1.0"
---

# Auth API

...
```

## Folder structure conventions

OpenContext supports namespaced ids with `/`, which map directly to folders.
Use this to keep docs organized by provider, team, or topic.

### Local (personal) store

- Base directory: `~/.config/opencontext/private/`
- Id rule: each `/` in `id` becomes a subfolder
- File rule: `id` + `.md`

Example:

```markdown
---
id: zapsign/python/zapsign-docs
title: Zapsign Python Docs
---
```

Resulting path:

```
~/.config/opencontext/private/zapsign/python/zapsign-docs.md
```

### Team (repo) store

- Base directory: `./content/`
- Same id rule: `/` creates subfolders
- File rule: `id` + `.md`

Example:

```markdown
---
id: internal/infra/deploy
title: Deploy Guide
---
```

Resulting path:

```
./content/internal/infra/deploy.md
```

### Add command behavior

- `opencontext add <path>` uses the frontmatter `id` and creates folders automatically.
- `opencontext add <path> --team` behaves the same but inside `./content/`.
- If you pass a custom id in the future, it must match the frontmatter `id`.
