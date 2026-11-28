---
description: Explain how a connected item type controls a deposit rule, then apply it to a different caller.
duration: 10 min
exercise: inventory-deposit-rule.yaml
---

# Inventory: Deposit rules

## Learning objectives

- Connect an item type to a deposit rule.
- Read the generated Move to see where the allowed type constant is defined and passed into the rule.
- Predict whether an incoming item passes the type check, and distinguish owner setup from caller use.

## How it works

A deposit rule checks an item's **type ID** before accepting it. A type ID identifies a kind of item (such as D1 [Fuel](glossary:fuel) or D2 Fuel), not a single item instance.

In the Workbench, wiring a fuel node into the deposit rule writes a Move constant named `ALLOWED_TYPE`:

```move
const ALLOWED_TYPE: u64 = 88335; // D1 Fuel
```

That constant is then passed into [`inventory::deposit_requirement`](https://github.com/evefrontier/world-contracts/blob/e1eff82e84f89d4ed66bbcfd5949c9f3a817bd99/contracts/inventory/sources/inventory.move#L450-L461) as an optional type filter:

```move
let rule = inventory::deposit_requirement(
    component_id,
    option::some(ALLOWED_TYPE), // only accept items with this type ID
    option::none(),             // any variant of this type
    option::none(),             // no minimum quantity
    option::none(),             // no maximum quantity
);
```

- `option::some(ALLOWED_TYPE)` tells the rule to accept only items whose type ID matches `ALLOWED_TYPE`.
- Changing the wire in the Workbench updates `ALLOWED_TYPE` — it changes what the rule *accepts*, not what the incoming item *is*.
- Removing the wire leaves no constant selected, so no Move rule is generated.

> **Example**
> Two separate D1 Fuel items both have type ID `88335`. Because the rule checks `ALLOWED_TYPE`, both pass when `ALLOWED_TYPE` is `88335`, and both are rejected when it is `88319` (D2 Fuel).

## Setup authority vs. caller deposits

In the generated Move, the owner's [capability](glossary:capability) (`owner_cap`) is checked via [`entity.verify_owner`](https://github.com/evefrontier/world-contracts/blob/e1eff82e84f89d4ed66bbcfd5949c9f3a817bd99/contracts/core/sources/entity.move#L182-L186) when calling [`entity.enable_action`](https://github.com/evefrontier/world-contracts/blob/e1eff82e84f89d4ed66bbcfd5949c9f3a817bd99/contracts/core/sources/entity.move#L267-L278) and [`entity.complete_request`](https://github.com/evefrontier/world-contracts/blob/e1eff82e84f89d4ed66bbcfd5949c9f3a817bd99/contracts/core/sources/entity.move#L416-L422) on the [Entity](glossary:entity):

```move
let mut req = entity.enable_action(action_name, action::new(vector[rule]), ctx);
entity.verify_owner(&mut req, owner_cap);
entity.complete_request(req);
```

That owner check protects who can *configure* the rule. Once enabled, a different caller can still pass the type check if they deposit a matching item type.

## Assumed preconditions

We make these assumptions so we can focus on **one code concept at a time** — how `ALLOWED_TYPE` filters deposits — without mixing in setup, docking, power, or storage-capacity code yet. The generated Move targets the `dev` branch of [World Contracts](glossary:world-contracts) ([`e1eff82e`](https://github.com/evefrontier/world-contracts/tree/e1eff82e84f89d4ed66bbcfd5949c9f3a817bd99)) and is uncompiled read-only source for inspection, not deployed on-chain. Passing this type check does not mean a full transaction succeeds on its own; the Workbench assumes:

- Owner configured the rule
- Source entity is docked with the target
- Target has a power grant
- Enough inventory space

Use the **Workbench** panel to wire a fuel type into the deposit rule, inspect the highlighted Move, and work through each step.
