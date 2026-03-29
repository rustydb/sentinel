import { useEffect, useMemo, useRef } from 'react';

const MAP_EMBED_BASE_URL = 'https://ef-map.com/embed';

function buildMapEmbedUrl({ highlightedSystemIds }: { highlightedSystemIds: number[] }): string {
  const url = new URL(MAP_EMBED_BASE_URL);
  url.searchParams.set('performance', '0');
  url.searchParams.set('orbit', '1');
  url.searchParams.set('color', 'random');
  url.searchParams.set('fit', '1');
  url.searchParams.set('angle', '45');

  if (highlightedSystemIds.length > 0) {
    url.searchParams.set('systems', highlightedSystemIds.join(','));
  }

  return url.toString();
}

interface MapEmbedProps {
  focusedSystemId: number | null;
  highlightedSystemIds: number[];
}

export function MapEmbed({ focusedSystemId, highlightedSystemIds }: MapEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const syncTimeoutsRef = useRef<number[]>([]);
  const normalizedHighlightedSystemIds = useMemo(
    () => [...new Set(highlightedSystemIds)].sort((left, right) => left - right),
    [highlightedSystemIds.join(',')],
  );
  const mapSrc = useMemo(
    () =>
      buildMapEmbedUrl({
        highlightedSystemIds: normalizedHighlightedSystemIds,
      }),
    [normalizedHighlightedSystemIds.join(',')],
  );

  function clearScheduledSyncs() {
    for (const timeoutId of syncTimeoutsRef.current) {
      window.clearTimeout(timeoutId);
    }
    syncTimeoutsRef.current = [];
  }

  function syncMapState() {
    if (!iframeRef.current?.contentWindow) {
      return;
    }

    if (focusedSystemId != null) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'ef-map-navigate',
          systemId: focusedSystemId,
        },
        '*',
      );
      return;
    }

    iframeRef.current.contentWindow.postMessage(
      {
        type: 'ef-map-highlight',
        systems: normalizedHighlightedSystemIds,
      },
      '*',
    );
  }

  function scheduleSyncMapState() {
    clearScheduledSyncs();
    syncMapState();

    syncTimeoutsRef.current = [150, 500].map((delayMs) =>
      window.setTimeout(() => {
        syncMapState();
      }, delayMs),
    );
  }

  useEffect(() => {
    scheduleSyncMapState();
    return () => {
      clearScheduledSyncs();
    };
  }, [focusedSystemId, normalizedHighlightedSystemIds]);

  return (
    <section className="border-4 border-sentinel-ink bg-white p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-sentinel-muted">Universe map</p>
      <div className="mt-4 overflow-hidden border-2 border-sentinel-ink">
        <iframe
          ref={iframeRef}
          id="ef-map-embed"
          title="EVE Frontier universe map"
          src={mapSrc}
          className="h-[420px] w-full"
          loading="lazy"
          allowFullScreen
          onLoad={scheduleSyncMapState}
        />
      </div>
    </section>
  );
}
