---
name: content-guide
description: Official guide for creating OpenContext documentation
metadata:
  languages: markdown
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "opencontext,docs,structure,conventions"
---

# Content Guide

> Use this guide to create new OpenContext documentation with the correct structure and storage locations (local and team).

## Purpose

Standardize documentation creation so agents and people can find and reuse content consistently via `opencontext get` and `opencontext search`.

## Directory structure

OpenContext organizes content by author (vendor/org), type, and entry name:

```
<author>/
  docs/
    <entry-name>/
      DOC.md
  skills/
    <entry-name>/
      SKILL.md
```

### Documents (DOC.md)

- `docs/` stores documentation
- `DOC.md` is the required document file
- `entry-name` must match the `name` in frontmatter

### Skills (SKILL.md)

- `skills/` stores agent skills
- `SKILL.md` is the required skill file
- `entry-name` must match the `name` in frontmatter

## Document structure

Every DOC must have YAML frontmatter at the top with the fields below.

```markdown
---
name: <entry-name>
description: <short description>
metadata:
  languages: <e.g. python | javascript | markdown>
  versions: "<version>"
  revision: <integer>
  updated-on: "YYYY-MM-DD"
  source: <e.g. maintainer | automated | vendor>
  tags: "tag1,tag2,tag3"
---

# Title

> One-line usage summary.

## Overview

## Quick Start

## Reference

## Examples

## Gotchas and Limitations

## Sources
```

Rules:
- `name` must match the `entry-name` folder
- `metadata.languages` and `metadata.versions` are required
- use ASCII whenever possible

## Entry identifier

The entry id is `author/name`. Examples:

- `acme/widgets`
- `opencontext/content-guide`

The `author` comes from the root directory and the `name` comes from frontmatter.

## Storage locations

### Local (private)

- Base: `~/.config/opencontext/private/`
- Path: `<author>/docs/<entry-name>/DOC.md`

Example:
```
~/.config/opencontext/private/acme/docs/widgets/DOC.md
```

### Team (repository)

- Base: `./content/`
- Same format as local

Example:
```
./content/acme/docs/widgets/DOC.md
```

## Multi-language and multi-version

If you need to split by language or version, create subfolders:

```
acme/docs/widgets/javascript/DOC.md
acme/docs/widgets/python/DOC.md

acme/docs/widgets/v1/DOC.md
acme/docs/widgets/v2/DOC.md
```

## Recommended flow

1. Create the `DOC.md` in the correct structure
2. Verify the frontmatter is complete
3. Register with OpenContext

```bash
# local
opencontext add ./acme/docs/widgets/DOC.md

# team
opencontext add ./acme/docs/widgets/DOC.md --team
```

4. Verify with `opencontext get`:

```bash
opencontext get acme/widgets --source local
opencontext get acme/widgets --source team
```

## Gotchas

- `opencontext add` requires `DOC.md` or `SKILL.md` with the correct structure
- `name` in frontmatter must match the folder name
- do not mix personal content in the team repository

## Related

- `README.md`
- `skills/opencontext-doc-writer.md`
