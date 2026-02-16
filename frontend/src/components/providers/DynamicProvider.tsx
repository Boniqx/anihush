"use client";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { AlgorandWalletConnectors } from "@dynamic-labs/algorand";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import { FlowWalletConnectors } from "@dynamic-labs/flow";
import { StarknetWalletConnectors } from "@dynamic-labs/starknet";
import { CosmosWalletConnectors } from "@dynamic-labs/cosmos";
import { BitcoinWalletConnectors } from "@dynamic-labs/bitcoin";
import { SuiWalletConnectors } from "@dynamic-labs/sui";

export default function DynamicProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId:
          process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ||
          "INSERT_DYNAMIC_ENV_ID",
        walletConnectors: [EthereumWalletConnectors],
        overrides: {
          evmNetworks: [
            {
              blockExplorerUrls: ["https://sepolia.etherscan.io/"],
              chainId: 11155111,
              chainName: "Sepolia",
              iconUrls: ["/images/networks/sepolia.png"],
              name: "Sepolia",
              nativeCurrency: {
                decimals: 18,
                name: "Sepolia Ether",
                symbol: "SEP",
                iconUrl: "/images/networks/sepolia.png",
              },
              networkId: 11155111,
              rpcUrls: ["https://rpc.sepolia.org"],
              vanityName: "Sepolia",
            },
          ],
        },
      }}
      locale={{
        en: {
          dyn_login: {
            title: {
              all: "Sync your wallet",
            },
          },
          dyn_wallet_list: {
            title: {
              connect: "Sync your wallet",
            },
          },
        },
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
