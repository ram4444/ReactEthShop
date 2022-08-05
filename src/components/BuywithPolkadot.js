import {
  web3Accounts,
  web3Enable,
  web3FromAddress,
  // web3ListRpcProviders,
  // web3UseRpcProvider
} from '@polkadot/extension-dapp';
import {ApiPromise, WsProvider} from '@polkadot/api'
import Identicon from '@polkadot/react-identicon';
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
       
      // example for other end point
      // https://docs.moonbeam.network/builders/get-started/endpoints/
      const wsProvider = new WsProvider('wss://rpc.polkadot.io');
      const api = await ApiPromise.create({ provider: wsProvider });

      // Test area
      const header = await api.rpc.chain.getHeader()
      const chain = await api.rpc.system.chain()
      console.log(header)
      console.log(chain)

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
          const receipt = {
            "from": fromAddr,
            "blockHash": status.asInBlock.toString()
          }
          handleOnSuccess(receipt)
          // processReceipt(receipt, product, currencyName, chain, deliveryType)
          handleUnderTx(false)
        } else {
            console.log(`Current status: ${status.type}`);
        }
      }).catch((error) => {
        console.log(':( transaction failed', error);
        handleOnFail()
        handleUnderTx(false)
      });;
        
    });

    // size (optional) is a number, indicating the size (in pixels, 64 as default)
    // theme (optional), depicts the type of icon, one of
    // 'polkadot', 'substrate' (default), 'beachball' or 'jdenticon'

    return (
      <>
        <Button onClick={onClick} >
          <Identicon
          value={toAddr}
          size={32}
          theme='polkadot'
        />
            Pay with Wallet {account.meta.name}
        </Button>
        </>
    );
};