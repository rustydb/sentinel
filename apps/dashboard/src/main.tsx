import { VaultProvider, dAppKit } from '@evefrontier/dapp-kit';
import { DAppKitProvider } from '@mysten/dapp-kit-react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DAppKitProvider dAppKit={dAppKit}>
      <VaultProvider>
        <App />
      </VaultProvider>
    </DAppKitProvider>
  </StrictMode>,
);
