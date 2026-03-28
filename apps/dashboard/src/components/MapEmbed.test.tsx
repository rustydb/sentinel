import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MapEmbed } from './MapEmbed';

describe('MapEmbed', () => {
  it('posts navigation commands to the ef-map embed iframe', () => {
    const postMessage = vi.fn();
    Object.defineProperty(window.HTMLIFrameElement.prototype, 'contentWindow', {
      configurable: true,
      value: { postMessage },
    });

    render(<MapEmbed selectedSystemId={31002477} />);

    expect(postMessage).toHaveBeenCalledWith(
      {
        type: 'ef-map-navigate',
        systemId: 31002477,
      },
      '*',
    );
  });
});
