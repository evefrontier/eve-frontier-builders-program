# Tools and Standards

Shared tools used across every pillar, kept in one place — propose additions via PR (see [CONTRIBUTING.md](../CONTRIBUTING.md)).

## Documentation Platform

GitBook is the primary learning surface, kept in sync via Git Sync — see [scope.md](scope.md). This repo doesn't duplicate that content.

## Program Website

The program website in [`web/`](../web/) uses:

- [Next.js](https://nextjs.org/docs) with [React](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs) for styling
- [Node.js](https://nodejs.org/docs/latest-v24.x/api/) and [pnpm](https://pnpm.io/) for the development environment and package management

The pinned versions in [`web/package.json`](../web/package.json) and [`web/.nvmrc`](../web/.nvmrc) are the source of truth. See [Web Development](../README.md#web-development) for setup and validation commands.

## AI-Assisted & Low-Code Tooling (Pillar 1)

- Agentic tools — Cursor, Claude Code, ChatGPT, GitHub Copilot, MCP-enabled workflows
- Low-code — Frontier Flow, Easy Assemblies, starter templates
- Reference course — [First Move](https://evefrontier.space/move/learn), an interactive Move-on-Sui course built for the EVE Frontier × Sui Hackathon 2026

## Blockchain & Engine

- [CARBON Engine](https://github.com/carbonengine) — the game engine behind EVE Online and EVE Frontier
- [Sui Documentation](https://docs.sui.io/) and [EVE Frontier Builder Documentation](https://docs.evefrontier.com/) — the on-chain foundation (Move, object model, zkLogin, sponsored transactions)
- [Mysten Labs](https://www.mystenlabs.com/platforms-and-protocols) — Sui, Move, Walrus, and the other protocols the stack draws on

## Ecosystem Repos

- [`@evefrontier/component-library`](https://github.com/evefrontier/eve-frontier-component-library/pkgs/npm/component-library) — shared UI components
- [dapp-index](https://github.com/evefrontier/dapp-index) — publish and discover dapps
- [builder-scaffold](https://github.com/evefrontier/builder-scaffold) — starter templates and tooling
- [builder-documentation](https://github.com/evefrontier/builder-documentation) — deeper technical reference

Full org list: [github.com/orgs/evefrontier/repositories](https://github.com/orgs/evefrontier/repositories).
