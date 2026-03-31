export interface DashboardBuildInfo {
  version: string;
  commitHash: string;
  dirty: boolean;
  href: string | null;
  linkLabel: string;
}

declare const __SENTINEL_DASHBOARD_BUILD_INFO__: DashboardBuildInfo | undefined;

export const dashboardBuildInfo: DashboardBuildInfo =
  typeof __SENTINEL_DASHBOARD_BUILD_INFO__ === 'undefined'
    ? {
        version: '0.0.0',
        commitHash: 'unknown',
        dirty: false,
        href: null,
        linkLabel: 'Dashboard build information',
      }
    : __SENTINEL_DASHBOARD_BUILD_INFO__;
