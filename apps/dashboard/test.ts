import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
const client = new SuiClient({ url: getFullnodeUrl('testnet') });
client
  .resolveNameServiceAddress({ name: '@evefrontier/world' })
  .then(console.log)
  .catch(console.error);
