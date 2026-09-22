# Schedule A — Scope of Deliverables

## Context

As part of the EVE Frontier Builder Program, the Contractors will design and deliver Layer 1 of the Builder Program, consisting of the core learning spine, module architecture, learning content and agreed MVP builder-enablement components described in this document.

The goal is to support onboarding and progression across multiple builder profiles, ranging from non-developers to advanced technical contributors.

The intention is to build a lightweight, modular, and maintainable learning and enablement layer that integrates with existing EVE Frontier systems, documentation, workflows, and community infrastructure.

## High-Level Objectives

The learning spine should:

- Keep the curriculum high-level and focus on AI/agentic coding rather than low-level technical detail.
- Reduce onboarding friction for new builders
- Support multiple technical levels and onboarding paths
- Teach EVE Frontier systems in a Frontier-first context
- Integrate Sui and Move learning into real EVE Frontier scenarios
- Support self-paced progression
- Remain lightweight and maintainable internally
- Allow Fenris/community teams to update and iterate content without heavy engineering dependency
- Support future integrations with workshops, hackathons, recordings, and live sessions
- Support the long-term growth of the Frontier builder ecosystem

## MVP Direction

Keep the MVP intentionally lightweight and operationally maintainable. The goal is to establish:

- A clear learning progression
- Multiple onboarding pathways for different builder profiles
- Reduced onboarding friction
- Reusable learning infrastructure
- A foundation that can evolve alongside EVE Frontier and the Builder ecosystem

The MVP should focus on combining documentation, examples, starter projects, and lightweight interactive experiences rather than building a fully custom learning platform.

- **Pillar 0 and Pillar 1:** Primarily documentation, videos, guided workflows, and reference materials. Pillar 1 also establishes the foundational AI-assisted and low-code workflows. These workflows will also be integrated into Pillars 2 to 4 through relevant exercises, examples and guidance.
- **Pillar 2 and Pillar 3:** Interactive where appropriate through examples, exercises, starter projects, and practical exploration of Frontier and Sui concepts.
- **Pillar 4:** Practical implementation, Smart Assembly development, deployment workflows, and Frontier-specific integrations.

## MVP Deliverables

- An interactive GraphQL learning component that allows users to execute and modify a curated set of example queries against agreed EVE Frontier and/or Sui endpoints. The component will not include a custom GraphQL backend, new production APIs, or account-specific data access unless separately agreed in writing.
- Starter project repositories and templates for common builder workflows.
- Browser-accessible learning workflows
- Lightweight interactive exercises where appropriate
- Mermaid diagrams for architecture visualisation, workflows, and learning pathways.
- Embedded code examples, guided walkthroughs and runnable playgrounds for learning and experimentation.
- Reusable UI and component examples where appropriate.
- Codespaces-ready development environments to reduce onboarding friction and environment setup complexity.
- Embedded recordings, walkthroughs, and guided learning content.
- Lightweight validation and CI workflows for documentation, examples, and starter projects.
- Low-code configuration and builder experiences where appropriate.

The goal is to evolve the current documentation experience into a more interactive builder portal while preserving the existing GitBook and Git Sync ecosystem and maintaining a lightweight operational footprint.

## Technical Considerations

### Current Technical Direction

- GitBook remains the primary learning surface and documentation platform.
- Existing Git Sync and repository-based documentation workflows should be preserved.
- The MVP should build around the current documentation ecosystem rather than introducing a documentation platform migration.
- Existing documentation covering Sui, Move, Smart Contracts, Smart Assemblies, dApps, EVE Vault, tooling, and troubleshooting should be leveraged wherever possible.
- Documentation and learning content should remain modular, reusable, and easy to maintain.

### Important Operational Considerations

- Fenris and Community teams should be able to update modules and content internally with minimal engineering support.
- Avoid heavy engineering overhead where unnecessary.
- Avoid building a fully custom LMS unless there is a clear long-term need.
- Leverage existing platforms, tooling, and learning resources wherever possible.
- Ensure content and module structures remain extensible over time.
- Keep operational ownership lightweight and maintainable.
- Ensure content can evolve alongside Frontier systems, APIs, and builder workflows.
- Documentation, examples, and learning assets should be designed for long-term maintainability and reuse.

### Potential Future Features (Not MVP)

The following are considered future/optional areas and are not currently assumed to be part of the MVP scope:

