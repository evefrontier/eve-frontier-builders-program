// @ts-check
/** Validate text without changing the field or losing integer precision.
 * @param {string} text
 * @returns {{literal: string, error: null} | {literal: null, error: string}}
 */
export function validateU64(text) {
  const decimal = text.trim();
  if (!/^[0-9]+$/.test(decimal)) {
    return { literal: null, error: "Enter decimal digits only (0–18446744073709551615)." };
  }
  const literal = decimal.replace(/^0+(?=\d)/, "");
  if (literal.length > 20 || BigInt(literal) > 18446744073709551615n) {
    return { literal: null, error: "Value exceeds u64 maximum: 18446744073709551615." };
  }
  return { literal, error: null };
}
