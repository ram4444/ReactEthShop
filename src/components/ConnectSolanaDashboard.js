import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Stack, Grid, Container, Typography } from '@mui/material';
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react';
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
import { faker } from '@faker-js/faker';
import PropTypes from 'prop-types';
import BuyerRecordsSolana from './BuyerRecordsSolana';




// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

ConnectSolanaDashboard.propTypes = {
    langPack: PropTypes.object
};

export default function ConnectSolanaDashboard({langPack}) {
    
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    let network = WalletAdapterNetwork.Devnet;
    switch ("chain") {
        case 'Solana Devnet':
            network = WalletAdapterNetwork.Devnet;
            break;
        case 'Solana Testnet':
            network = WalletAdapterNetwork.Testnet;
            break;
        case 'Solana Mainnet':
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
                appIdentity: { 
                    name: 'MkPlace Demo Site',
                    uri: 'https://ethshopdemo.dionysbiz.xyz'
                },
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
                
                <Stack spacing={1}>
                    
                    <WalletDialogProvider>
                        <WalletMultiButton />
                        <WalletDisconnectButton />
                    </WalletDialogProvider>

                    <BuyerRecordsSolana langPack={langPack}/>

                </Stack>
            </WalletProvider>
        </ConnectionProvider>
        </>
    );
};