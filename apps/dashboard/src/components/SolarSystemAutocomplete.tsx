import type { EveWorldName, SolarSystemSearchResult } from '@frontier-sentinel/shared-types';
import { useEffect, useRef, useState } from 'react';

import { useSolarSystemCatalog } from '../hooks/useSolarSystemCatalog';

interface SolarSystemAutocompleteProps {
  world?: EveWorldName;
  onSelect: (result: SolarSystemSearchResult) => void;
  onCancel: () => void;
  initialQuery?: string;
}

export function SolarSystemAutocomplete({
  world,
  onSelect,
  onCancel,
  initialQuery = '',
}: SolarSystemAutocompleteProps) {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { results } = useSolarSystemCatalog({ query, world });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="border-2 border-sentinel-line bg-sentinel-panel p-4 shadow-[6px_6px_0_0_#050608]">
      <label className="block text-xs uppercase tracking-[0.2em] text-sentinel-muted">
        Solar system
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          className="mt-2 w-full border border-sentinel-line bg-sentinel-panel-inset px-3 py-3 text-sm uppercase text-sentinel-ink placeholder:text-sentinel-muted focus:border-sentinel-accent focus:outline-none"
          placeholder="Search by system name"
        />
      </label>

      {query.trim() ? (
        <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
          {results.length > 0 ? (
            results.map((result) => (
              <li key={`${result.world}-${result.id}`}>
                <button
                  type="button"
                  className="sentinel-action-button w-full border border-sentinel-line px-3 py-3 text-left uppercase"
                  onClick={() => onSelect(result)}
                >
                  {result.name}
                </button>
              </li>
            ))
          ) : (
            <li className="border border-sentinel-line bg-sentinel-panel-inset px-3 py-3 text-xs uppercase text-sentinel-muted">
              No solar systems match this search.
            </li>
          )}
        </ul>
      ) : null}

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          className="sentinel-action-button border border-sentinel-line px-3 py-2 uppercase"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
