import test from "node:test";
import assert from "node:assert/strict";
import { parseMarkdown } from "./markdown.ts";

test("allows https, single-slash internal, and glossary links while blocking javascript: and protocol-relative // URLs", () => {
  const blocks = parseMarkdown(
    "Visit [Docs](https://docs.sui.io/), [Courses](/courses/), [Entity](glossary:entity), [Bad1](javascript:alert(1)), and [Bad2](//evil.example/x).",
  );
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].type, "paragraph");
  if (blocks[0].type !== "paragraph") return;

  const links = blocks[0].children.filter((n) => n.type === "link");
  const glossary = blocks[0].children.filter((n) => n.type === "glossary");
  assert.deepEqual(
    links.map(({ href, label }) => ({ href, label })),
    [
      { href: "https://docs.sui.io/", label: "Docs" },
      { href: "/courses/", label: "Courses" },
    ],
  );
  assert.deepEqual(glossary, [{ type: "glossary", slug: "entity", label: "Entity" }]);

  const codeLink = parseMarkdown("Call [`inventory::deposit_requirement`](https://github.com/evefrontier/world-contracts) here.");
  assert.equal(codeLink[0].type, "paragraph");
  if (codeLink[0].type === "paragraph") {
    const link = codeLink[0].children.find((n) => n.type === "link");
    assert.deepEqual(link, {
      type: "link",
      href: "https://github.com/evefrontier/world-contracts",
      label: "`inventory::deposit_requirement`",
      children: [{ type: "code", text: "inventory::deposit_requirement" }],
    });
  }

  const texts = blocks[0].children
    .filter((n) => n.type === "text")
    .map((n) => n.text)
    .join("");
  assert.match(texts, /Bad1/);
  assert.match(texts, /Bad2/);
});

test("callout extracts single bold title line without corrupting multi-bold lines", () => {
  const single = parseMarkdown("> **Example**\n> Body line.");
  assert.equal(single[0].type, "callout");
  if (single[0].type === "callout") {
    assert.equal(single[0].title, "Example");
    assert.equal(single[0].blocks.length, 1);
  }

  const multi = parseMarkdown("> **Alpha** and **Beta**\n> Body line.");
  assert.equal(multi[0].type, "callout");
  if (multi[0].type === "callout") {
    assert.equal(multi[0].title, undefined);
    assert.equal(multi[0].blocks.length, 1);
  }
});

test("parses fenced Move code blocks without inline formatting interference", () => {
  const blocks = parseMarkdown("```move\nconst ALLOWED_TYPE: u64 = 88335;\n```");
  assert.deepEqual(blocks, [{ type: "code", lang: "move", text: "const ALLOWED_TYPE: u64 = 88335;" }]);
});
