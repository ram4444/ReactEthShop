import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    GlowWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    SolletExtensionWalletAdapter,
    SolletWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
    WalletDialogProvider,
    WalletDisconnectButton,
    WalletMultiButton
 } from '@solana/wallet-adapter-material-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { createDefaultAuthorizationResultCache, SolanaMobileWalletAdapter } from '@solana-mobile/wallet-adapter-mobile';
import PropTypes from 'prop-types';
import BuywithSolana from './BuywithSolana';


// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

ConnectSolana.propTypes = {
    amountTransfer: PropTypes.number,
    toAddr: PropTypes.string,
    // contractAddr: PropTypes.string,
    chain: PropTypes.string,
    // currencyName: PropTypes.string,
    // product: PropTypes.object,
    // handleClosedModal: PropTypes.func,
    // handleUnderTx: PropTypes.func,
  };

export default function ConnectSolana({amountTransfer, toAddr, chain}) {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    let network = WalletAdapterNetwork.Devnet;
    switch (chain) {
        case 'Devnet':
            network = WalletAdapterNetwork.Devnet;
            break;
        case 'Testnet':
            network = WalletAdapterNetwork.Testnet;
            break;
        case 'Mainnet':
            network = WalletAdapterNetwork.Mainnet;
            break;
        default:
            network = WalletAdapterNetwork.Mainnet;
      }

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
    // Only the wallets you configure here will be compiled into your application, and only the dependencies
    // of wallets that your users connect to will be loaded.
    const wallets = useMemo(
        () => [
            new SolanaMobileWalletAdapter({
                appIdentity: { name: 'Solana Wallet Adapter App' },
                authorizationResultCache: createDefaultAuthorizationResultCache(),
            }),
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
        ],
        [network]
    );

    return (
        <>
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                
                <WalletDialogProvider>
                    <WalletMultiButton />
                    {/* 
                    <WalletDisconnectButton />
                    */}
                </WalletDialogProvider>
                
                {/*
                <WalletModalProvider>
                    <WalletMultiButton />
                    <WalletDisconnectButton />
                </WalletModalProvider>
                */}
                <BuywithSolana amountTransfer={amountTransfer} toAddr={toAddr}/> 
            </WalletProvider>
        </ConnectionProvider>
        </>
    );
};