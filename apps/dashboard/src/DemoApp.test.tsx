// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DemoApp from './DemoApp';

const hooks = vi.hoisted(() => ({
  useTypeInfo: vi.fn(),
}));

vi.mock('./hooks/useTypeInfo', () => ({
  useTypeInfo: hooks.useTypeInfo,
}));

describe('DemoApp', () => {
  beforeEach(() => {
    hooks.useTypeInfo.mockReturnValue({
      typeInfo: {
        id: '92401',
        name: 'Heavy Turret',
        iconUrl: 'https://assets.example.com/heavy-turret.png',
      },
      isLoading: false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders the branded dashboard shell and pilot statistics in demo mode', () => {
    render(<DemoApp />);

    expect(screen.getByAltText(/sentinel logo/i)).toBeTruthy();
    expect(screen.getByText(/metrics/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /^the slayer/i })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /advanced search options/i }));
    expect(screen.getByRole('button', { name: /^online$/i, pressed: false })).toBeTruthy();
    expect(screen.getByRole('button', { name: /^engaged$/i, pressed: false })).toBeTruthy();
    expect(screen.getByRole('button', { name: /^heavy turret$/i, pressed: false })).toBeTruthy();
    expect(screen.getByRole('button', { name: /^light turret$/i, pressed: false })).toBeTruthy();
  });
});
