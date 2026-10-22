// The fixed parts of the vending exercise's Move package. Plain TypeScript with
// no imports, so scripts/prepare-move.mjs can load it with Node's type stripping.

export const packageName = "feral_vending";

export const moveToml = `[package]
name = "${packageName}"
edition = "2024.beta"

[dependencies]
world = { local = "deps/world" }

[addresses]
${packageName} = "0x0"
`;

/** Placeholder item type IDs. Locked fixtures, not verified live assets. */
export const fixtures = {
  feralData: { label: "Feral Data", typeId: "77800" },
  eu40: { label: "EU-40", typeId: "78437" },
} as const;

/**
 * A teaching stub of the world contracts: only the types and functions the
 * generated module calls, with the same shapes as the real ones. It compiles,
 * but it isn't the world, so a build against it proves the module type-checks,
 * not that it would work on chain.
 */
export const worldStub: Record<string, string> = {
  "deps/world/Move.toml": `[package]
name = "world"
edition = "2024.beta"

[addresses]
world = "0x0"
`,
  "deps/world/sources/character.move": `module world::character;

public struct Character has key {
    id: UID,
}
`,
  "deps/world/sources/inventory.move": `module world::inventory;

public struct Item has key, store {
    id: UID,
    type_id: u64,
    quantity: u64,
}

public fun type_id(item: &Item): u64 { item.type_id }

public fun quantity(item: &Item): u64 { item.quantity }

public(package) fun mint(type_id: u64, quantity: u64, ctx: &mut TxContext): Item {
    Item { id: object::new(ctx), type_id, quantity }
}

public(package) fun burn(item: Item) {
    let Item { id, type_id: _, quantity: _ } = item;
    id.delete();
}
`,
  "deps/world/sources/storage_unit.move": `module world::storage_unit;

use world::character::Character;
use world::inventory::{Self, Item};

public struct StorageUnit has key {
    id: UID,
}

/// Moves an item into the storage unit for an authorised extension.
public fun deposit_item<Auth: drop>(
    _storage_unit: &mut StorageUnit,
    _character: &Character,
    item: Item,
    _auth: Auth,
    _ctx: &mut TxContext,
) {
    inventory::burn(item);
}

/// Takes items out of the storage unit for an authorised extension.
public fun withdraw_item<Auth: drop>(
    _storage_unit: &mut StorageUnit,
    _character: &Character,
    type_id: u64,
    quantity: u64,
    _auth: Auth,
    ctx: &mut TxContext,
): Item {
    inventory::mint(type_id, quantity, ctx)
}
`,
};
