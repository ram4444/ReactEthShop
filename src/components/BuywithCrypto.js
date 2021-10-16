import React, { useState, useEffect, useContext } from 'react';
import Web3 from 'web3';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';

import { TestContext, ProdContext } from '../Context';
import { contractAddr } from '../properties/contractAddr';

let web3;
let contract;

async function init() {
  if (typeof web3 !== 'undefined') {
    console.log('Web3 found');
    web3 = new Web3(window.web3.currentProvider);
    // web3.eth.defaultAccount = web3.eth.accounts[0];
    contract = new web3.eth.Contract(abi, contractAddr.T777R);
  } else {
    console.error('web3 was undefined');
  }
}
init();

const { abi } = require('../abi/ERC777.json');

// const contract = new web3.eth.Contract(abi, contractAddr.T777R);

const ONBOARD_TEXT = 'Buy with Crypto';

BuywithCrypto.propTypes = {
  amountTransfer: PropTypes.string,
  toAddr: PropTypes.string
};

function BuywithCrypto({ amountTransfer, toAddr }) {
  const [buttonText] = React.useState(ONBOARD_TEXT);
  const [isDisabled] = React.useState(false);

  const context = useContext(TestContext);
  // console.log(amountTransfer);
  // console.log(toAddr);

  let acc = [];

  function ivkContractFuncBySEND(acct) {
    contract.methods
      .transfer(toAddr, web3.utils.toWei(amountTransfer, 'ether'))
      .send({
        from: acct,
        // value: web3.utils.toHex(web3.utils.toWei('100', 'gwei')),
        gasPrice: web3.utils.toHex(web3.utils.toWei('100', 'gwei')),
        // gas: web3.utils.toHex(42000),
        chainId: 4,
        data: ''
      })
      .then(console.log);
  }

  const onClick = () => {
    // Sending Ethereum to an address
    acc = window.ethereum.request({ method: 'eth_requestAccounts' });
    acc.then((result) => ivkContractFuncBySEND(result[0]));
  };
  return (
    <Button variant="contained" sx={{ mb: 5, mt: 2 }} disabled={isDisabled} onClick={onClick}>
      {buttonText}
    </Button>
  );
}

export default BuywithCrypto;
