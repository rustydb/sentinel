import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SolarSystemAutocomplete } from './SolarSystemAutocomplete';

describe('SolarSystemAutocomplete', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 30000004, name: 'O3H-1FN', world: 'utopia', matchText: 'O3H-1FN' }],
          }),
      }),
    );
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('filters bundled solar systems by friendly name and emits the selected result', async () => {
    const onSelect = vi.fn();
    render(<SolarSystemAutocomplete onSelect={onSelect} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/search by system name/i), {
      target: { value: 'O3H' },
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'O3H-1FN' })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'O3H-1FN' }));

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 30000004,
        name: 'O3H-1FN',
      }),
    );
  });
});
