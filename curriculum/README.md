# Curriculum

Everything the site teaches: the glossary, lessons, and the YAML that puts lessons into modules, courses and pathways.

| File | What it is |
| --- | --- |
| `index.yaml` | Which courses and pathways the site shows, in order |
| `pathways/{pathway}.yaml` | A pathway: courses in a recommended order for one kind of reader |
| `courses/{course}.yaml` | A course: its pillar and its modules, in order |
| `modules/{module}.yaml` | A module: its lessons, in order |
| `lessons/pillar-{N}/{course}/{lesson}.md` | A lesson |
| `glossary.md` | Every term, A to Z, on one page |
| `glossary/{term}.md` | The full article for a term that needs more than a definition |

## How files point at each other

A pathway lists courses, a course lists modules, and a module lists lessons, all by file name without the extension:

```yaml
# modules/example-module.yaml
lessons:
  - example-lesson
```

A module can sit in more than one course, and a lesson in more than one module.

File names become addresses on the site, so keep them short, lowercase and hyphenated, and don't rename one that's already live.

## Lessons

File a lesson under its pillar and the course it was written for: `lessons/pillar-0/example-course/example-lesson.md`. The folders are only for filing. Modules find a lesson by its name wherever it sits, so a lesson can move between folders, but no two lessons anywhere can share a name.

A lesson is Markdown with a `description` and an optional `duration` in its frontmatter, then a `# Title`:

```markdown
---
description: One line on what this lesson teaches.
duration: 5 min
---

# Example lesson

Link a glossary term by name, like [builder](glossary:builder).
```

## Glossary entries

Each term sits under its letter (`## A` to `## Z`, or `## #` for terms that start with a symbol) in exactly this shape:

```markdown
### zkLogin

*Wallet & identity*

A Sui sign-in that turns an ordinary account login into a blockchain identity, so players can act onchain without setting up a wallet first.
```

- **Heading:** the term as it should appear. Its name in links is the heading in lowercase, with spaces as hyphens and punctuation dropped, so renaming a term breaks links to it.
- **Topics,** in italics, main topic first. Each has to be one of `Game & economy`, `Sui & Move`, `Smart Assemblies`, `Wallet & identity` and `dApps & tools`, spelled exactly.
- **Other names,** if the term has any, go on the same line after ` · also: `, separated by commas, not plurals: `*Wallet & identity · also: zero-knowledge login*`.
- **Definition:** one to three short sentences, plain text.
- **Article,** if the term needs one: write it as `glossary/<term>.md`, named after the term, and end the entry with `[Read the article →](glossary/<term>.md)`.
