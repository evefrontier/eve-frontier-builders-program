import { fixtures, moveToml, packageName } from "./package";

export const nodeIds = ["exchange", "accept", "dispense", "complete", "payment", "reward"] as const;
export type NodeId = (typeof nodeIds)[number];

export interface Quantities {
  payment: string;
  reward: string;
}

export const starterQuantities: Quantities = { payment: "10", reward: "1" };

const U64_MAX = (1n << 64n) - 1n;

/** Checks a quantity is a whole number from 1 to the largest u64. */
export function validateQuantity(value: string): string | null {
  if (!/^\d+$/.test(value.trim())) return "Enter a whole number.";
  const n = BigInt(value.trim());
  if (n < 1n) return "Must be at least 1.";
  if (n > U64_MAX) return "Too large for a u64.";
  return null;
}

export interface Generated {
  files: Record<string, string>;
  /** The module source, as shown to the learner. */
  source: string;
  /** 1-based line numbers each node produced. Lines with no node are shared scaffolding. */
  lines: Partial<Record<NodeId, number[]>>;
}

/**
 * Emits the vending module for the given quantities. The quantities become
 * module constants that the payment check and the reward withdrawal use, so
 * changing a value changes real logic, not just a label.
 */
export function generate(quantities: Quantities): Generated {
  const out: string[] = [];
  const lines: Partial<Record<NodeId, number[]>> = {};
  const emit = (code: string, node: NodeId | null = null) => {
    out.push(code);
    if (node) (lines[node] ??= []).push(out.length);
  };

  emit(`module ${packageName}::vending;`);
  emit("");
  emit("use world::character::Character;");
  emit("use world::inventory::Item;");
  emit("use world::storage_unit::StorageUnit;");
  emit("");
  emit(`const FERAL_DATA_TYPE_ID: u64 = ${fixtures.feralData.typeId};`, "accept");
  emit(`const EU40_TYPE_ID: u64 = ${fixtures.eu40.typeId};`, "dispense");
  emit(`const PAYMENT_QUANTITY: u64 = ${quantities.payment.trim()};`, "payment");
  emit(`const REWARD_QUANTITY: u64 = ${quantities.reward.trim()};`, "reward");
  emit("");
  emit("const EWrongItem: u64 = 0;", "accept");
  emit("const EWrongQuantity: u64 = 1;", "accept");
  emit("");
  emit("/// Proves to the storage unit that this module is the one acting.");
  emit("public struct VendingAuth has drop {}");
  emit("");
  emit("/// A player calls this with their payment and gets the reward back.", "exchange");
  emit("public fun exchange(", "exchange");
  emit("    storage_unit: &mut StorageUnit,", "exchange");
  emit("    character: &Character,", "exchange");
  emit("    payment: Item,", "exchange");
  emit("    ctx: &mut TxContext,", "exchange");
  emit("): Item {", "exchange");
  emit("    assert!(payment.type_id() == FERAL_DATA_TYPE_ID, EWrongItem);", "accept");
  emit("    assert!(payment.quantity() == PAYMENT_QUANTITY, EWrongQuantity);", "accept");
  emit("    storage_unit.deposit_item(character, payment, VendingAuth {}, ctx);", "accept");
  emit("");
  emit("    let reward = storage_unit.withdraw_item(", "dispense");
  emit("        character,", "dispense");
  emit("        EU40_TYPE_ID,", "dispense");
  emit("        REWARD_QUANTITY,", "dispense");
  emit("        VendingAuth {},", "dispense");
  emit("        ctx,", "dispense");
  emit("    );", "dispense");
  emit("");
  emit("    reward", "complete");
  emit("}", "complete");

  const source = `${out.join("\n")}\n`;
  return { files: { "Move.toml": moveToml, "sources/vending.move": source }, source, lines };
}
