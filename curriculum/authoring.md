---
description: How to write glossary terms, articles and lessons, in GitBook or in Git.
---

# Writing for this space

Pages here are Markdown. Edit them in GitBook or in the repository; Git Sync keeps both in step. The site build checks every page, and fails with the file and the problem if something doesn't resolve.

## The glossary entry

The site reads `glossary.md` strictly. Each entry is exactly this, under its letter group (`## A` to `## Z`, or `## #` for terms that start with a symbol):

```markdown
### Smart Assembly

*Smart Assemblies, Sui & Move · also: assembly*

An in-game structure that lives onchain as an object. Anyone can read it, and its owner can extend it.

[Read the article →](glossary/smart-assembly.md)
```

- **Heading:** the term, written as it should appear. Its slug is GitBook's heading slug: lowercase, spaces become hyphens, punctuation is dropped. Renaming a term changes its slug and breaks links to it.
- **Topics line,** in italics. One or more of `Game & economy`, `Sui & Move`, `Smart Assemblies`, `Wallet & identity` and `dApps & tools`, spelled exactly, main topic first. Each shows as a tag and filters the index.
- **Aliases** go on the same line after ` · also: `, separated by commas: other names, not plurals.
- **`no highlight`** on the same line keeps the term in the glossary but out of automatic highlighting, for words the site uses all the time: `*Game & economy · no highlight*`.
- **Definition:** one to three short sentences, plain text.
- **Article link:** optional, after the definition, exactly `[Read the article →](glossary/<slug>.md)`.
- **Docs link:** optional, after the definition, for a term the official docs already explain: `[Read more in the Sui Docs →](https://docs.sui.io/...)`. It has to start `Read more in the` and end `Docs`, and the URL has to be `https://`. It can sit alongside an article link.

The site build fails on an unknown topic, a missing definition, a duplicate slug, or an article that isn't named after its term or isn't in `SUMMARY.md`.

## Writing an article

An article is for a term that needs real explanation. Save it as `glossary/<slug>.md`, add it to `SUMMARY.md` under the glossary, and link to it from the term's entry. Give it a description and a `# Title`, then three to five short `##` sections. Link to terms with `../glossary.md#slug` and to other articles with `slug.md`; the terms you link become the article's related terms. The site adds where the term is taught, so don't write that section yourself.

## Writing a lesson

A lesson is Markdown with a `description` and an optional `duration` in its frontmatter, then a `# Title`. Save it in `lessons/pillar-N/<course>/`, under the course it was written for, then add it to `SUMMARY.md` in the same place and to a module's `lessons` by file name. Link to a glossary term or another lesson by name:

```markdown
Your wallet is [EVE Vault](glossary:eve-vault). [Why indexers exist](lesson:why-indexers-exist) goes further.
```

These links don't work inside GitBook, only on the site.

## Dropping things in

| Block | Drops in |
| --- | --- |
| `glossary` | A term's definition, as a card |
| `excerpt` | A section of the pinned builder docs |
| `exercise` | An interactive exercise built into the site |

````markdown
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

An `excerpt` quotes the official builder docs instead of copying them, pinned to the version recorded in `reference/manifest.json`. A file has to be in the snapshot first, so ask an engineer to add new ones.

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

The build fails on a question, answer or field that doesn't exist.

## Hints

Use GitBook's hint block. The `info`, `success`, `warning` and `danger` styles are supported.

```markdown
{% hint style="danger" %}
Never share a recovery phrase.
{% endhint %}
```

## Tabs

```markdown
{% tabs %}
{% tab title="macOS" %}
Steps for macOS.
{% endtab %}
{% tab title="Windows" %}
Steps for Windows.
{% endtab %}
{% endtabs %}
```

## What isn't supported

Other GitBook blocks, such as cards, steppers, embeds and reusable content, don't appear on the site yet. The site build fails if a page uses one, so the problem shows up before it goes live.
