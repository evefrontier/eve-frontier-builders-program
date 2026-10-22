---
duration: 1 min
description: "Garbage in, garbage out. AI learned from old information, and EVE Frontier changes with every update."
---

# Tell it where to look

```prompt
label: You might say
text: Before we start on {{idea.topic|my idea}}, find and read the official EVE Frontier builder docs written for AI, the Sui docs, and the world contracts and builder scaffold on GitHub, including what's changing in the next version on the dev branch. Tell me if anything I ask isn't possible.
```

A good AI can find these itself. Many docs sites publish a version written for AI, often a file called llms.txt.

## If your AI can't find them

- [EVE Frontier builder docs](https://docs.evefrontier.com/llms-full.txt): the whole builder documentation in one file, written for AI
- [World contracts](https://github.com/evefrontier/world-contracts): the rules of the world as code; the dev branch holds the next version
- [Builder scaffold](https://github.com/evefrontier/builder-scaffold): a small test version of the world on your own computer: a test character, a storage unit and two gates
- [Sui docs](https://docs.sui.io/llms.txt): the blockchain EVE Frontier runs on, written for AI
- [The Move Book](https://move-book.com/llms.txt): the language the world contracts are written in

```by-answer
answer: tool
variants:
  none: If your chat app can't open links, download the file and attach it.
  chat: If your chat app can't open links, download the file and attach it.
```