- Full certification systems
- Heavy progress tracking
- Advanced analytics
- Automated grading
- Fully embedded execution environments
- Full browser-native development environments
- Advanced gamification systems
- Dynamic account progression systems
- Deep platform integrations
- Automated Grace reward integration
- Advanced AI-agent and MCP integrations
- Community reputation and builder achievement systems

## Curriculum, Pillars & Builder Progression

### Learning Structure

The structure is currently divided into five connected learning pillars. **The five-pillar structure is the approved baseline.** Reasonable changes may be made during the discovery phase by written agreement between the parties, provided they do not materially expand the scope.

These are intended to function as progressive layers that build on top of one another. The overall progression is intended to take builders from:

- Understanding the Frontier,
- Building in the Frontier,
- Accelerate development through AI-assisted workflows.

### Builder Progression

Builders should be enabled to start with the minimum working environment and tools, using low-code, agentic, or traditional development workflows depending on their experience level.

The Builder Program should provide multiple entry points while encouraging progression toward a deeper understanding of Frontier systems, APIs, dApp development, and Sui Move. As builders develop their skills, they should be encouraged to progress toward increasingly advanced concepts and implementation patterns within the EVE Frontier ecosystem.

### Pillar 0 — Frontier Builder Foundations

**Focus**

Understanding the bare minimum required to rationalize about being a builder in the EVE Frontier ecosystem:

**Areas Covered**

- Where to find the Sui Move docs
- Where to get help
- How Wallets Work and staying safe on chain
- Where different data is located (Resource Files, GraphQL, World API, etc.)
- Why indexers exist

### Pillar 1 — Agentic Coding and Low Code for EVE Frontier

**Focus**

Exploring how AI-assisted workflows and "low-code" platforms can lower onboarding friction and accelerate builder iteration within the Frontier ecosystem, especially for new builders.

This pillar focuses on helping builders learn, prototype, debug, and iterate faster through the use of modern AI-assisted and low-code development workflows. The goal is not to replace understanding of Frontier systems, but to provide additional pathways into the builder ecosystem and reduce barriers to participation.

**Definitions**

- **Low-Code:** Low-code refers to builder workflows that reduce the need to write code directly through the use of visual tools, configuration-driven systems, templates, guided workflows, and other abstractions that simplify development. Examples may include Frontier Flow, Easy Assemblies, starter templates, and other visual or configuration-based builder experiences.
- **Agentic Development:** Agentic development refers to the use of AI-assisted tools and workflows to help builders learn, generate, debug, and iterate on code and systems more effectively. Examples may include Cursor, Claude Code, ChatGPT, GitHub Copilot, MCP-enabled workflows, and other AI-assisted development environments.

**Areas Covered**

- Prompt-driven workflows
- Introduction to AI-assisted development workflows, with more advanced Move-specific application introduced in Pillars 3 and 4.
- Rapid prototyping and vibe coding
- AI-supported debugging and iteration
- AI-assisted documentation and knowledge discovery
- Structured prompting for builders
- Frontier Flow and other low-code builder experiences
- Visual and configuration-driven development concepts
- Non-developer builder workflows
- MCP-enabled and agent-assisted development workflows
- Using AI responsibly and validating generated code

**Goal**

Enable:

- Technically curious non-developers
- Intermediate builders
- Advanced builder/contributors

...to meaningfully participate in the Frontier builder ecosystem using modern AI-assisted and low-code development workflows. The goal is to:

- Reduce onboarding friction
- Accelerate learning and iteration
- Expand the number of people capable of building within the ecosystem
- Provide multiple pathways into builder development depending on skill level and experience
- Enable non-developers to create meaningful Frontier experiences through AI-assisted and low-code workflows
- Encourage progression toward a deeper understanding of Frontier systems, APIs, dApp development, and Sui/Move

**Example Learning Areas**

Examples of topics that may be covered within this pillar include:

- Setting up an AI-assisted development environment
- Cursor, Claude Code, Copilot and other AI coding tools
- MCP-enabled workflows and tool integrations
- Prompt-based builder workflows
- Structured prompting for Frontier development
- AI-assisted documentation and knowledge discovery
- AI-assisted Move development
- AI-supported debugging and iteration
- Rapid prototyping and vibe coding
- Frontier Flow and other low-code builder experiences
- Visual and configuration-driven development concepts
- Beginner-to-builder progression flows
- Responsible use of AI and validation of generated code

### Pillar 2 — Frontier Systems & World Interaction

**Focus**

Understanding the EVE Frontier world and how builders interact with it at a deeper level, building on the workflows introduced in Pillar 1 while developing a strong mental model of the Frontier ecosystem.

