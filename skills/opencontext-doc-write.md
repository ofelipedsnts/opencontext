---
name: opencontext-doc-author
description: >
  Use this skill whenever the user wants to create, write, or register a new
  documentation file for OpenContext. Triggers include: "add a doc to opencontext",
  "document this API", "create a context file", "register this in opencontext",
  "add to our local docs", "save this as an opencontext doc", or any request to
  capture knowledge (API behavior, internal conventions, service details,
  architecture decisions) so that future AI agents can retrieve it via opencontext.
  Always use this skill when the user wants to persist information into the
  OpenContext store — do not just write a markdown file without following the
  format and registration steps defined here.
---

# OpenContext Documentation Author Skill

This skill guides the creation of documentation files compatible with OpenContext
and their registration into the correct store via `opencontext add`.

A documentation file is a `.md` file with YAML frontmatter that follows the
OpenContext format. After creation, it is registered with `opencontext add` so that
agents can retrieve it later with `opencontext get` or `opencontext search`.

---

## Workflow (always follow in order)

1. **Gather information** — understand what needs to be documented
2. **Determine the store** — local (personal) or team (shared repo)
3. **Define the id** — choose a namespaced id that reflects the content hierarchy
4. **Write the file** — frontmatter + structured markdown body
5. **Register it** — run `opencontext add <path>` or `opencontext add <path> --team`
6. **Verify** — run `opencontext get <id>` to confirm it was registered correctly

---

## Step 1 — Gather Information

Before writing, collect the following from the user or from the content being
documented:

| Field | Question to resolve |
|-------|-------------------|
| What is being documented? | An API? A service? A convention? A workflow? |
| Who is the audience? | Just this developer, or the whole team? |
| What language(s) apply? | Python, JavaScript, both, or language-agnostic? |
| What is the core content? | Endpoints, parameters, examples, gotchas, constraints |

If the user provides a URL, existing code, or raw notes — use that as the source
of truth for the content body.

---

## Step 2 — Determine the Store

| Store | Use when |
|-------|----------|
| **local** (`~/.config/opencontext/private/`) | Personal docs, sensitive info, machine-specific notes |
| **team** (`./content/` in the repo) | Shared conventions, team APIs, architecture decisions |

Default to **local** unless the user explicitly says "team" or "shared".

---

## Step 3 — Define the `id`

The `id` is the most important field. It determines:
- How the doc is retrieved (`opencontext get <id>`)
- Where the file is stored on disk (each `/` becomes a subdirectory)

**Rules:**
- Use lowercase, hyphens for spaces, no special characters
- Use `/` to create hierarchy (provider, category, doc name)
- Be specific enough to avoid collisions, but not overly long
- The last segment should be the document name

**Id structure pattern:**
```
<provider-or-domain>/<category>/<doc-name>
```

**Examples:**

| Content | Good id |
|---------|---------|
| Zapsign Python SDK | `zapsign/python/zapsign-docs` |
| Internal auth API | `internal/auth/auth-api` |
| Team deploy guide | `internal/infra/deploy` |
| OpenAI chat completion | `openai/chat` |
| Stripe webhook setup | `stripe/webhooks` |
| Code review conventions | `team/conventions/code-review` |

---

## Step 4 — Write the File

### Frontmatter (required)

Every file must start with YAML frontmatter. Minimum required fields: `id` and `title`.

```markdown
---
id: <namespaced-id>
title: <Human Readable Title>
description: <one-line summary of what this doc covers>
tags: [tag1, tag2, tag3]
lang: [js, py]
version: "1.0"
---
```

**Field reference:**

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `id` | ✅ | string | Namespaced identifier. Must be unique within the store. |
| `title` | ✅ | string | Human-readable name shown in `opencontext list` |
| `description` | recommended | string | One-line summary for search results |
| `tags` | recommended | string[] | Keywords for `opencontext search` |
| `lang` | optional | string[] | Language variants: `js`, `py`, or both |
| `version` | optional | string | Document version (freeform) |

### Body Structure

Use this structure as the default template. Adapt sections to fit the content type.

```markdown
---
id: <id>
title: <title>
description: <description>
tags: [<tags>]
lang: [<lang>]
version: "1.0"
---

# <title>

> <one-line summary of what this document covers and when to use it>

## Overview

<What this service/API/convention does and why it exists. 2-4 sentences.>

## Quick Start

<Minimal working example — the fastest path to getting something working.>

```<lang>
<code example>
```

## Key Concepts

<Core concepts the reader needs to understand before using this.>

## Reference

<Full API details, parameters, endpoints, or rules. Use tables and code blocks.>

### <Section 1>

<Content>

### <Section 2>

<Content>

## Examples

<Realistic, copy-paste-ready usage examples for the most common cases.>

## Gotchas and Limitations

<Known edge cases, common mistakes, important constraints. Use a list.>

## Related

<Links or ids of related OpenContext docs, e.g. `opencontext get internal/auth/auth-api`>
```

---

## Content Type Templates

Use the appropriate template based on what is being documented.

### API / SDK Documentation

