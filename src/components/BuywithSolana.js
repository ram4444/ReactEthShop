import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet,   } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import React, { useCallback } from 'react';
import { Button} from '@mui/material';
import PropTypes from 'prop-types';

BuywithSolana.propTypes = {
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

export default function BuywithSolana({amountTransfer, toAddr, chain, handleToggle, handleUnderTx, handleOnSuccess, handleOnFail}) {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const onClick = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();
        
        let checkURL=''
        switch (chain) {
            case 'Solana Devnet':
                checkURL = "https://api.devnet.solana.com";
                break;
            case 'Solana Testnet':
                checkURL = "https://api.testnet.solana.com";
                break;
            case 'Solana Mainnet':
                checkURL = "https://solana-mainnet.phantom.tech";
                break;
            default:
                checkURL = "https://solana-mainnet.phantom.tech";
        }
        
        console.log(chain)
        console.log(connection._rpcEndpoint)
        console.log(checkURL)
        if (connection._rpcEndpoint!==checkURL) {
            console.log("The connected chain is not same as the one specfied in the product")
            throw new WalletNotConnectedError()
        }

        handleToggle()
        handleUnderTx(true)
        
        // console.log(amountTransfer)
        // console.log(toAddr)

        // lamports: 1000000000 = 1 SOL
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: toAddr,
                // eslint-disable-next-line no-undef
                lamports: BigInt(amountTransfer*1000000000),
            })
        );

        const signature = await sendTransaction(transaction, connection);

        await connection.confirmTransaction(signature, 'processed');

        console.log(signature)
        if (signature !== null ) {
            console.log("Transaction successful")
            const receipt = {
                "from": publicKey.toBase58()
            }
            handleOnSuccess(receipt)
            // processReceipt(receipt, product, currencyName, chain, deliveryType)
            handleUnderTx(false)
        } else {
            handleOnFail()
            handleUnderTx(false)
        }
        
    }, [publicKey, sendTransaction, connection]);

    return (
        <Button onClick={onClick} >
            Buy with Solana
        </Button>
    );
};