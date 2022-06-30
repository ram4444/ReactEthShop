import React, { useState, useEffect, useContext } from 'react';
import Web3 from 'web3';
import PropTypes from 'prop-types';
import axios from 'axios';
// Material
import { Button, Backdrop, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, CircularProgress, Stack, Typography} from '@mui/material';

import {uuid} from 'uuidv4'
import Cookies from 'js-cookie';
import Iconify from './Iconify';

import { TestContext, ProdContext } from '../Context';
// import { contractAddr } from '../properties/contractAddr';
import { urls } from '../properties/urls';
import { putItem, putItemNotification } from '../utils/awsClient'

import { triggerTransaction } from '../utils/ethUtil';

const { abi } = require('../abi/ERC777.json');

let contract;
let enableBuyButton = false;
let walletFound = false;
let cookiesFound = false;
let ONBOARD_TEXT = 'Buy with Crypto';

const App = new Web3()
let web3

async function init() {
  
  if (window.ethereum) {
    App.web3Provider = window.ethereum;
    try {
      // Request account access
      
      // Depricatd soon 
      // await window.ethereum.enable();
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      walletFound=true
      console.log('Wallet found')
    } catch (error) {
      // User denied account access...
      console.error("User denied account access")
    }
  } else if (window.web3) {
    App.web3Provider = window.web3.currentProvider;
    walletFound=true
    console.log('Wallet found [Legacy]')
  }
  // If no injected web3 instance is detected, fall back to Ganache
  else {
    console.error('web3 was undefined');
    walletFound=false
  }
  web3 = new Web3(App.web3Provider);

  if (Cookies.get('address1')) {
    cookiesFound=true
  } else {
    cookiesFound=false
  }

  if (cookiesFound && walletFound) {
    enableBuyButton=true;
    ONBOARD_TEXT = 'Buy with ERC';
  } else { 
    enableBuyButton=false;
    if (!walletFound) {
      ONBOARD_TEXT = 'Wallet NOT Found';
    } else {
      ONBOARD_TEXT = 'Deliver Address NOT Found';
    }
  }
}
init();

function promiseHttpAbi(chain, contractAddr) {
  let apiURL;
  switch (chain) {
    case 'Rinkeby':
      apiURL = urls.etherscan_rinkeby;
      break;
    case 'Mainnet':
      apiURL = urls.etherscan_mainnet;
      break;
    default:
      apiURL = urls.etherscan_rinkeby;
  }

  return axios({
    method: 'get',
    url: apiURL+contractAddr,
    responseType: 'json',
    // crossDomain: true,
    // headers: { 'Access-Control-Allow-Origin': '*' }
  })
    .then((response) => {
      console.log(`HTTP call to ${chain} Etherscan is done`);
      console.log(response);
      return response;
  })
    
}

BuywithERC.propTypes = {
  amountTransfer: PropTypes.string,
  toAddr: PropTypes.string,
  contractAddr: PropTypes.string,
  chain: PropTypes.string,
  currencyName: PropTypes.string,
  product: PropTypes.object,
  handleToggle: PropTypes.func,
  handleUnderTx: PropTypes.func,
  handleOnSuccess: PropTypes.func,
  handleOnFail: PropTypes.func,
};

function BuywithERC({ amountTransfer, toAddr, contractAddr, chain, currencyName, product, handleToggle, handleUnderTx, handleOnSuccess, handleOnFail}) {
  console.log(product.deliveryTypeList)
  
  const [buttonText, setButtonText] = React.useState(ONBOARD_TEXT);
  const [buyButtonDisable, setBuyButtonDisable] = React.useState(!enableBuyButton);

  let acc = [];
  

  const onClickBuy = async() => {
    // Sending Ethereum to an address
    acc = window.ethereum.request({ method: 'eth_requestAccounts' });
    acc.then((result) => {
      handleToggle()
      handleUnderTx(true)
      triggerTransaction(chain, contractAddr, currencyName, result[0], toAddr, amountTransfer, handleOnSuccess, handleOnFail)
    });
  };

  return ( 
    <Button variant="contained" sx={{ mb: 5, mt: 2, maxHeight: 75 }} disabled={buyButtonDisable} onClick={()=>onClickBuy()}>
      {buttonText}
    </Button>

  );

}

export default BuywithERC;
