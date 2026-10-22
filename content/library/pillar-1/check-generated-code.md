---
description: The four checks before trusting generated code.
---

# Check generated code

Before you trust code a tool generated for you:

1. **Read it.** If you can't explain a line, find out before going further.
2. **Build it** with `sui move build`, and don't accept a build that only passes because checks were removed.
3. **Test it on localnet,** then on testnet.
4. **Only then** think about [Stillness](../../glossary.md#stillness).
