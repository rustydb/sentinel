export function resolveDashboardReleaseTag(
  version: string,
  configuredReleaseTag?: string | null,
): string {
  const deducedTag = configuredReleaseTag?.trim() || `v${version}`;

  if (deducedTag.startsWith('apps/dashboard-')) {
    return deducedTag;
  }

  return `apps/dashboard-${deducedTag}`;
}
