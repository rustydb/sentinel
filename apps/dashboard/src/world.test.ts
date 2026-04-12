// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';

import { resolveCurrentWorld, resolveWorldFromAccount, resolveWorldFromSearch } from './world';

describe('world resolution', () => {
  it('reads the stillness tenant from the URL search params', () => {
    expect(resolveWorldFromSearch('?tenant=stillness')).toBe('stillness');
  });

  it('returns null when the URL search has no tenant', () => {
    expect(resolveWorldFromSearch('?itemId=123')).toBeNull();
  });

  it('falls back to the account tenant when the URL search has no tenant', () => {
    expect(resolveCurrentWorld({ key: { tenant: 'stillness' } }, '?itemId=123')).toBe('stillness');
  });

  it('prefers the URL tenant over the account tenant', () => {
    expect(resolveCurrentWorld({ key: { tenant: 'utopia' } }, '?tenant=stillness')).toBe(
      'stillness',
    );
  });

  it('defaults to utopia when neither URL nor account provide a stillness tenant', () => {
    expect(resolveCurrentWorld(null, '')).toBe('utopia');
    expect(resolveWorldFromAccount({})).toBe('utopia');
  });
});
