# Contributing

Thanks for contributing to OpenContext.

## Adding team documentation

1. Create a `DOC.md` file under `content/<author>/docs/<entry-name>/`.
2. Add YAML frontmatter with `name`, `description`, and the `metadata.*` fields.
3. Keep `name` stable and unique for the author namespace.

Example:

```markdown
---
name: auth-service
description: Team documentation for auth service
metadata:
  languages: javascript
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-01-01"
  source: maintainer
  tags: "auth,backend"
---

# Auth Service

...
```

## Running tests

```bash
npm test
```
