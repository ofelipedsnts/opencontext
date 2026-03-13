# Contributing

Thanks for contributing to OpenContext.

## Adding team documentation

1. Create a markdown file under `content/`.
2. Add YAML frontmatter with at least `id` and `title`.
3. Keep ids stable and unique. Use folder prefixes if needed, e.g. `backend/auth`.

Example:

```markdown
---
id: backend/auth
title: Auth Service
description: Team documentation for auth service
tags: [auth, backend]
lang: [js]
version: "1.0"
---

# Auth Service

...
```

## Running tests

```bash
npm test
```
