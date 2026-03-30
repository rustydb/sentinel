import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MapEmbed } from './MapEmbed';

describe('MapEmbed', () => {
  afterEach(() => {
    cleanup();
  });

  it('navigates the loaded embed to a focused system without changing the base iframe url', () => {
    const postMessage = vi.fn();
    Object.defineProperty(window.HTMLIFrameElement.prototype, 'contentWindow', {
      configurable: true,
      value: { postMessage },
    });

    render(<MapEmbed focusedSystemId={31002477} highlightedSystemIds={[]} />);

    expect(postMessage).toHaveBeenCalledWith(
      {
        type: 'ef-map-navigate',
        systemId: 31002477,
      },
      '*',
    );
    expect(screen.getByTitle(/eve frontier universe map/i).getAttribute('src')).not.toContain(
      'system=31002477',
    );
  });

  it('loads all assigned systems into the embed when no turret is focused', () => {
    render(<MapEmbed focusedSystemId={null} highlightedSystemIds={[30000004, 30000005]} />);

    expect(screen.getByText(/universe map/i).closest('section')?.className).toContain(
      'bg-sentinel-shell',
    );
    expect(screen.getByTitle(/eve frontier universe map/i).getAttribute('src')).toContain(
      'systems=30000004%2C30000005',
    );
  });

  it('reloads the highlight view when a focused turret is deselected', () => {
    const postMessage = vi.fn();
    Object.defineProperty(window.HTMLIFrameElement.prototype, 'contentWindow', {
      configurable: true,
      value: { postMessage },
    });

    const { rerender } = render(
      <MapEmbed focusedSystemId={31002477} highlightedSystemIds={[30000004, 30000005]} />,
    );
    const focusedIframe = screen.getByTitle(/eve frontier universe map/i);
    expect(focusedIframe.getAttribute('src')).toContain('systems=30000004%2C30000005');

    rerender(<MapEmbed focusedSystemId={null} highlightedSystemIds={[30000004, 30000005]} />);

    const unfocusedIframe = screen.getByTitle(/eve frontier universe map/i);
    expect(unfocusedIframe.getAttribute('src')).toContain('systems=30000004%2C30000005');
    expect(postMessage).toHaveBeenCalledWith(
      {
        type: 'ef-map-highlight',
        systems: [30000004, 30000005],
      },
      '*',
    );
  });
});
