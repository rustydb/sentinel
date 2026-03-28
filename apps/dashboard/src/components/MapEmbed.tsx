import { useEffect, useRef } from 'react';

const MAP_EMBED_URL = 'https://ef-map.com/embed?performance=1';

interface MapEmbedProps {
  selectedSystemId: number | null;
}

export function MapEmbed({ selectedSystemId }: MapEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!selectedSystemId || !iframeRef.current?.contentWindow) {
      return;
    }

    iframeRef.current.contentWindow.postMessage(
      {
        type: 'ef-map-navigate',
        systemId: selectedSystemId,
      },
      '*',
    );
  }, [selectedSystemId]);

  return (
    <section className="border-4 border-sentinel-ink bg-white p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-sentinel-muted">Universe map</p>
      <div className="mt-4 overflow-hidden border-2 border-sentinel-ink">
        <iframe
          ref={iframeRef}
          id="ef-map-embed"
          title="EVE Frontier universe map"
          src={MAP_EMBED_URL}
          className="h-[420px] w-full"
          loading="lazy"
          allowFullScreen
        />
      </div>
    </section>
  );
}
