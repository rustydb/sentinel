import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ResponsiveAddress } from './ResponsiveAddress';
import { emitResize, installResizeObserverMock } from '../test-utils/resizeObserver';

const FULL_ADDRESS = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
const clipboardWriteText = vi.fn();

describe('ResponsiveAddress', () => {
  beforeEach(() => {
    installResizeObserverMock();
    clipboardWriteText.mockReset();
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: clipboardWriteText.mockResolvedValue(undefined),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders the full address when enough width is available', async () => {
    render(<ResponsiveAddress address={FULL_ADDRESS} />);

    emitResize(800);

    await waitFor(() => {
      expect(screen.getByTitle(FULL_ADDRESS).textContent).toBe(FULL_ADDRESS);
    });
  });

  it('abbreviates the address when the container is narrow', async () => {
    render(<ResponsiveAddress address={FULL_ADDRESS} />);

    emitResize(140);

    await waitFor(() => {
      expect(screen.getByTitle(FULL_ADDRESS).textContent).toContain('...');
    });

    expect(screen.queryByText(FULL_ADDRESS)).toBeNull();
  });

  it('uses the largest abbreviation that fits the available width', async () => {
    render(<ResponsiveAddress address={FULL_ADDRESS} copyable={false} />);

    emitResize(120);
    await waitFor(() => {
      expect(screen.getByTitle(FULL_ADDRESS).textContent).toContain('...');
    });
    const narrowDisplay = screen.getByTitle(FULL_ADDRESS).textContent ?? '';

    emitResize(220);
    await waitFor(() => {
      expect((screen.getByTitle(FULL_ADDRESS).textContent ?? '').length).toBeGreaterThan(
        narrowDisplay.length,
      );
    });
  });

  it('continues responding when the container grows and then shrinks again', async () => {
    render(<ResponsiveAddress address={FULL_ADDRESS} copyable={false} />);

    emitResize(320);
    await waitFor(() => {
      expect((screen.getByTitle(FULL_ADDRESS).textContent ?? '').length).toBeGreaterThan(24);
    });
    const wideDisplay = screen.getByTitle(FULL_ADDRESS).textContent ?? '';

    emitResize(140);
    await waitFor(() => {
      const nextDisplay = screen.getByTitle(FULL_ADDRESS).textContent ?? '';
      expect(nextDisplay).toContain('...');
      expect(nextDisplay.length).toBeLessThan(wideDisplay.length);
    });
  });

  it('renders a safe fallback for an invalid address', async () => {
    render(<ResponsiveAddress address="not-an-address" />);

    emitResize(140);

    await waitFor(() => {
      expect(screen.getByText('Unavailable')).toBeTruthy();
    });

    expect(screen.queryByRole('button', { name: /copy/i })).toBeNull();
  });

  it('copies the full address through the themed copy control', async () => {
    render(<ResponsiveAddress address={FULL_ADDRESS} copyLabel="wallet address" />);

    emitResize(140);
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /copy wallet address/i }));
    });

    await waitFor(() => {
      expect(clipboardWriteText).toHaveBeenCalledWith(FULL_ADDRESS);
    });
  });

  it('shows subtle copied feedback and tooltip after copy', async () => {
    render(<ResponsiveAddress address={FULL_ADDRESS} copyLabel="wallet address" />);

    emitResize(140);
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /copy wallet address/i }));
    });

    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toBe('Copied to clipboard');
      expect(screen.getByRole('button', { name: /copy wallet address/i }).className).toContain(
        'border-sentinel-line',
      );
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 1700);
    });

    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toBe('');
      expect(screen.getByRole('button', { name: /copy wallet address/i }).className).not.toContain(
        'border-sentinel-glow',
      );
    });
  });
});
