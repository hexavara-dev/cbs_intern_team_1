/*
 * Compare two WBS IDs and sort them in hierarchical order.
 *
 * This function ensures that WBS IDs like:
 * 1, 1.1, 1.2, 1.10, 2
 * are ordered correctly (numeric & hierarchical),
 * not lexicographically like a normal string sort.
 *
 * Example of correct order:
 * 1
 * 1.1
 * 1.2
 * 1.10
 * 2
 */

export function sortWBSId(a: string, b: string) {
  const aParts = a.split(".").map(Number);
  const bParts = b.split(".").map(Number);

  const len = Math.max(aParts.length, bParts.length);

  for (let i = 0; i < len; i++) {
    const diff = (aParts[i] ?? 0) - (bParts[i] ?? 0);
    if (diff !== 0) return diff;
  }

  return 0;
}
