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
3. **Define the entry id** — choose an `author/name` pair
4. **Write the file** — frontmatter + structured markdown body
5. **Register it** — run `opencontext add <path>` or `opencontext add <path> --team`
6. **Verify** — run `opencontext get <author>/<name>` to confirm it was registered correctly

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

## Step 3 — Define the entry id (author/name)

Entries are identified by `author/name`, derived from the directory structure and
the `name` field in frontmatter. It determines:
- How the doc is retrieved (`opencontext get author/name`)
- The full folder path on disk: `author/docs/name/DOC.md`

**Rules:**
- Use lowercase, hyphens for spaces, no special characters
- Keep `name` specific and stable
- Use `author` as vendor/org/team namespace

**Entry id pattern:**
```
<author>/<name>
```

**File naming rule — no exceptions:**
```
author/docs/name/DOC.md
```

The filename is **always `DOC.md`**, regardless of the content.

**Examples:**

| Content | Entry id | Resulting file path (local) |
|---------|----------|-----------------------------|
| Zapsign Python SDK | `zapsign/zapsign-docs` | `.../zapsign/docs/zapsign-docs/DOC.md` |
| Internal auth API | `internal/auth-api` | `.../internal/docs/auth-api/DOC.md` |
| Team deploy guide | `internal/deploy` | `.../internal/docs/deploy/DOC.md` |

---

## Step 4 — Write the File

**Always save the file as `DOC.md`** inside `author/docs/name/`.

```
✅ correct:  ./zapsign/docs/send-document/DOC.md
❌ wrong:    ./zapsign/docs/send-document.md
❌ wrong:    ./docs/zapsign-send-document.md
```

### Frontmatter (required)

Every file must start with YAML frontmatter. Required fields are `name`,
`description`, and the metadata fields defined in the Content Guide.

```markdown
---
name: <entry-name>
description: <one-line summary of what this doc covers>
metadata:
  languages: <language>
  versions: <package-version>
  revision: 1
  updated-on: "YYYY-MM-DD"
  source: <official|maintainer|community>
  tags: "tag1,tag2,tag3"
---
```

**Field reference:**

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `name` | ✅ | string | Entry name (used in id: `author/name`). |
| `description` | ✅ | string | One-line summary for search results |
| `metadata.languages` | ✅ | string | Language of this variant |
| `metadata.versions` | ✅ | string | Package/SDK version covered |
| `metadata.revision` | ✅ | number | Content revision number |
| `metadata.updated-on` | ✅ | string | Last update date (YYYY-MM-DD) |
| `metadata.source` | ✅ | string | Trust level: official, maintainer, community |
| `metadata.tags` | optional | string | Comma-separated tags |

### Body Structure

Use this structure as the default template. Adapt sections to fit the content type.

```markdown
---
name: <name>
description: <description>
metadata:
  languages: <language>
  versions: <package-version>
  revision: 1
  updated-on: "YYYY-MM-DD"
  source: <official|maintainer|community>
  tags: "tag1,tag2"
---

# <title>

> <one-line summary of what this document covers and when to use it>

## Overview

<What this service/API/convention does and why it exists. 2-4 sentences.>

## Quick Start

<Minimal working example — the fastest path to getting something working.>

\`\`\`<lang>
<code example>
\`\`\`

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
name: <entry-name>
description: How to use <feature> from <provider>
metadata:
  languages: <language>
  versions: <package-version>
  revision: 1
  updated-on: "YYYY-MM-DD"
  source: <official|maintainer|community>
  tags: "<provider>,api,<feature>"
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

\`\`\`python
<minimal working request>
\`\`\`

## Response Shape

\`\`\`json
{
  "<field>": "<type and description>"
}
\`\`\`

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
name: <service-name>
description: Internal documentation for the <service> service
metadata:
  languages: <language>
  versions: <package-version>
  revision: 1
  updated-on: "YYYY-MM-DD"
  source: maintainer
  tags: "internal,<domain>,<service>"
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
name: <topic>
description: Team standard for <topic>
metadata:
  languages: <language>
  versions: <package-version>
  revision: 1
  updated-on: "YYYY-MM-DD"
  source: maintainer
  tags: "convention,team,<topic>"
---

# <Convention Name>

> <One-line statement of the rule or convention.>

## Rationale

<Why this convention exists. What problem it solves.>

## The Rule

<Clear, unambiguous statement of what to do and what not to do.>

## Examples

**Correct:**
\`\`\`
<example>
\`\`\`

**Incorrect:**
\`\`\`
<example>
\`\`\`

## Exceptions

<When it is acceptable to deviate from this convention, if ever.>
```

