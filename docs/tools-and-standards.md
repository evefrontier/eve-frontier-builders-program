# Tools and Standards

Shared tools and conventions used across every track in the Builders Program. Keeping these in one place means a change in a shared tool only needs to be documented once.

## Game Engine

- [CARBON Engine](https://github.com/carbonengine) — the open-source game engine underpinning EVE Online and EVE Frontier's persistent sandbox worlds (rendering, world simulation, networking, and other core systems). Builders working close to the simulation layer will find the engine's source here.

## Blockchain Foundation (Sui)

EVE Frontier's on-chain layer is built on Sui, using its object-based architecture and the Move language. Start here for the underlying platform docs:

- [EVE Frontier Builder Documentation](https://docs.evefrontier.com/) — the published builder docs site: why to build on EVE Frontier, Smart Assemblies, and how the Sui integration (object model, Move, zkLogin, sponsored transactions) fits together. Source lives in [builder-documentation](https://github.com/evefrontier/builder-documentation).
- [Sui Documentation](https://docs.sui.io/) — official docs for the Sui blockchain: Move package development, SDKs, and use cases like Walrus (storage) and zkLogin (onboarding).
- [Mysten Labs — Platforms & Protocols](https://www.mystenlabs.com/platforms-and-protocols) — overview of Sui, Move, Walrus, DeepBook, Seal, Enoki, and Kiosk, the protocols the Frontier stack draws on.
- [Mysten Labs — Products](https://www.mystenlabs.com/products) — wallets and consumer products built on Sui (Slush, SuiPlay0X1, SuiNS, and others), useful context for builders integrating wallets or identity.

## UI Components

Builder-facing apps and tools are encouraged to use the shared component library rather than reimplementing common UI patterns:

- [`@evefrontier/component-library`](https://github.com/evefrontier/eve-frontier-component-library/pkgs/npm/component-library) — the shared component package published under the `evefrontier` GitHub org (npm packages).

## Publishing and Discovery

- [dapp-index](https://github.com/evefrontier/dapp-index) — the Sui registry and Walrus-backed metadata flow builders use to publish dapps so players can discover them. Builders shipping a public tool or dapp should register it here.

## Starter Tooling

- [builder-scaffold](https://github.com/evefrontier/builder-scaffold) — templates and tooling (Docker or host-based) for building Smart Assemblies and dapps in EVE Frontier.

## Reference Documentation

- [builder-documentation](https://github.com/evefrontier/builder-documentation) — the canonical technical reference for building third-party modifications on EVE Frontier (Smart Assemblies, smart contracts, dapps, EVE Vault, and more).

## Adding to This List

This list will grow as the program adds tracks and as shared tooling evolves. Propose additions or corrections via a pull request — see [CONTRIBUTING.md](../CONTRIBUTING.md).
