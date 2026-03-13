# SKILL: openctx

Use `openctx` to retrieve documentation before writing code.

## When to use
- Before consuming any API (internal or external)
- To check team conventions and project patterns
- To confirm how a tool should be used

## Core commands
- `openctx search <query>` — find available documentation
- `openctx get <id>` — get a specific document
- `openctx get local/<id>` — private/local documentation
- `openctx get team/<id>` — team documentation
- `openctx get <provider>/<doc>` — public docs via chub

## Examples
openctx search "authentication"
openctx get local/auth-api
openctx get team/code-style
openctx get openai/chat --lang py