---

## Step 5 — Register with OpenContext

After writing and saving `DOC.md` inside the `author/docs/name/` folder, register it:

```bash
# Register in local (personal) store
opencontext add ./<author>/docs/<name>/DOC.md

# Example:
opencontext add ./zapsign/docs/send-document/DOC.md

# Register in team store (./content/ in the repo)
opencontext add ./zapsign/docs/send-document/DOC.md --team
```

**What happens on `opencontext add`:**
- The `author/docs/.../DOC.md` path determines the destination
- Subdirectories are created automatically based on the provided structure
- The file is copied to the correct store location
- The doc becomes immediately searchable via `opencontext search`

**Common errors:**

| Error | Cause | Fix |
|-------|-------|-----|
| `Missing required field: name` | Frontmatter incomplete | Add `name` field to frontmatter |
| `Missing required field: description` | Frontmatter incomplete | Add `description` field to frontmatter |
| `File already exists` | Id collision | Change the entry name or author namespace |
| `Invalid frontmatter` | YAML syntax error | Check for tabs (use spaces), unclosed quotes, special chars |

---

## Step 6 — Verify Registration

Always confirm the doc is accessible after registering:

```bash
# Fetch the doc back by entry id
opencontext get <author>/<name>

# Confirm it appears in the list
opencontext list --source local     # for personal docs
opencontext list --source team      # for team docs

# Confirm it appears in search
opencontext search "<one of your tags>"
```

---

## Quality Checklist

Before considering the doc complete, verify:

- [ ] `name` is lowercase, uses hyphens, and is stable
- [ ] File is saved as `DOC.md` inside `author/docs/name/`
- [ ] `description` is one line and useful as a search snippet
- [ ] `tags` include the provider name, content type, and key topics
- [ ] Body has at least an Overview and one working code example
- [ ] Gotchas section captures any non-obvious behavior discovered
- [ ] `opencontext get <author>/<name>` returns the doc correctly after registration

---

## Full End-to-End Example

User request: *"Document how we use the Zapsign API to send documents for signature in Python."*

**1. Define the entry id:** `zapsign/send-document`

**2. Create the folder and write the file** as `./zapsign/docs/send-document/DOC.md`:

```markdown
---
name: send-document
description: How to send a document for electronic signature using the Zapsign Python SDK
metadata:
  languages: python
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-01-01"
  source: maintainer
  tags: "zapsign,python,esign,documents"
---

# Zapsign — Send Document for Signature (Python)

> Use this before implementing any Zapsign document-sending flow in Python.

## Authentication

Zapsign uses a bearer token. Store it in an environment variable and never
hardcode it.

\`\`\`python
import os
TOKEN = os.environ["ZAPSIGN_TOKEN"]
headers = {"Authorization": f"Bearer {TOKEN}"}
\`\`\`

## Quick Start

\`\`\`python
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
\`\`\`

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

- `opencontext get zapsign/zapsign-docs` — full SDK overview
```

**3. Register:**
```bash
opencontext add ./zapsign/docs/send-document/DOC.md
```

**4. Verify:**
```bash
opencontext get zapsign/send-document
opencontext search "zapsign"
```
