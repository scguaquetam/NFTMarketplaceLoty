import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, goerli } from 'wagmi';
import { polygonMumbai } from 'wagmi/chains';
// import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

const { chains, provider } = configureChains(
  [goerli],
  [/* alchemyProvider({ apiKey: process.env.ALCHEMY_ID }), */ publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'Loty Marketplace',
  projectId: process.env.WALLET_CONNECT_ID,
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export { wagmiClient, chains };
