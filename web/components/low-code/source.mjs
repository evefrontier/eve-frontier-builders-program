// @ts-check
import { constantNames, consumerIds } from "./connections.mjs";
import { validateU64 } from "./u64.mjs";

/** @typedef {{text: string, owners: string[]}} SourceLine */
/** Positions are deliberately not an input: moving nodes cannot affect source.
 * @param {Record<string, string>} values
 * @param {import("./connections.mjs").ValueConnection[]} connections
 * @returns {{errors: string[], lines: SourceLine[]}}
 */
export function formatSource(values, connections) {
  const errors = /** @type {string[]} */ ([]);
  const literals = constantNames.map(name => {
    const result = validateU64(values[name] ?? "");
    if (result.error) errors.push(name + ": " + result.error);
    return result.literal;
  });
  const sources = consumerIds.map(id => {
    const source = connections.find(edge => edge.target === id)?.source;
    if (!source || !constantNames.some(name => name === source)) errors.push(id + " quantity: connect a Primitive Constant.");
    return source;
  });
  if (errors.length) return { errors, lines: [] };
  return {
    errors: [],
    lines: [
      { text: "module preview::quantities {", owners: [] },
      ...constantNames.map((name, index) => ({
        text: "    const " + name + ": u64 = " + literals[index] + ";", owners: [name],
      })),
      { text: "", owners: [] },
      { text: "    fun illustrative_quantities(): (u64, u64) {", owners: [] },
      { text: "        let accept_quantity = " + sources[0] + ";", owners: ["accept", sources[0] ?? ""] },
      { text: "        let dispense_quantity = " + sources[1] + ";", owners: ["dispense", sources[1] ?? ""] },
      { text: "        (accept_quantity, dispense_quantity)", owners: [] },
      { text: "    }", owners: [] },
      { text: "}", owners: [] },
    ],
  };
}

/** @param {SourceLine[]} lines @param {string | null} selection */
export function correspondingLines(lines, selection) {
  return lines.flatMap((line, index) => selection && line.owners.includes(selection) ? [index + 1] : []);
}
