import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET ?? 'http://127.0.0.1:3001';
const graphQlProxyTarget =
  process.env.VITE_GRAPHQL_PROXY_TARGET ?? 'https://graphql.testnet.sui.io';
const eveServerName = process.env.VITE_EVE_SERVER_NAME ?? 'utopia';
const defaultWorldApiProxyTargets: Record<string, string> = {
  stillness: 'https://world-api-stillness.live.tech.evefrontier.com',
  utopia: 'https://world-api-utopia.uat.pub.evefrontier.com',
};
const worldApiProxyTarget =
  process.env.VITE_WORLD_API_PROXY_TARGET ??
  defaultWorldApiProxyTargets[eveServerName] ??
  defaultWorldApiProxyTargets.utopia;

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
      '/world-api': {
        target: worldApiProxyTarget,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/world-api/, ''),
      },
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