This pillar establishes the foundational understanding required before introducing Sui Move development, Smart Assembly implementation, and advanced Frontier-specific tooling. The focus is on understanding how the world works, where data lives, how systems interact, and where builders can create value.

**Areas Covered**

- Understanding the EVE Frontier world
- Persistent and shared world concepts
- Digital physics and system constraints
- Smart Objects and Smart Assemblies
- Reading and interacting with world state
- GraphQL, World API and data interaction patterns
- Deployment realities and operational constraints
- Builder tooling and environment setup
- Understanding where builders can create value

**Goal**

Builders should:

- Understand the Frontier ecosystem
- Understand how world systems interact
- Understand where/how builders can create value
- Understand the operational and technical constraints before building

**Module Structure — Foundation Modules**

- Start Here: The Builder Program
- Why Build on EVE Frontier
- Understanding the EVE Frontier World
- Core Concepts: Smart Assemblies
- Builder Constraints
- World APIs & Data Interaction
- Tooling & Builder Environment Setup

### Pillar 3 — Move & Sui

**Focus**

Pillar 3 will teach general Sui and Move fundamentals through examples that are relevant to EVE Frontier where appropriate. The modules should remain usable as standalone foundational learning materials and may adapt selected content from the existing Sui bootcamp materials.

**Areas Covered**

- Sui fundamentals
- Object-centric architecture
- Move language basics
- Transaction fundamentals
- Basic Sui client interaction

**Goal**

Builders should:

- Be able to use an editor (VSCode/IntelliJ) to write a "Hello Frontier" contract
- Run a localnet on their machine
- Understand the difference between localnet, devnet, testnet and mainnet
- Get testnet funds to be able to deploy
- Deploy "Hello Frontier" to localnet and testnet
- Describe the basic features of a Sui and Move contract (objects, visibility, borrowing, control flow, etc.)
- Understand how to get help, and diagnose problems
- Understand how to use AI-assisted tools to accelerate learning and development while maintaining a solid understanding of the underlying concepts.
- Frontier World deployment

**Inspiration**

Existing examples such as [First Move](https://evefrontier.space/move/learn) — a free, interactive, browser-based course for learning Move on Sui, built for the EVE Frontier × Sui Hackathon 2026 — demonstrate the type of contextualized and browser-accessible learning experience that appears directionally strong for this initiative. Relevant elements include:

- Progressive curriculum
- Browser-based onboarding
- Interactive code examples
- Frontier-contextualized teaching
- Low-friction learning flow

**Module Structure — Move Modules**

- Sui & Move Fundamentals
- Wallets, Vaults & Identity
- Understanding Sui Objects
- Move Fundamentals
- Localnet, Testnet & Mainnet
- Your First Move Contract
- Deploying to Sui
- Debugging & Troubleshooting
- Preparing for Frontier Development

### Pillar 4 — Move & Sui in the context of EVE Frontier

**Focus**

Extend Pillar 3 by applying Sui and Move concepts directly within the EVE Frontier ecosystem.

This pillar focuses on the Frontier-specific systems, patterns, workflows, and deployment processes required to build, extend, and interact with the Frontier world. Builders should transition from understanding generic Sui development to understanding how Sui and Move are used within EVE Frontier.

**Areas Covered**

- Frontier-specific Move patterns
- Smart Assemblies and extensions
- World Contracts
- Wallets, Vaults & Identity in EVE Frontier
- Sponsored transactions
- Working with Frontier repositories
- Deployment lifecycle and automation
- Local development vs Stillness deployment
- Testing and validation workflows
- Frontier APIs and on-chain interaction patterns

**Goal**

Builders should:

- Understand how Move is used within EVE Frontier
- Understand the relationship between Frontier systems and on-chain systems
- Understand the role of World Contracts, Smart Assemblies, and Frontier-specific development patterns
- Be capable of deploying the Frontier World to their localnet from Pillar 3
- Be capable of deploying basic Smart Assembly Extensions
- Be capable of interacting with Frontier APIs and world data
- Understand the deployment journey from local development to Stillness
- Progress from conceptual understanding to practical implementation

**Module Structure**

- From Move Fundamentals to Frontier Development
- Understanding World Contracts
- Working with World Repositories
- Move for EVE Frontier Builders
- Your First Smart Assembly
- Sponsored Transactions & Identity
- Advanced Smart Assemblies
- Advanced Sui Features in EVE Frontier
- Testing & Validation
- From Build to Stillness
