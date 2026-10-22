---
description: The in-game structures that are also onchain objects, and the shape every one of them shares.
---

# Smart Assembly

A Smart Assembly is a structure you can fly up to in the game that is also an object on the chain. Gates, turrets and storage units are all Smart Assemblies, and they are where most building in the Frontier starts.

## Two views of the same thing

In the client, a Smart Assembly has a model, a position and a name. On the chain, it is an object with an ID, an owner, a state and whatever fields its type carries.

Those two views are the same thing. When a player jumps through a gate, the chain records it; when you read the gate, you are reading what the game itself will act on.

## What makes it smart

What makes an assembly smart is what it exposes: a state anyone can read, an owner the chain can check, and a place where your [Move](../glossary.md#move) code can answer the questions the game leaves open. Code you deploy there eventually runs on [Stillness](../glossary.md#stillness).
