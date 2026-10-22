#!/usr/bin/env node
// Refreshes a vendored snapshot of another repository's files and records
// their hashes in vendor/manifest.json. Only this script touches the network;
// the site build verifies the hashes and never fetches.
//
//   node scripts/refresh-vendor.mjs builder-documentation             # files already listed, at the source's latest commit
//   node scripts/refresh-vendor.mjs builder-documentation --commit <sha>
//   node scripts/refresh-vendor.mjs builder-documentation --add tools/resources.md
//   node scripts/refresh-vendor.mjs --check                           # verify every hash, no network

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const vendorDir = join(root, "vendor");
const manifestPath = join(vendorDir, "manifest.json");

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    commit: { type: "string" },
    add: { type: "string", multiple: true, default: [] },
    check: { type: "boolean", default: false },
  },
});

const sha256 = (data) => createHash("sha256").update(data).digest("hex");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

if (values.check) {
  let failed = 0;
  for (const [name, source] of Object.entries(manifest.sources)) {
    for (const [path, hash] of Object.entries(source.files)) {
      const actual = sha256(await readFile(join(vendorDir, name, path)));
      if (actual !== hash) {
        console.error(`mismatch: ${name}/${path}`);
        failed++;
      }
    }
  }
  if (failed) process.exit(1);
  console.log("vendor snapshot matches manifest");
  process.exit(0);
}

const [name] = positionals;
const source = manifest.sources[name];
if (!source) {
  console.error(`unknown source "${name}"; known: ${Object.keys(manifest.sources).join(", ")}`);
  process.exit(1);
}

const commit = values.commit ?? (await latestCommit(source.repo, source.branch));
const paths = [...new Set([...Object.keys(source.files), ...values.add])].sort();
const files = {};

for (const path of paths) {
  const url = `https://raw.githubusercontent.com/${source.repo}/${commit}/${path}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} fetching ${url}`);
  const data = Buffer.from(await response.arrayBuffer());
  const target = join(vendorDir, name, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, data);
  files[path] = sha256(data);
}

manifest.sources[name] = { ...source, commit, files };
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${name}: ${paths.length} files at ${commit}`);

async function latestCommit(repo, branch) {
  const response = await fetch(`https://api.github.com/repos/${repo}/commits/${branch}`, {
    headers: { Accept: "application/vnd.github.sha" },
  });
  if (!response.ok) throw new Error(`${response.status} resolving ${repo}@${branch}`);
  return (await response.text()).trim();
}
