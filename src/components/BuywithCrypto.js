import React, { useState, useEffect, useContext } from 'react';
import Web3 from 'web3';
import PropTypes from 'prop-types';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import {uuid} from 'uuidv4'


import { TestContext, ProdContext } from '../Context';
// import { contractAddr } from '../properties/contractAddr';
import { urls } from '../properties/urls';
import { putItem, scanTable } from '../utils/awsClient'

const web3 = new Web3(window.web3.currentProvider);
const { abi } = require('../abi/ERC777.json');

let contract;

async function init() {
  if (typeof web3 !== 'undefined') {
    console.log('Web3 found');
    window.web3 = new Web3(window.web3.currentProvider);
    // web3.eth.defaultAccount = web3.eth.accounts[0];
  } else {
    console.error('web3 was undefined');
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

const ONBOARD_TEXT = 'Buy with Crypto';

BuywithCrypto.propTypes = {
  amountTransfer: PropTypes.string,
  toAddr: PropTypes.string,
  contractAddr: PropTypes.string,
  chain: PropTypes.string,
  currencyName: PropTypes.string,
  product: PropTypes.object,
};

function BuywithCrypto({ amountTransfer, toAddr, contractAddr, chain, currencyName, product}) {
  const [buttonText] = React.useState(ONBOARD_TEXT);
  const [isDisabled] = React.useState(false);

  const [openLoadScreen, setOpenLoadScreen] = React.useState(false);
  const handleClose = () => {
    setOpenLoadScreen(false);
  };
  const handleToggle = () => {
    setOpenLoadScreen(!openLoadScreen);
  };

  const context = useContext(TestContext);
  // console.log(amountTransfer);
  // console.log(toAddr);

  let acc = [];
  let abiUse;

  function ivkContractFuncBySEND(acct) {
    // Query the abi by the follow url as sample
    // const response = await fetch('https://api-ropsten.etherscan.io/api?module=contract&action=getabi&address=0xC1dcBB3E385Ef67f2173A375F63f5F4361C4d2f9&apikey=YourApiKeyToken');
    
    // Get the gas price first
    web3.eth.getGasPrice().then((result) => {
      
      console.log('GasFee in Wei')
      console.log(result)

      let gasFee
      let unit
      if (currencyName.includes("Tether")) {
        // For adjustment of USDT
        unit='mwei'
      } else {
        unit='ether'
      }

      let chainIdUse;
      switch (chain) {
        case 'Rinkeby':
          chainIdUse = '0x4';
          // gasFee = web3.utils.toHex(web3.utils.toWei('100', 'gwei'))
          gasFee = web3.utils.toBN(Math.round(web3.utils.fromWei('188729959600000', 'gwei')))
          if (currencyName.includes("Tether")) {
            unit='ether'
          }
          break;
        case 'Mainnet':
          chainIdUse = '0x1';
          gasFee = web3.utils.toBN(Math.round(web3.utils.fromWei(result, 'gwei')))
          console.log(gasFee)
          break;
        default:
          chainIdUse = '0x4';
          // gasFee = web3.utils.toHex(web3.utils.toWei('100', 'gwei'))
          gasFee = web3.utils.toBN(Math.round(web3.utils.fromWei('188729959600000', 'gwei')))
          if (currencyName.includes("Tether")) {
            unit='ether'
          }
      }

      if (currencyName.includes("Ethereum")) {
        console.log(`Read to send ${currencyName} with no contract address`)
        web3.eth.sendTransaction({
          from: acct, 
          to: toAddr, 
          value: web3.utils.toWei(amountTransfer, 'ether'), 
          gas: gasFee
        })
        .then((receipt) => {
          console.log(receipt)
          handleClose()
        });
      } else {
        console.log(`Read to send ${currencyName}`)
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
            .then((receipt) => {
              handleClose()
              console.log(receipt)
              // console.log(Object.fromEntries(receipt))
              // const str = Object.fromEntries(receipt)
              const eventsjson = JSON.stringify(receipt.events)
              
              let contractAddrPass // DynamoDB npot accept null value
              if ((currencyName.includes("Ethereum")) || receipt.contractAddress===null){
                contractAddrPass=''
              } else {
                contractAddrPass=receipt.contractAddress
              }
              const uid=uuid()
              // console.log(uid)
              const txStatus= receipt.status.toString()
              const txIndex=receipt.transactionIndex.toString();
              const record=
              { 
                // MAP type need hard code
                "order_id": { S: uid },
                // Info from drupal
                "currencyName": {S: currencyName},
                "chain" : {S: chain},
                "product_id": {S: product.id},
                "product_name": {S: product.name},
                "product_cover": {S: product.cover},
                "product_price": {N: product.price},
                // Info from transaction return
                "blockHash": { S: receipt.blockHash },
                "blockNumber": { N: receipt.blockNumber.toString() },
                "contractAddress": { S: contractAddrPass },
                "cumulativeGasUsed": { N: receipt.cumulativeGasUsed.toString() },
                "effectiveGasPrice": { N: receipt.effectiveGasPrice.toString() },
                "fromAddr": {S: receipt.from},
                "toAddr": {S: receipt.to},
                "gasUsed": {N: receipt.gasUsed.toString()},
                
                "tx_status": {BOOL: receipt.status},
                
                "transactionHash": {S: receipt.transactionHash},
                "transactionIndex": {N: receipt.transactionIndex.toString()},
                
                "tx_type": {S: receipt.type},
                
                "tx_events": { S: eventsjson }
              }
                
              putItem('orders',record)
            });
          
        }) 
      }
    
    })
  }

  const onClick = () => {
    // Sending Ethereum to an address
    acc = window.ethereum.request({ method: 'eth_requestAccounts' });
    acc.then((result) => {
      console.log('result when call')
      console.log(result)
      handleToggle()
      ivkContractFuncBySEND(result[0])
    });
  };
  return (
    <><Button variant="contained" sx={{ mb: 5, mt: 2 }} disabled={isDisabled} onClick={onClick}>
      {buttonText}
    </Button><div>
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

export default BuywithCrypto;
