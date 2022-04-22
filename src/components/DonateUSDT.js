import React, { useState, useEffect, useContext } from 'react';
import Web3 from 'web3';
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';
import { TestContext } from '../Context';
// import { contractAddr } from '../properties/contractAddr';

const web3 = new Web3(window.web3.currentProvider);
const console = require("console-browserify")
const { abi } = require('../abi/ERC777.json');

function init() {
  if (typeof web3 !== 'undefined') {
    console.log('Web3 found');
    window.web3 = new Web3(window.web3.currentProvider);
    // web3.eth.defaultAccount = web3.eth.accounts[0];
  } else {
    // console.error('web3 was undefined');
  }
}

init();

const ONBOARD_TEXT = 'Donate';

// const testPayableContract = web3.eth.connect()

function TransferERC777() {
  const [buttonText] = React.useState(ONBOARD_TEXT);
  const [isDisabled] = React.useState(false);

  const context = useContext(TestContext);
  const { usdtContractAddr, receiverAddr } = context;
  const contract = new web3.eth.Contract(abi, usdtContractAddr);

  let acc = [];

  function ivkContractFuncBySEND(acct) {
    contract.methods
      .transfer(receiverAddr, web3.utils.toWei('100', 'ether'))
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
    <Button variant="contained" disabled={isDisabled} onClick={onClick}>
      {buttonText}
    </Button>
  );
}

export default TransferERC777;
