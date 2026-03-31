import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dashboardPackageJson = JSON.parse(
  readFileSync(resolve(workspaceRoot, 'apps/dashboard/package.json'), 'utf8'),
) as {
  version?: string;
};

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET ?? 'http://127.0.0.1:3001';
const graphQlProxyTarget =
  process.env.VITE_GRAPHQL_PROXY_TARGET ?? 'https://graphql.testnet.sui.io';
const defaultWorldApiProxyTargets: Record<string, string> = {
  stillness: 'https://world-api-stillness.live.tech.evefrontier.com',
  utopia: 'https://world-api-utopia.uat.pub.evefrontier.com',
};

function resolveWorldApiProxyTarget(worldName: string): string {
  return (
    process.env[`VITE_WORLD_API_PROXY_TARGET_${worldName.toUpperCase()}`] ??
    defaultWorldApiProxyTargets[worldName] ??
    process.env.VITE_WORLD_API_PROXY_TARGET ??
    defaultWorldApiProxyTargets.utopia
  );
}

function createWorldApiProxy(worldName: 'utopia' | 'stillness') {
  return {
    target: resolveWorldApiProxyTarget(worldName),
    changeOrigin: true,
    secure: true,
    rewrite: (path: string) =>
      path.replace(new RegExp(`^/world-api/${worldName}`, 'i'), '').replace(/^\/world-api/, ''),
  };
}

function readGitOutput(args: string[]): string | null {
  try {
    const output = execFileSync('git', args, {
      cwd: workspaceRoot,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();

    return output.length > 0 ? output : null;
  } catch {
    return null;
  }
}

function readTextFile(path: string): string | null {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return null;
  }
}

function resolveGitDir(repoRoot: string): string | null {
  const gitPath = resolve(repoRoot, '.git');

  try {
    if (statSync(gitPath).isDirectory()) {
      return gitPath;
    }
  } catch {
    return null;
  }

  const gitPointer = readTextFile(gitPath)?.trim();
  if (!gitPointer?.startsWith('gitdir:')) {
    return null;
  }

  return resolve(repoRoot, gitPointer.slice('gitdir:'.length).trim());
}

function readPackedRef(gitDir: string, ref: string): string | null {
  const packedRefs = readTextFile(resolve(gitDir, 'packed-refs'));
  if (!packedRefs) {
    return null;
  }

  for (const line of packedRefs.split('\n')) {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0 || trimmedLine.startsWith('#') || trimmedLine.startsWith('^')) {
      continue;
    }

    const [hash, packedRef] = trimmedLine.split(' ', 2);
    if (packedRef === ref && hash) {
      return hash.trim();
    }
  }

  return null;
}

function readGitRef(gitDir: string, ref: string): string | null {
  const looseRef = readTextFile(resolve(gitDir, ref))?.trim();
  if (looseRef) {
    return looseRef;
  }

  return readPackedRef(gitDir, ref);
}

function readGitHeadHashFromDir(gitDir: string): string | null {
  const head = readTextFile(resolve(gitDir, 'HEAD'))?.trim();
  if (!head) {
    return null;
  }

  if (head.startsWith('ref:')) {
    return readGitRef(gitDir, head.slice('ref:'.length).trim());
  }

  return /^[0-9a-f]{40}$/i.test(head) ? head : null;
}

function readGitRemoteUrlFromDir(gitDir: string, remoteName: string): string | null {
  const config = readTextFile(resolve(gitDir, 'config'));
  if (!config) {
    return null;
  }

  const remoteHeader = `[remote "${remoteName}"]`;
  let inRemoteSection = false;

  for (const rawLine of config.split('\n')) {
    const line = rawLine.trim();

    if (line.startsWith('[') && line.endsWith(']')) {
      inRemoteSection = line === remoteHeader;
      continue;
    }

    if (!inRemoteSection) {
      continue;
    }

    const match = line.match(/^url\s*=\s*(.+)$/);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return null;
}

function readGitTagHashFromDir(gitDir: string, tagName: string): string | null {
  return readGitRef(gitDir, `refs/tags/${tagName}`);
}

function parseBooleanEnv(value: string | undefined): boolean | null {
  if (value == null) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') {
    return true;
  }

  if (normalized === 'false') {
    return false;
  }

  return null;
}

function normalizeGitHubUrl(remoteUrl: string | null): string | null {
  if (!remoteUrl) {
    return null;
  }

  const sshMatch = remoteUrl.match(/^git@github\.com:(.+?)(?:\.git)?$/i);
  if (sshMatch) {
    return `https://github.com/${sshMatch[1]}`;
  }

  const httpsMatch = remoteUrl.match(/^https:\/\/github\.com\/(.+?)(?:\.git)?$/i);
  if (httpsMatch) {
    return `https://github.com/${httpsMatch[1]}`;
  }

  return null;
}

const dashboardVersion = dashboardPackageJson.version ?? '0.0.0';
const gitDir = resolveGitDir(workspaceRoot);
const fullCommitHash =
  readGitOutput(['rev-parse', 'HEAD']) ?? (gitDir ? readGitHeadHashFromDir(gitDir) : null);
const shortCommitHash =
  readGitOutput(['rev-parse', '--short', 'HEAD']) ??
  (fullCommitHash ? fullCommitHash.slice(0, 7) : 'unknown');
const dirty =
  parseBooleanEnv(process.env.SENTINEL_BUILD_DIRTY) ??
  parseBooleanEnv(process.env.VITE_BUILD_DIRTY) ??
  (readGitOutput(['status', '--short']) !== null ? true : false);
const repositoryUrl = normalizeGitHubUrl(
  readGitOutput(['remote', 'get-url', 'origin']) ??
    (gitDir ? readGitRemoteUrlFromDir(gitDir, 'origin') : null),
);
const releaseTag = `v${dashboardVersion}`;
const hasReleaseTag =
  readGitOutput(['rev-parse', '--verify', '--quiet', `refs/tags/${releaseTag}`]) !== null ||
  (gitDir ? readGitTagHashFromDir(gitDir, releaseTag) !== null : false);
const releaseUrl = repositoryUrl ? `${repositoryUrl}/releases/tag/${releaseTag}` : null;
const commitUrl =
  repositoryUrl && fullCommitHash ? `${repositoryUrl}/commit/${fullCommitHash}` : null;
const fallbackUrl = repositoryUrl ? `${repositoryUrl}/releases` : null;
const buildInfo = {
  version: dashboardVersion,
  commitHash: shortCommitHash,
  dirty,
  href: dirty
    ? (commitUrl ?? fallbackUrl)
    : hasReleaseTag
      ? (releaseUrl ?? commitUrl ?? fallbackUrl)
      : (commitUrl ?? fallbackUrl),
  linkLabel: dirty
    ? `Open the GitHub commit for dashboard build ${shortCommitHash}`
    : hasReleaseTag
      ? `Open the GitHub release for dashboard version ${dashboardVersion}`
      : `Open the GitHub commit for dashboard build ${shortCommitHash}`,
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __SENTINEL_DASHBOARD_BUILD_INFO__: JSON.stringify(buildInfo),
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: apiProxyTarget,
      },
      '/graphql': {
        target: graphQlProxyTarget,
        changeOrigin: true,
        secure: true,
      },
      '/world-api/utopia': createWorldApiProxy('utopia'),
      '/world-api/stillness': createWorldApiProxy('stillness'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['tests/e2e/**'],
  },
});
