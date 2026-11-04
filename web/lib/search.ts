export const searchKinds = ["Pathway", "Course", "Module", "Lesson", "Term"] as const;

export type SearchKind = (typeof searchKinds)[number];

export type SearchEntry = {
  kind: SearchKind;
  title: string;
  description: string;
  href: string;
  /** Matched below the title and above the description: a term's topics and other names, a pathway's audience. */
  keywords?: string[];
};

/** Lowercase without accents, so a query matches however either side is written. */
export const fold = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

/**
 * A search over `entries`, folded once. It returns the entries that match every
 * word of the query, best first: a word in the title outranks one in the
 * keywords, which outranks one in the description. Ties keep the entries' order.
 */
export function createSearch(entries: SearchEntry[]) {
  const folded = entries.map((entry) => ({
    entry,
    title: fold(entry.title),
    keywords: fold(entry.keywords?.join(" ") ?? ""),
    description: fold(entry.description),
  }));

  return (query: string): SearchEntry[] => {
    const words = fold(query).split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];

    return folded
      .flatMap(({ entry, title, keywords, description }, order) => {
        let score = 0;
        for (const word of words) {
          const weight = title.includes(word) ? 3 : keywords.includes(word) ? 2 : description.includes(word) ? 1 : 0;
          if (weight === 0) return [];
          score += weight;
        }
        return [{ entry, score, order }];
      })
      .sort((a, b) => b.score - a.score || a.order - b.order)
      .map(({ entry }) => entry);
  };
}
