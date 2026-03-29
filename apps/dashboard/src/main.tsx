import { VaultProvider, dAppKit } from '@evefrontier/dapp-kit';
import { DAppKitProvider } from '@mysten/dapp-kit-react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import './index.css';

const isDemoRoute =
  window.location.pathname === '/demo' || window.location.pathname.startsWith('/demo/');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      {isDemoRoute ? (
        <DemoApp />
      ) : (
        <DAppKitProvider dAppKit={dAppKit}>
          <VaultProvider>
            <App />
          </VaultProvider>
        </DAppKitProvider>
      )}
    </AppErrorBoundary>
  </StrictMode>,
);
