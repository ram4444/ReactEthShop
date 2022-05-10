import React, { useState, useEffect, useContext } from 'react';
import Web3 from 'web3';
import PropTypes from 'prop-types';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { TestContext } from '../Context';
// import { contractAddr } from '../properties/contractAddr';
import { urls } from '../properties/urls';

// const web3 = new Web3(window.web3.currentProvider);
const { abi } = require('../abi/ERC777.json');

let contract;
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
      // walletFound=true
      console.log('Wallet found')
    } catch (error) {
      // User denied account access...
      console.error("User denied account access")
    }
  } else if (window.web3) {
    App.web3Provider = window.web3.currentProvider;
    // walletFound=true
    console.log('Wallet found [Legacy]')
  }
  // If no injected web3 instance is detected, fall back to Ganache
  else {
    console.error('web3 was undefined');
    // walletFound=false
  }
  web3 = new Web3(App.web3Provider);


  /*
  if (typeof web3 !== 'undefined') {
  console.log('Wallet found for donation');
    // window.web3 = new Web3(window.web3.currentProvider);
    // web3.eth.defaultAccount = web3.eth.accounts[0];
  } else {
    console.error('web3 was undefined for donation');
  }
  */


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

const ONBOARD_TEXT = 'Donate';

// const testPayableContract = web3.eth.connect()
DonateUSDT.propTypes = {
  amountTransfer: PropTypes.string,
  toAddr: PropTypes.string,
  contractAddr: PropTypes.string,
  chain: PropTypes.string,
  currencyName: PropTypes.string
};

function DonateUSDT({ amountTransfer, toAddr, contractAddr, chain, currencyName}) {
  const [buttonText] = React.useState(ONBOARD_TEXT);
  const [isDisabled] = React.useState(false);

  const context = useContext(TestContext);

  const [openLoadScreen, setOpenLoadScreen] = React.useState(false);
  const handleClose = () => {
    setOpenLoadScreen(false);
  };
  const handleToggle = () => {
    setOpenLoadScreen(!openLoadScreen);
  };

  const { usdtContractAddr, receiverAddr } = context;
  // const contract = new web3.eth.Contract(abi, usdtContractAddr);

  let acc = [];
  let abiUse;

  function ivkContractFuncBySEND(acct) {

    // Get the gas price first
    web3.eth.getGasPrice().then((result) => {
      console.log('GasFee in Wei')
      console.log(result)
      
      // console.log('Round in Gwei')
      // console.log(gasFee)
      
      // Query the abi by the follow url as sample
      // const response = await fetch('https://api-ropsten.etherscan.io/api?module=contract&action=getabi&address=0xC1dcBB3E385Ef67f2173A375F63f5F4361C4d2f9&apikey=YourApiKeyToken');
      
      let gasFee
      let unit
      if (currencyName.includes("Tether")) {
        unit='mwei'
      } else {
        unit='ether'
      }

      let chainIdUse;
      switch (chain) {
        case 'Rinkeby':
          chainIdUse = '0x4';
          // gasFee = web3.utils.toHex(web3.utils.toWei('100', 'gwei'))
          gasFee = web3.utils.toBN(Math.round(web3.utils.fromWei(result, 'gwei')))
          // gasFee = web3.utils.toBN(web3.utils.toWei('100', 'gwei'))
          if (currencyName.includes("Tether")) {
            unit='ether'
          }
          break;
        case 'Mainnet':
          chainIdUse = '0x1';
          gasFee = web3.utils.toBN(Math.round(web3.utils.fromWei(result, 'gwei')))
          break;
        default:
          chainIdUse = '0x4';
          // gasFee = web3.utils.toHex(web3.utils.toWei('100', 'gwei'))
          gasFee = web3.utils.toBN(Math.round(web3.utils.fromWei(result, 'gwei')))
          // gasFee = web3.utils.toBN(web3.utils.toWei('100', 'gwei'))
          if (currencyName.includes("Tether")) {
            unit='ether'
          }
      }
    
      if (currencyName.includes("Ethereum")) {
        web3.eth.sendTransaction({
          from: acct, 
          to: toAddr, 
          value: web3.utils.toWei(amountTransfer, 'ether'), 
          gas: gasFee
        })
        .on('error', (error, receipt) => {
          console.log('error')
          console.log(error)
          handleClose()
        })
        .then((receipt) => {
          console.log(receipt)
        })
        ;
      } else {
        promiseHttpAbi(chain, contractAddr).then((response) => {
          if (response.data.status === '1') {
            console.log(response.data.message);
            abiUse = JSON.parse(response.data.result);
            contract = new web3.eth.Contract(abiUse, contractAddr);
            
          } else {
            console.log(response.message);
            console.log(response.result);
            console.log('Query ABI from Etherscan fail, use lacal instead');
            contract = new web3.eth.Contract(abi, contractAddr);
          }
          
          contract.methods
            .transfer(toAddr, web3.utils.toWei(amountTransfer, unit))
            .send({
              from: acct,
              // value: web3.utils.toHex(web3.utils.toWei('100', 'gwei')),
              gas: gasFee,
              // gas: web3.utils.toHex(42000),
              chainId: chainIdUse,
              data: ''
            })
            .on('error', (error, receipt) => {
              console.log('error')
              console.log(error)
              handleClose()
            })
            .then((receipt) => {
              handleClose()
              console.log(receipt)
              // We can save the receipt and show it on the home page for the donation
            })
            ;
        }) 
      }
    
    })

  }

  const onClick = () => {
    // Sending Ethereum to an address
    acc = window.ethereum.request({ method: 'eth_requestAccounts' });
    acc.then((result) => ivkContractFuncBySEND(result[0]));
    handleToggle()
  };
  return (
    <>
    <Button variant="contained" disabled={isDisabled} onClick={onClick}>
      {buttonText}
    </Button>

    <div>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={openLoadScreen}
          onClick={handleClose}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </div></>
  );
}

export default DonateUSDT;
