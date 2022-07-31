import React, { useMemo, useState, useEffect } from 'react';
import { Stack } from '@mui/material';
import {
    web3Accounts,
    web3Enable,
    web3FromAddress,
    web3ListRpcProviders,
    web3UseRpcProvider
  } from '@polkadot/extension-dapp';
  import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";  
import PropTypes from 'prop-types';
import BuywithPolkadot from './BuywithPolkadot';


// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

ConnectPolkadot.propTypes = {
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

export default function ConnectPolkadot({amountTransfer, toAddr, chain, handleToggle, handleUnderTx, handleOnSuccess, handleOnFail}) {
const [allAccount, setAllAccount] = useState([]);

  const getAccounts = async () => {
    const extensions = await web3Enable("my cool dapp");
    if (extensions.length === 0) {
      return;
    }
    const allAccounts = await web3Accounts();
    setAllAccount(allAccounts);
  };

  useEffect(() => {
    getAccounts();
  }, []);
    

    return (
        <>
        <Stack direction="column" alignItems="center" justifyContent="center" >
        {typeof allAccount !== "undefined"
          ? allAccount.map((account) => (
                <div key={account.address}>
                  <BuywithPolkadot 
                    amountTransfer={amountTransfer} 
                    account={account}
                    fromAddr={account.address}
                    toAddr={toAddr}
                    chain={chain}
                    handleToggle={handleToggle}
                    handleUnderTx={handleUnderTx}
                    handleOnSuccess={handleOnSuccess}
                    handleOnFail={handleOnFail}
                />
                </div>
              ))
          : ""}{" "}
        </Stack>
        </>
    );
};