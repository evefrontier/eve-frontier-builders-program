"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createSearch, type SearchEntry } from "@/lib/search";

/* Reads the query in the browser: a static export has no server to read it at request time */
export function Results({ entries }: { entries: SearchEntry[] }) {
  const query = useSearchParams().get("q")?.trim() ?? "";
  const find = useMemo(() => createSearch(entries), [entries]);
  const results = useMemo(() => find(query), [find, query]);

  return (
    <>
      <p role="status" className="mt-s text-muted">
        {!query ? (
          "Type in the search field to look something up."
        ) : (
          <>
            {results.length === 0 ? "Nothing matches" : `${results.length} ${results.length === 1 ? "result" : "results"} for`}{" "}
            <strong className="text-foreground">{query}</strong>
          </>
        )}
      </p>
      {results.length > 0 && (
        <ol role="list" className="mt-m grid gap-m">
          {results.map((result) => (
            <li key={result.href}>
              <p className="text-step--2 font-bold tracking-[0.06em] text-muted uppercase">{result.kind}</p>
              <Link
                href={result.href}
                className="font-heading text-step-1 text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-foreground"
              >
                {result.title}
              </Link>
              {result.description && <p className="mt-3xs text-muted">{result.description}</p>}
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
