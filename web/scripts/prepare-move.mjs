#!/usr/bin/env node
// Prepares what the in-browser Move compiler needs, so a learner's build never
// leaves the site.
//
//   node scripts/prepare-move.mjs          copy the compiler's browser build into public/move/zktx/ and
//                                          check its WASM hash (offline)
//   node scripts/prepare-move.mjs --deps   re-resolve the Sui framework and world stub into
//                                          public/move/dependencies.json (needs network; commit the result)

import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(web, "public", "move");
const lite = join(web, "node_modules", "@zktx.io", "sui-move-builder", "dist", "lite");

// sui_move_wasm_bg.wasm from @zktx.io/sui-move-builder 0.5.1; update with the package
const WASM_SHA256 = "703827f9d4ed734341419a4f04c1fdadb38ea7d4fcb6f0dcf758f5d31b5e0941";

await mkdir(out, { recursive: true });

const wasm = await readFile(join(lite, "sui_move_wasm_bg.wasm"));
const hash = createHash("sha256").update(wasm).digest("hex");
if (hash !== WASM_SHA256) {
  throw new Error(`sui_move_wasm_bg.wasm hash ${hash} doesn't match the pinned ${WASM_SHA256}`);
}

// Served as plain files so the worker can import them without a bundler; the
// three are self-contained and find each other by relative URL
await mkdir(join(out, "zktx"), { recursive: true });
for (const file of ["index.js", "sui_move_wasm.js", "sui_move_wasm_bg.wasm"]) {
  await copyFile(join(lite, file), join(out, "zktx", file));
}
console.log("copied the Move compiler to public/move/zktx/");

if (process.argv.includes("--deps")) {
  const { moveToml, worldStub } = await import("../exercises/feral-vending/package.ts");
  const builder = await import("@zktx.io/sui-move-builder");

  // Serve the world stub as the local `deps/world` package; everything else comes from GitHub
  class Fetcher extends builder.GitHubMovePackageFetcher {
    fetchLocal = async (localPath) => {
      const prefix = `${localPath.replace(/^\.\//, "").replace(/\/$/, "")}/`;
      return Object.fromEntries(
        Object.entries(worldStub)
          .filter(([path]) => path.startsWith(prefix))
          .map(([path, content]) => [path.slice(prefix.length), content]),
      );
    };
  }

  await builder.initMovePackageBuilder();
  const files = { "Move.toml": moveToml, "sources/vending.move": "module feral_vending::vending;\n" };
  const resolved = await builder.resolveMovePackageDependencies({
    files,
    network: "testnet",
    fetcher: new Fetcher(),
  });
  const json = JSON.stringify({
    builder: "@zktx.io/sui-move-builder@0.5.1",
    suiVersion: await builder.getPinnedSuiVersion(),
    network: "testnet",
    dependencies: resolved.dependencies,
    lockfileDependencies: resolved.lockfileDependencies,
  });
  await writeFile(join(out, "dependencies.json"), json);
  console.log(`resolved dependencies: ${(json.length / 1024).toFixed(0)} KB`);
}
