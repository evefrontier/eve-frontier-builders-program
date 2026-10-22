# Curriculum

The courses on the site are put together here, from parts. Nothing in this folder syncs to GitBook: it joins up material that lives there (`content/`) and in the pinned builder docs (`vendor/`).

| File | What it is | Address on the site |
| --- | --- | --- |
| `index.yaml` | The Courses and Pathways pages: their text, and which courses and pathways appear, in order | `/courses`, `/pathways` |
| `courses/{course}.yaml` | A course: title, description, `pillar`, and its `modules` in order | `/courses/{course}` |
| `modules/{module}.yaml` | A module: title, description, and its `lessons` in order | `/courses/{course}/{module}` |
| `lessons/{lesson}.md` | A lesson: your own text, plus parts dropped in from elsewhere | `/courses/{course}/{module}/{lesson}` |
| `pathways/{pathway}.yaml` | A pathway: title, description, `audience`, the answers it suits under `for:`, and its `courses` in order | `/pathways/{pathway}` |
| `questions.yaml` | Questions the reader answers, with the text each answer brings | Asked on the Pathways page and in lessons |

Courses, modules and pathways refer to each other by file name, without the extension. A module can sit in more than one course and a lesson in more than one module; each place gets its own address, and search engines are pointed at the first. File names become addresses, so keep them short, lowercase and hyphenated, and don't rename one that's already live.

## Writing a lesson

A lesson is Markdown with a `description` and an optional `duration` in its frontmatter, then a `# Title`. Link to a glossary term or another lesson by name:

```markdown
Your wallet is [EVE Vault](glossary:eve-vault). [Why indexers exist](lesson:why-indexers-exist) goes further.
```

Hints and tabs use GitBook's syntax; see `content/authoring.md`.

## Dropping things in

| Block | Drops in |
| --- | --- |
| `include` | A section from the content library |
| `glossary` | A term's definition, as a card |
| `excerpt` | A section of the pinned builder docs |
| `exercise` | An interactive exercise built into the site |

````markdown
```include
file: library/pillar-0/protect-your-keys.md
```

```glossary
term: indexer
```

```excerpt
source: builder-documentation
file: eve-vault/wallets-and-identity.md
heading: Seamless Onboarding with zkLogin
```

```exercise
id: feral-vending
title: Feral Data vending machine
intro: Select a node to see the Move lines it produces.
nodes:
  accept: Checks the payment is Feral Data and exactly the price.
```
````

## Personalising a lesson

Answers to the questions in `questions.yaml` stay on the reader's device. The Pathways page asks the ones listed under `finder.ask` in `index.yaml`; a lesson can ask others, and every lesson can use the answers.

| Block or syntax | What it does |
| --- | --- |
| `{{idea.topic\|my idea}}` | Drops in a field of the reader's answer, or the fallback after `\|` |
| `[[It's {{audience.phrase}}.]]` | Leaves the part out when an answer inside it is missing |
| `question` | Asks a question: `ask: audience` |
| `by-answer` | Different Markdown per answer: `answer`, `variants` keyed by answer, an optional `default` and `label` |
| `prompt` | A message the reader might send, with `{{…}}` filled in: `label`, `text`, `copy: true` |
| `pick` | Pick the better of two messages, chosen by an answer: `by`, `pairs`, `right`, `wrong`, `again` |
| `conversation` | An example chat stepped through a message at a time, chosen by an answer: `by`, `examples` |
| `weak-strong` | Pairs of a weaker and a stronger way to ask: `items` |

The build checks every name, link and drop-in, and fails with the file and the problem if one doesn't resolve, including a question, answer or field that doesn't exist.
