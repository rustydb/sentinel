import { describe, expect, it } from 'vitest';

import { resolveDashboardReleaseTag } from './buildMeta';

describe('resolveDashboardReleaseTag', () => {
  it('prefixes the deduced dashboard version tag for GitHub routing', () => {
    expect(resolveDashboardReleaseTag('0.3.1')).toBe('apps/dashboard-v0.3.1');
  });

  it('prefixes configured short tags for GitHub routing', () => {
    expect(resolveDashboardReleaseTag('0.3.1', 'v0.3.1')).toBe('apps/dashboard-v0.3.1');
  });

  it('preserves fully qualified dashboard tags', () => {
    expect(resolveDashboardReleaseTag('0.3.1', 'apps/dashboard-v0.3.1')).toBe(
      'apps/dashboard-v0.3.1',
    );
  });
});
