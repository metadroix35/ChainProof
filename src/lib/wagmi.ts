import { createConfig, http } from 'wagmi';
import { mainnet, polygonAmoy, sepolia } from 'wagmi/chains';

// Replace with a real project ID when going to production
export const projectId = 'your-walletconnect-project-id';

// Simplified config using standard wagmi if web3modal is not fully installed, 
// but we'll use simple wagmi config for manual injection connector.
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [polygonAmoy, sepolia, mainnet],
  connectors: [
    injected(),
  ],
  transports: {
    [polygonAmoy.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
})
