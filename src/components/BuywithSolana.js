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
  // chain: PropTypes.string,
  // currencyName: PropTypes.string,
  // product: PropTypes.object,
  // handleClosedModal: PropTypes.func,
  // handleUnderTx: PropTypes.func,
};

export default function BuywithSolana({amountTransfer, toAddr}) {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const onClick = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();

        console.log(amountTransfer)
        console.log(toAddr)
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
    }, [publicKey, sendTransaction, connection]);

    return (
        <Button onClick={onClick} >
            Buy with Solana
        </Button>
    );
};