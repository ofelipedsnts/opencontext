---
name: content-guide
description: Guia oficial para criar documentacoes no OpenContext
metadata:
  languages: markdown
  versions: "1.0.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "opencontext,docs,structure,conventions"
---

# Content Guide

> Use este guia para criar novas documentacoes no OpenContext com a estrutura e os locais corretos de armazenamento (local e team).

## Objetivo

Padronizar a criacao de documentacoes para que agentes e pessoas encontrem e reutilizem conteudo com consistencia, via `opencontext get` e `opencontext search`.

## Estrutura de diretorios

OpenContext organiza conteudo por autor (vendor/org), tipo e nome de entrada:

```
<author>/
  docs/
    <entry-name>/
      DOC.md
  skills/
    <entry-name>/
      SKILL.md
```

### Documentos (DOC.md)

- `docs/` guarda documentacao
- `DOC.md` e o arquivo obrigatorio do documento
- `entry-name` deve ser igual ao `name` no frontmatter

### Skills (SKILL.md)

- `skills/` guarda skills de agentes
- `SKILL.md` e o arquivo obrigatorio da skill
- `entry-name` deve ser igual ao `name` no frontmatter

## Estrutura do documento

Todo DOC deve ter frontmatter YAML no topo com os campos abaixo.

```markdown
---
name: <entry-name>
description: <descricao curta>
metadata:
  languages: <ex: python | javascript | markdown>
  versions: "<versao>"
  revision: <numero inteiro>
  updated-on: "YYYY-MM-DD"
  source: <ex: maintainer | automated | vendor>
  tags: "tag1,tag2,tag3"
---

# Titulo

> Frase curta de uso do documento.

## Overview

## Quick Start

## Reference

## Examples

## Gotchas and Limitations

## Sources
```

Regras:
- `name` deve corresponder ao nome da pasta `entry-name`
- `metadata.languages` e `metadata.versions` sao obrigatorios
- use ASCII quando possivel

## Identificador da entrada

O id da entrada e `author/name`. Exemplos:

- `acme/widgets`
- `opencontext/content-guide`

O `author` vem do diretorio raiz e o `name` vem do frontmatter.

## Locais de armazenamento

### Local (privado)

- Base: `~/.config/opencontext/private/`
- Caminho: `<author>/docs/<entry-name>/DOC.md`

Exemplo:
```
~/.config/opencontext/private/acme/docs/widgets/DOC.md
```

### Team (repositorio)

- Base: `./content/`
- Mesmo formato do local

Exemplo:
```
./content/acme/docs/widgets/DOC.md
```

## Multi-language e multi-version

Caso voce queira separar por idioma ou versao, crie subpastas:

```
acme/docs/widgets/javascript/DOC.md
acme/docs/widgets/python/DOC.md

acme/docs/widgets/v1/DOC.md
acme/docs/widgets/v2/DOC.md
```

## Fluxo recomendado

1. Crie o `DOC.md` na estrutura correta
2. Verifique se o frontmatter esta completo
3. Registre no OpenContext

```bash
# local
opencontext add ./acme/docs/widgets/DOC.md

# team
opencontext add ./acme/docs/widgets/DOC.md --team
```

4. Verifique com `opencontext get`:

```bash
opencontext get acme/widgets --source local
opencontext get acme/widgets --source team
```

## Gotchas

- `opencontext add` exige `DOC.md` ou `SKILL.md` com a estrutura correta
- `name` no frontmatter deve bater com o nome da pasta
- nao misture conteudo pessoal no repositorio team

## Related

- `README.md`
- `skills/opencontext-doc-writer.md`
