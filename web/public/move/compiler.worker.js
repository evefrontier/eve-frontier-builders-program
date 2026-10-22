// Compiles the vending exercise's Move package off the main thread. A plain
// module worker beside the compiler's own files, which scripts/prepare-move.mjs
// copies into ./zktx/, so no bundler touches the WASM. Messages are typed in
// web/exercises/feral-vending/build-messages.ts.

import { dumpMovePackage, getPinnedSuiVersion, initMovePackageBuilder } from "./zktx/index.js";

// Must match scripts/prepare-move.mjs
const WASM_SHA256 = "703827f9d4ed734341419a4f04c1fdadb38ea7d4fcb6f0dcf758f5d31b5e0941";

let ready = null;

/** Loads the WASM, checks it's the pinned build, and loads the pre-resolved dependencies. Once per worker. */
function prepare() {
  ready ??= (async () => {
    const [wasm, dependencies] = await Promise.all([
      fetch(new URL("./zktx/sui_move_wasm_bg.wasm", import.meta.url)).then((response) => response.arrayBuffer()),
      fetch(new URL("./dependencies.json", import.meta.url)).then((response) => response.json()),
    ]);
    const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", wasm))]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    if (hash !== WASM_SHA256) throw new Error("The compiler didn't match its pinned hash, so it wasn't run.");
    await initMovePackageBuilder({ wasm });
    return { dependencies, suiVersion: await getPinnedSuiVersion({ wasm }) };
  })().catch((error) => {
    ready = null;
    throw error;
  });
  return ready;
}

self.onmessage = async ({ data }) => {
  const { revision, files } = data;
  try {
    const { dependencies, suiVersion } = await prepare();
    const result = await dumpMovePackage({
      files,
      network: dependencies.network,
      resolvedDependencies: {
        files: JSON.stringify(files),
        dependencies: dependencies.dependencies,
        lockfileDependencies: dependencies.lockfileDependencies,
      },
    });
    if ("error" in result) {
      postMessage({ revision, ok: false, error: result.error });
      return;
    }
    postMessage({
      revision,
      ok: true,
      bytes: result.modules.reduce((sum, module) => sum + atob(module).length, 0),
      digest: result.digest.map((byte) => byte.toString(16).padStart(2, "0")).join(""),
      suiVersion,
      warnings: result.warnings || undefined,
    });
  } catch (error) {
    postMessage({ revision, ok: false, error: error instanceof Error ? error.message : String(error) });
  }
};
