---
description: How to write glossary terms and library sections, in GitBook or in Git.
---

# Writing for this space

Pages here are Markdown. Edit them in GitBook or in the repository; Git Sync keeps both in step. Lessons on the site pull these pages in, so a change here shows up in every lesson that uses the page.

## Where things go

| File | What it holds | How lessons use it |
| --- | --- | --- |
| `glossary.md` | Every term, A to Z, on one page. | Term links with a preview, and definition cards |
| `concepts/{slug}.md` | One article per term that needs more than a definition. | The term's own page on the site |
| `library/pillar-N/` | Short sections, filed by pillar, that more than one lesson needs. Any folders below work. | Dropped in whole |

## The glossary entry

The site reads `glossary.md` strictly. Each entry is exactly this, under its letter group (`## A` to `## Z`, or `## #` for terms that start with a symbol):

```markdown
### Smart Assembly

*Smart Assemblies, Sui & Move · also: assembly*

An in-game structure that lives onchain as an object. Anyone can read it, and its owner can extend it.

[Read the article →](concepts/smart-assembly.md)
```

- **Heading:** the term, written as it should appear. Its slug is GitBook's heading slug: lowercase, spaces become hyphens, punctuation is dropped. Renaming a term changes its slug and breaks links to it.
- **Topics line,** in italics. One or more of `Game & economy`, `Sui & Move`, `Smart Assemblies`, `Wallet & identity` and `dApps & tools`, spelled exactly, main topic first. Each shows as a tag and filters the index.
- **Aliases** go on the same line after ` · also: `, separated by commas: other names, not plurals.
- **`no highlight`** on the same line keeps the term in the glossary but out of automatic highlighting, for words the site uses all the time: `*Game & economy · no highlight*`.
- **Definition:** one to three short sentences, plain text.
- **Article link:** optional and always last, exactly `[Read the article →](concepts/<slug>.md)`.

The site build fails on an unknown topic, a missing definition, a duplicate slug or an article that isn't in `SUMMARY.md`.

## Writing an article

An article is for a term that needs real explanation. Give it a description and a `# Title`, then three to five short `##` sections. Link to terms with `../glossary.md#slug` and to other articles with `slug.md`; the terms you link become the article's related terms. The site adds where the term is taught, so don't write that section yourself.

## Linking a term from a library section

```markdown
Code you deploy eventually runs on [Stillness](../../glossary.md#stillness).
```

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

## Quoting the EVE Frontier builder docs

A section can quote the official builder docs instead of copying them:

````markdown
```excerpt
source: builder-documentation
file: eve-vault/wallets-and-identity.md
heading: Seamless Onboarding with zkLogin
```
````

GitBook shows this as a small code block. The site replaces it with that section, pinned to the version recorded in `vendor/manifest.json`. A file has to be in the snapshot first, so ask an engineer to add new ones.

## What isn't supported

Other GitBook blocks, such as cards, steppers and embeds, don't appear on the site yet. The site build fails if a page uses one, so the problem shows up before it goes live.
