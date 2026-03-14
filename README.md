# OpenContext

[![npm version](https://img.shields.io/npm/v/opencontext.svg)](https://www.npmjs.com/package/@ofelipedsnts/opencontext) 
[![npm downloads](https://img.shields.io/npm/dm/opencontext.svg)](https://www.npmjs.com/package/@ofelipedsnts/opencontext)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

OpenContext is a CLI that provides a unified context hub for AI agents. It combines
private local documentation with public docs from the context-hub (chub).

## How it works

OpenContext is built for your coding agent to use.
You can prompt your agent to call the CLI to fetch context before coding, or
install a skill so it is used automatically.

Examples:

```text
"Use the opencontext CLI to fetch the latest API docs before implementing this."
"Run 'opencontext --help' and 'opencontext search <query>' to find the right doc."
```

If you are using an agent that supports skills, copy the skill file and tell the
agent to use it for every coding task:

```bash
# Example for Claude Code
mkdir -p ~/.claude/skills/opencontext
cp ./skills/opencontext-skill.md ~/.claude/skills/opencontext/SKILL.md
```

OpenContext will try local docs first, then team docs, and finally chub when
it needs public API documentation.

## Install

Global install:

```bash
npm install -g @ofelipedsnts/opencontext
opencontext init
```

Team install (repo mode):

```bash
git clone <your-repo-url>
cd opencontext
npm install -g .
```

## Quick start

## Usage modes

OpenContext supports two usage modes:

- **Personal mode** — manage your private docs locally for individual projects.
- **Team mode** — manage shared internal documentation for teams and companies,
  versioned inside the repository.

```bash
opencontext init
opencontext add ./acme/docs/auth-api/DOC.md
opencontext get acme/auth-api
opencontext search "authentication"
```

## Commands

- `opencontext init` — create local config and directories
- `opencontext add <path>` — add a DOC.md/SKILL.md file to the local store
- `opencontext add <path> --team` — add a DOC.md/SKILL.md file to the repo `content/` directory
- `opencontext get <author>/<name>` — fetch documentation (local, team, or chub)
- `opencontext list` — list available documentation (local and team)
- `opencontext search <query>` — search across sources
- `opencontext annotate <author>/<name> <note>` — add a local note
- `opencontext annotate <author>/<name> --clear` — clear notes for a document
- `opencontext annotate --list` — list all annotations
- `opencontext sync init <git-url>` — configure team sync
- `opencontext sync pull` — pull updates from remote
- `opencontext sync push` — push updates to remote
- `opencontext config` — show or update configuration

### Global flags

- `--lang <py|js>` — language filter for chub
- `--version <version>` — version filter for docs
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

Docs follow the Content Guide format. Each entry lives in a `DOC.md` file with
frontmatter fields like `name`, `description`, and `metadata.*`.

Entry ids are `author/name` (author from the directory, name from frontmatter).

```markdown
---
name: auth-api
description: Authentication service documentation
metadata:
  languages: javascript
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-01-01"
  source: maintainer
  tags: "auth,api"
---

# Auth API

...
```

## Folder structure conventions

OpenContext follows the Content Guide directory structure. Content is organized by
author (vendor/org), then by type (`docs` or `skills`), then by entry name.

```
<author>/
  docs/
    <entry-name>/
      DOC.md
  skills/
    <entry-name>/
      SKILL.md
```

### Local (personal) store

- Base directory: `~/.config/opencontext/private/`
- Path rule: `<author>/docs/<entry-name>/DOC.md`

Example:

```
~/.config/opencontext/private/acme/docs/widgets/DOC.md
```

### Team (repo) store

- Base directory: `./content/`
- Same structure as local

Example:

```
./content/acme/docs/widgets/DOC.md
```

### Multi-language docs

```
acme/docs/widgets/javascript/DOC.md
acme/docs/widgets/python/DOC.md
```

### Multi-version docs

```
acme/docs/widgets/v1/DOC.md
acme/docs/widgets/v2/DOC.md
```

### Add command behavior

- `opencontext add <path>` expects the path to include `/docs/` or `/skills/` and
  copies it into the local store, preserving the structure.
- `opencontext add <path> --team` does the same inside `./content/`.
