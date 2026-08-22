import type { Salon } from "./types";
import { escapeAttr } from "./utils";

export function matchesSearch(salon: Salon, term: string): boolean {
  if (!term) return true;
  const haystack =
    `${salon.name} ${salon.street} ${salon.city} ${salon.state}`.toLowerCase();
  return haystack.includes(term.toLowerCase());
}

export function buildSuggestionsHtml(
  salons: Salon[],
  query: string,
  limit = 6,
): string | null {
  const matches = salons.filter((s) => matchesSearch(s, query)).slice(0, limit);
  if (!matches.length) return null;

  return matches
    .map(
      (s) => `
        <li data-value="${escapeAttr(s.name)}">
          <span class="suggestion-name">${s.name}</span>
          <span class="suggestion-place">${s.city}/${s.state}</span>
        </li>
      `,
    )
    .join("");
}
