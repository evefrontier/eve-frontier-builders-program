# Glossary

## B

### Builder

*Game & economy*

A player who makes things for the Frontier beyond flying in it: structures, the code that runs them, or tools and sites for other players.

## C

### Continuous Delivery

*dApps & tools · also: CD, Continuous Deployment*

A software engineering practice where code changes are automatically built, tested, and prepared for release to production. Ensures that applications and smart contract packages can be reliably deployed at any time.

### Continuous Integration

*dApps & tools · also: CI*

A software development practice where developers frequently merge code changes into a shared repository, triggering automated builds and tests. Catches integration errors and regressions early before code is merged or published.

## D

### dApp

*dApps & tools, Smart Assemblies · also: decentralized application, decentralized app*

A decentralized application built to interact with EVE Frontier onchain state and Smart Assemblies. Runs frontend code communicating with Sui to manage smart storage, trade assets, or trigger custom in-game behavior.

### Devnet

*Sui & Move · also: devnet*

A Sui test network intended for early-stage development and experimentation. It is wiped and reset frequently, typically with 1-hour epochs, making it unsuitable for persistent deployments.

[Read more in the Sui Docs →](https://docs.sui.io/develop/sui-architecture/networks)

## E

### Ed25519

*Sui & Move · also: ed25519*

A high-performance elliptic curve signature scheme using Curve25519. It is the default signing scheme on Sui for user accounts and transactions, offering fast verification and compact signatures verified natively onchain via `sui::ed25519`.

[Read more in the Sui Docs →](https://docs.sui.io/develop/cryptography/signing)

### Entity

*Smart Assemblies, Sui & Move · also: entities*

An onchain representation of an in-game character or structure in EVE Frontier world contracts. Components and actions attach to it as dynamic fields, allowing dynamic behavior extensions without altering the underlying Move type.

### Epoch

*Sui & Move*

A fixed period of about 24 hours on Sui during which the set of validators, and the reference gas price, stays the same. When an epoch ends, the network moves to the next one, updating validators, staking rewards and gas pricing.

[Read more in the Sui Docs →](https://docs.sui.io/develop/sui-architecture/epochs)

### Equivocation

*Sui & Move*

Giving conflicting information for the same message or state, such as inconsistent or duplicate voting by a validator, or submitting competing transactions that spend the same version of an owned object (which locks the object until the next epoch).

[Read more in the Sui Docs →](https://docs.sui.io/references/sui-glossary#equivocation)

### EVE Vault

*Wallet & identity, dApps & tools · also: eve-vault, Eve Vault*

The official standalone wallet client for EVE Frontier. It integrates zkLogin and local key custody to let players manage assets, authenticate sessions, and sign transactions in the Frontier ecosystem.

## G

### GraphQL

*Sui & Move, dApps & tools · also: graphql*

A query language and schema-driven RPC service used in Sui to fetch structured blockchain data. Replaces legacy JSON-RPC with granular, typed queries that let frontends and indexers request exactly the fields and nested objects they need in a single call.

[Read more in the Sui Docs →](https://docs.sui.io/develop/accessing-data/graphql/query-with-graphql)

### Groth16

*Sui & Move*

A pairing-based zero-knowledge proof system (zk-SNARK) with succinct proof sizes and fast verification times. Sui provides Move native APIs to verify Groth16 proofs onchain over BN254 and BLS12-381 curves.

[Read more in the Sui Docs →](https://docs.sui.io/develop/cryptography/groth16)

### gRPC

*Sui & Move, dApps & tools · also: grpc*

A high-performance remote procedure call framework powered by Protocol Buffers and HTTP/2. In Sui, it provides low-latency, streaming access to real-time network events, transactions, and state changes for custom indexers and full-node operators.

[Read more in the Sui Docs →](https://docs.sui.io/develop/accessing-data/grpc/what-is-grpc)

## H

### Hot Potato

*Sui & Move · also: hot potato pattern*

A Move struct with no abilities (`has key`, `store`, `copy`, or `drop`). Because it cannot be dropped, stored, or transferred, it must be consumed by a matching function within the same transaction, guaranteeing that multi-step workflows like flash loans complete atomically.

## I

### Indexer

*Sui & Move, dApps & tools*

A component that maintains a searchable index of objects and transactions within its scope. Part of the broader Sui architecture, with community and application-specific implementations in EVE Frontier such as Ocky's Frontier Indexer.

[Read more in the Sui Docs →](https://docs.sui.io/develop/accessing-data/custom-indexer/custom-indexers)

## L

### Localnet

*Sui & Move, dApps & tools · also: localnet, local network*

A local, single-validator Sui network instance running on a developer's machine (e.g. via `sui start`). Provides instantaneous transaction finality and free local gas tokens for rapid testing and smart contract debugging.

[Read more in the Sui Docs →](https://docs.sui.io/getting-started/onboarding/local-network)

## M

### Mainnet

*Sui & Move · also: mainnet*

The primary production Sui blockchain network where transactions incur real financial value and state persists permanently across real validator nodes.

[Read more in the Sui Docs →](https://docs.sui.io/develop/sui-architecture/networks)

### MVR

*Sui & Move, dApps & tools · also: Move Verification Registry, Move Registry*

The Move Verification Registry on Sui. An onchain registry and package indexing system providing human-readable names, package discovery, and cryptographic source-code verification for published Move packages.

[Read more in the Sui Docs →](https://docs.sui.io/sui-stack/mvr/move-registry)

## N

### Nautilus

*Sui & Move, dApps & tools · also: nautilus*

A framework and ecosystem toolkit for verifiable offchain computing and oracle services on Sui. Leverages Trusted Execution Environments (TEEs) to execute complex, gas-intensive logic offchain and attest cryptographic results back onchain.

[Read more in the Sui Docs →](https://docs.sui.io/sui-stack/nautilus/nautilus-overview)

## O

### Object Registry

*Smart Assemblies, Sui & Move · also: object-registry, ObjectRegistry*

A core shared registry in EVE Frontier world contracts that deterministically maps in-game entity keys (`id + tenant`) to onchain derived object IDs, ensuring each game asset has exactly one canonical address on Sui.

### OIDC

*Wallet & identity · also: OpenID Connect*

An identity authentication standard built on OAuth 2.0 that allows third-party applications to verify user identity via identity providers like Google or Apple. Used extensively in Sui and EVE Frontier to power zkLogin without exposing user credentials.

## P

### Package

*Sui & Move · also: packages, Move package*

The fundamental deployment unit of smart contract code on Sui, consisting of a set of Move modules defined in a `Move.toml` project. When compiled and published, a package becomes an immutable onchain object with a unique package ID.

[Read more in the Sui Docs →](https://docs.sui.io/develop/write-move/package-overview)

### Private Key

*Wallet & identity, Sui & Move · also: secret key*

A secret cryptographic key used to authorize transactions and prove ownership of onchain assets. While traditional crypto accounts require users to safeguard raw private keys directly, EVE Frontier predominantly uses zkLogin with OIDC, abstracting private key management behind standard OAuth logins.

### Programmable Transaction Block

*Sui & Move · also: PTB, Programmable Transaction Blocks*

A sequence of commands executed together in a single atomic transaction on Sui. Outputs from earlier commands can feed into later ones, allowing developers to chain operations and manage objects or coins without deploying a dedicated smart contract.

[Read more in the Sui Docs →](https://docs.sui.io/develop/transactions/ptbs/prog-txn-blocks)

## S

### Seal

*Sui & Move, dApps & tools · also: seal, Sui Stack Seal*

A secure key management and access delegation service on Sui that uses threshold encryption and key servers to manage secret keys, automate transaction signing, and protect sensitive application operations.

[Read more in the Sui Docs →](https://docs.sui.io/sui-stack/seal/sui-stack-seal)

### Secp256k1

*Sui & Move · also: secp256k1*

The Koblitz elliptic curve signature algorithm popularized by Bitcoin and Ethereum. Sui natively supports both recoverable and non-recoverable Secp256k1 signature verification in Move via `sui::ecdsa_k1`, enabling compatibility with EVM wallets and keys.

[Read more in the Sui Docs →](https://docs.sui.io/develop/cryptography/signing)

### Secp256r1

*Sui & Move · also: secp256r1, NIST P-256, p256*

A NIST-standardized elliptic curve signature scheme widely implemented in modern hardware security modules, Apple Secure Enclave, Android Keystore, and WebAuthn/passkeys. Sui verifies Secp256r1 onchain via `sui::ecdsa_r1`, allowing passkeys to sign transactions directly.

[Read more in the Sui Docs →](https://docs.sui.io/develop/cryptography/signing)

### Shared Object

*Sui & Move · also: shared objects*

A mutable onchain object accessible by any transaction or caller rather than owned by a single address. Modifying shared objects requires ordering through Sui's global consensus layer to sequence competing interactions.

[Read more in the Sui Docs →](https://docs.sui.io/develop/objects/object-ownership/shared)

### Sponsorship

*Sui & Move, Wallet & identity · also: sponsored transaction, sponsored transactions*

A mechanism where a sponsor account pays the gas fees for another user's transaction. Enables onboarding users and subsidizing player interactions without requiring them to hold native SUI tokens first.

[Read more in the Sui Docs →](https://docs.sui.io/develop/transaction-payment/sponsor-txn)

### Static Site Generation

*dApps & tools · also: SSG, static generation*

A web development build method where HTML, JavaScript, and CSS assets are pre-rendered at build time rather than dynamically on each request. Produces fast, secure, and cacheable sites easily hosted on CDNs or decentralized storage like Walrus Sites.

### SuiScan

*dApps & tools · also: suiscan, explorer*

A community-popular block explorer and analytics platform for the Sui network, providing detailed views into transactions, packages, object states, validators, and metrics across mainnet and testnets.

### SuiVision

*dApps & tools · also: suivision, explorer*

A comprehensive Sui blockchain explorer and analytics dashboard that tracks onchain activity, token transfers, package source code, and DeFi protocol statistics.

## T

### Tenant

*Game & economy, Sui & Move · also: tenants*

An isolated environment or server namespace within EVE Frontier world contracts, combined with an in-game ID to uniquely scope entities and registries. The primary live game tenant is `stillness`.

### Testnet

*Sui & Move · also: testnet*

The primary public testing network for Sui that mirrors mainnet topology and features. Maintained with stable validator sets and free testnet faucet tokens to validate applications and smart contracts before mainnet launch.

[Read more in the Sui Docs →](https://docs.sui.io/develop/sui-architecture/networks)

### Typed Witness

*Sui & Move · also: witness, witness pattern, one-time witness*

A Move design pattern where a function requires an instance of an ephemeral struct to prove authority or type ownership. Because only the module defining a struct can instantiate it, passing a witness confirms that the caller operates with that module's permission.

## V

### Validator

*Sui & Move · also: validators*

A node operator securing the Sui network by verifying transactions, voting on certificates, and participating in consensus. Unlike continuous miners, Sui validators are invoked directly by incoming transactions and certificates.

[Read more in the Sui Docs →](https://docs.sui.io/references/sui-glossary#validator)

### Verifiable Random Function

*Sui & Move · also: VRF, Verifiably Random Function*

A cryptographic primitive that generates unpredictable random outputs along with a proof of correctness that anyone can verify. Used in gaming and onchain logic (such as ECVRF in Sui) to ensure provably fair randomness.

[Read more in the Sui Docs →](https://docs.sui.io/develop/cryptography/ecvrf)

## W

### Wallet

*Wallet & identity, dApps & tools · also: crypto wallet*

Software or hardware that manages cryptographic keys, displays balances, and signs transactions to interact with blockchain networks and dApps.

[Read more in the Sui Docs →](https://docs.sui.io/onchain-finance/asset-custody/wallets/what-is-a-wallet)

### Wallet Drainer

*Wallet & identity, dApps & tools · also: drainer*

A malicious smart contract or phishing script designed to trick users into signing transactions that transfer their coins, NFTs, or authority away to an attacker.

### Walrus

*Sui & Move, dApps & tools · also: walrus, Walrus Protocol, Walrus Sites*

A decentralized blob storage protocol and network optimized for large binary data and media files, coordinated by smart contracts on Sui. Often paired with Walrus Sites to host decentralized web applications directly from onchain references.

[Read more in the Sui Docs →](https://docs.sui.io/sui-stack/walrus/sui-stack-walrus)

### World Contracts

*Smart Assemblies, Sui & Move · also: world-contracts*

The core smart contracts deployed on Sui that define the rules, objects, and physics of EVE Frontier. Maintained by Fenris Creations, they provide the baseline types and extension points that builder applications build upon.

## Z

### zkLogin

*Wallet & identity*

A Sui sign-in that turns an ordinary account login into a blockchain identity, so players can act onchain without setting up a wallet first.

[Read more in the Sui Docs →](https://docs.sui.io/sui-stack/zklogin-integration/zklogin)
