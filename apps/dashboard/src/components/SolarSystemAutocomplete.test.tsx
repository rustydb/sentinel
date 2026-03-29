import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SolarSystemAutocomplete } from './SolarSystemAutocomplete';

describe('SolarSystemAutocomplete', () => {
  it('filters bundled solar systems by friendly name and emits the selected result', () => {
    const onSelect = vi.fn();
    render(<SolarSystemAutocomplete onSelect={onSelect} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/search by system name/i), {
      target: { value: 'O3H' },
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
