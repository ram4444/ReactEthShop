import React, { useMemo } from 'react';
import { Stack } from '@mui/material';
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
/*
import {
    WalletDialogProvider,
    WalletDisconnectButton,
    WalletMultiButton
 } from '@solana/wallet-adapter-material-ui';
 */
 import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
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
    handleToggle: PropTypes.func,
    handleUnderTx: PropTypes.func,
    handleOnSuccess: PropTypes.func,
    handleOnFail: PropTypes.func,
  };

export default function ConnectSolana({amountTransfer, toAddr, chain, handleToggle, handleUnderTx, handleOnSuccess, handleOnFail}) {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    let network = WalletAdapterNetwork.Devnet;
    switch (chain) {
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
                    uri: 'http://ethshopdemo.dionysbiz.xyz:8080/'
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
                    {/*
                    <WalletDialogProvider>
                        <WalletMultiButton />
                         
                        <WalletDisconnectButton />
                        
                    </WalletDialogProvider>
    */}
                    
                    <WalletModalProvider>
                        <WalletMultiButton />
                        <WalletDisconnectButton />
                    </WalletModalProvider>
                    
                    <BuywithSolana 
                        amountTransfer={amountTransfer} 
                        toAddr={toAddr}
                        chain={chain}
                        handleToggle={handleToggle}
                        handleUnderTx={handleUnderTx}
                        handleOnSuccess={handleOnSuccess}
                        handleOnFail={handleOnFail}
                    /> 
                </Stack>
            </WalletProvider>
        </ConnectionProvider>
        </>
    );
};