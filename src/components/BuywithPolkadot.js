import {
    web3Accounts,
    web3Enable,
    web3FromAddress,
    // web3ListRpcProviders,
    // web3UseRpcProvider
  } from '@polkadot/extension-dapp';
import {ApiPromise, WsProvider} from '@polkadot/api'
import React, { useCallback } from 'react';
import { Button} from '@mui/material';
import PropTypes from 'prop-types';

BuywithPolkadot.propTypes = {
  amountTransfer: PropTypes.number,
  account: PropTypes.object,
  fromAddr: PropTypes.string,
  toAddr: PropTypes.string,
  chain: PropTypes.string,
  handleToggle: PropTypes.func,
  handleUnderTx: PropTypes.func,
  handleOnSuccess: PropTypes.func,
  handleOnFail: PropTypes.func,
};

export default function BuywithPolkadot({amountTransfer, account, fromAddr, toAddr, chain, handleToggle, handleUnderTx, handleOnSuccess, handleOnFail}) {

    const onClick = useCallback(async () => {
        
      // Ref: https://polkadot.js.org/docs/extension/cookbook

      // returns an array of all the injected sources
      // (this needs to be called first, before other requests)
      const allInjected = await web3Enable('my cool dapp');

      // returns an array of { address, meta: { name, source } }
      // meta.source contains the name of the extension that provides this account
      // const allAccounts = await web3Accounts();

      const wsProvider = new WsProvider('wss://rpc.polkadot.io');
      const api = await ApiPromise.create({ provider: wsProvider });

      // the address we use to use for signing, as injected
      const SENDER = fromAddr;

      // finds an injector for an address
      const injector = await web3FromAddress(SENDER);

      // sign and send our transaction - notice here that the address of the account
      // (as retrieved injected) is passed through as the param to the `signAndSend`,
      // the API then calls the extension to present to the user and get it signed.
      // Once complete, the api sends the tx + signature via the normal process
      
      // Here the amount transfer only allow integer, needs further test on the unit
      api.tx.balances
      .transfer(toAddr, amountTransfer)
      .signAndSend(SENDER, { signer: injector.signer }, (status) => { 
        if (status.isInBlock) {
          console.log(`Completed at block hash #${status.asInBlock.toString()}`);
        } else {
            console.log(`Current status: ${status.type}`);
        }
      }).catch((error) => {
        console.log(':( transaction failed', error);
      });;
        
    });

    return (
        <Button onClick={onClick} >
            Pay with Wallet {account.meta.name}
        </Button>
    );
};