```markdown
---
id: <provider>/<category>/<doc-name>
title: <Provider> <Feature> API
description: How to use <feature> from <provider>
tags: [<provider>, api, <feature>]
lang: [js, py]
version: "1.0"
---

# <Provider> <Feature> API

> Use this doc before implementing any integration with <provider>'s <feature>.

## Authentication

<How to authenticate. Include where to find credentials.>

## Endpoints / Methods

| Method / Endpoint | Description |
|-------------------|-------------|
| `<method>` | <what it does> |

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `<param>` | string | yes | <description> |

## Request Example

```python
<minimal working request>
```

## Response Shape

```json
{
  "<field>": "<type and description>"
}
```

## Error Handling

<Common errors and how to handle them.>

## Gotchas and Limitations

- <gotcha 1>
- <gotcha 2>
```

---

### Internal Service / Microservice

```markdown
---
id: internal/<domain>/<service-name>
title: <Service Name>
description: Internal documentation for the <service> service
tags: [internal, <domain>, <service>]
version: "1.0"
---

# <Service Name>

> <What this service does and who owns it.>

## Responsibilities

<What this service is responsible for. What it is NOT responsible for.>

## How to Call It

<Base URL, authentication method, and a minimal working example.>

## Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/path` | POST | <description> |

## Data Contracts

<Request and response shapes for the main operations.>

## Dependencies

<Other services or infrastructure this service depends on.>

## Gotchas and Limitations

- <gotcha 1>
```

---

### Team Convention / Architecture Decision

```markdown
---
id: team/conventions/<topic>
title: <Convention Name>
description: Team standard for <topic>
tags: [convention, team, <topic>]
version: "1.0"
---

# <Convention Name>

> <One-line statement of the rule or convention.>

## Rationale

<Why this convention exists. What problem it solves.>

## The Rule

<Clear, unambiguous statement of what to do and what not to do.>

## Examples

**Correct:**
```
<example>
```

**Incorrect:**
```
<example>
```

## Exceptions

<When it is acceptable to deviate from this convention, if ever.>
```

---

## Step 5 — Register with OpenContext

After writing and saving the file, register it:

```bash
# Register in local (personal) store
opencontext add ./path/to/doc.md

# Register in team store (./content/ in the repo)
opencontext add ./path/to/doc.md --team
```

**What happens on `opencontext add`:**
- The frontmatter `id` is read to determine the destination path
- Subdirectories are created automatically based on `/` in the id
- The file is copied to the correct store location
- The doc becomes immediately searchable via `opencontext search`

**Common errors:**

| Error | Cause | Fix |
|-------|-------|-----|
| `Missing required field: id` | Frontmatter incomplete | Add `id` field to frontmatter |
| `Missing required field: title` | Frontmatter incomplete | Add `title` field to frontmatter |
| `File already exists` | Id collision | Change the id or use a more specific namespace |
| `Invalid frontmatter` | YAML syntax error | Check for tabs (use spaces), unclosed quotes, special chars |

---

## Step 6 — Verify Registration

Always confirm the doc is accessible after registering:

```bash
# Fetch the doc back by id
opencontext get <id>

# Confirm it appears in the list
opencontext list --source local     # for personal docs
opencontext list --source team      # for team docs

# Confirm it appears in search
opencontext search "<one of your tags>"
```

---

## Quality Checklist

Before considering the doc complete, verify:

- [ ] `id` is lowercase, uses hyphens, and follows the `domain/category/name` pattern
- [ ] `title` is human-readable and descriptive
- [ ] `description` is one line and useful as a search snippet
- [ ] `tags` include the provider name, content type, and key topics
- [ ] Body has at least an Overview and one working code example
- [ ] Gotchas section captures any non-obvious behavior discovered
- [ ] `opencontext get <id>` returns the doc correctly after registration

---

## Full End-to-End Example

User request: *"Document how we use the Zapsign API to send documents for signature in Python."*

**1. Define the id:** `zapsign/python/send-document`

**2. Write the file** as `./docs/zapsign-send-document.md`:

```markdown
---
id: zapsign/python/send-document
title: Zapsign — Send Document for Signature (Python)
description: How to send a document for electronic signature using the Zapsign Python SDK
tags: [zapsign, python, esign, documents]
lang: [py]
version: "1.0"
---

# Zapsign — Send Document for Signature (Python)

> Use this before implementing any Zapsign document-sending flow in Python.

## Authentication

Zapsign uses a bearer token. Store it in an environment variable and never
hardcode it.

```python
import os
TOKEN = os.environ["ZAPSIGN_TOKEN"]
headers = {"Authorization": f"Bearer {TOKEN}"}
```

## Quick Start

```python
import requests

response = requests.post(
    "https://api.zapsign.com.br/api/v1/docs/",
    headers={"Authorization": f"Bearer {TOKEN}"},
    json={
        "name": "Contract",
        "url_pdf": "https://example.com/contract.pdf",
        "signers": [{"name": "Alice", "email": "alice@example.com"}]
    }
)
doc = response.json()
print(doc["token"])  # use this token to track the document
```

## Key Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | yes | Display name of the document |
| `url_pdf` | string | yes | Public URL of the PDF to be signed |
| `signers` | array | yes | List of signer objects |
| `signers[].name` | string | yes | Full name of the signer |
| `signers[].email` | string | yes | Email where the signing link is sent |

## Gotchas and Limitations

- The PDF URL must be publicly accessible at the time of the API call
- Each signer receives an email automatically — no separate call needed
- The document `token` in the response is different from the auth token

## Related

- `opencontext get zapsign/python/zapsign-docs` — full SDK overview
```

**3. Register:**
```bash
opencontext add ./docs/zapsign-send-document.md
```

**4. Verify:**
```bash
opencontext get zapsign/python/send-document
opencontext search "zapsign"
```
