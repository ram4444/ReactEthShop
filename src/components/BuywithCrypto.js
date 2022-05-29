import React, { useState, useEffect, useContext } from 'react';
import Web3 from 'web3';
import PropTypes from 'prop-types';
import axios from 'axios';
// Material
import { styled } from '@mui/material/styles';
import { Button, Backdrop, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, CircularProgress, Stack} from '@mui/material';

import {uuid} from 'uuidv4'
import Cookies from 'js-cookie';


import { TestContext, ProdContext } from '../Context';
// import { contractAddr } from '../properties/contractAddr';
import { urls } from '../properties/urls';
import { putItem,putItemNotification } from '../utils/awsClient'

// const web3 = new Web3(window.web3.currentProvider);
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
  // legacy 
  /*
  if (typeof web3 !== 'undefined') {
    console.log('Web3 found');
    window.web3 = new Web3(window.web3.currentProvider);
    // web3.eth.defaultAccount = web3.eth.accounts[0];
    walletFound=true
  } else {
    console.error('web3 was undefined');
    walletFound=false
  }
  */

  if (Cookies.get('address1')) {
    cookiesFound=true
  } else {
    cookiesFound=false
  }

  if (cookiesFound && walletFound) {
    enableBuyButton=true;
    ONBOARD_TEXT = 'Buy with Crypto';
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

async function processReceipt(receipt, product, currencyName, chain, deliveryType) {
  console.log(receipt)
  let eventsjson = JSON.stringify(receipt.events)
              
  let contractAddrPass // DynamoDB not accept null value
  let toAddrPass;
  if ((currencyName.includes("Ethereum")) ){
    contractAddrPass=''
    eventsjson='{}' // No event for Ethereum
    toAddrPass=receipt.to
  } else {
    contractAddrPass=receipt.to
    // eventsjson = JSON.stringify(receipt.events)
    toAddrPass=receipt.events.Transfer.returnValues.to
  }

  // In custom TOKEN contract address is in receipt.to, Receiver is in receipt.events.Transfer.returnValues.to
  // 
  
  /*
  With Cap letters:
  receipt.events.Transfer.returnValues.to
  product.receiverAddr

  Lower Cap letters only:
  eth_request_account
  receipt.to, receipt.from
  */
  console.log(eventsjson)
  const uid=uuid()
  // console.log(uid)
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
    "product_coverFilename": {S: product.coverFilename},
    "product_price": {N: product.price},
    "product_email": {S: product.email},
    "product_phone": {S: product.phone},
    "product_location": {S: product.location},
    // Info from transaction retur
    "blockHash": { S: receipt.blockHash },
    "blockNumber": { N: receipt.blockNumber.toString() },
    "contractAddress": { S: contractAddrPass },
    "cumulativeGasUsed": { N: receipt.cumulativeGasUsed.toString() },
    "effectiveGasPrice": { N: receipt.effectiveGasPrice.toString() },
    "fromAddr": {S: receipt.from.toLowerCase()},
    "toAddr": {S: product.receiverAddr.toLowerCase()},
    "gasUsed": {N: receipt.gasUsed.toString()},
    "tx_status": {BOOL: receipt.status},
    "transactionHash": {S: receipt.transactionHash},
    "transactionIndex": {N: receipt.transactionIndex.toString()},
    "tx_type": {S: receipt.type},
    "tx_events": { S: eventsjson },
    // Delivery Info From Cookies
    "buyer_name": {S: Cookies.get('username')},
    "buyer_email": {S: Cookies.get('email')},
    "delivery_addr1": {S: Cookies.get('address1')},
    "delivery_addr2": {S: Cookies.get('address2')},
    "delivery_type": {S: deliveryType}
  }
    
  putItem('orders',record)

  // Msg show to buyer
  const uidMsgBuyer=uuid()
  const recordMsg2Buyer=
  { 
    "id": { S: uidMsgBuyer },
    "userAddr": { S: receipt.from.toLowerCase()},
    "related_id": { S: uid },
    "type": {S: 'order_place'},
    "title": {S: `You have placed a new order ${product.name}`},
    "description": {S: 'waiting for shipping'},
    "createdAt": {S: new Date()}
  }
  putItemNotification(recordMsg2Buyer)

  // Msg show to buyer
  const uidMsgSeller=uuid()
  const recordMsg2Seller=
  { 
    "id": { S: uidMsgSeller },
    "userAddr": { S: product.receiverAddr.toLowerCase()},
    "related_id": { S: uid },
    "type": {S: 'order_received'},
    "title": {S: `You have received a new order for ${product.name}`},
    "description": {S: 'Please arrange the delivery'},
    "createdAt": {S: new Date()}
  }
  putItemNotification(recordMsg2Seller)
}

BuywithCrypto.propTypes = {
  amountTransfer: PropTypes.string,
  toAddr: PropTypes.string,
  contractAddr: PropTypes.string,
  chain: PropTypes.string,
  currencyName: PropTypes.string,
  product: PropTypes.object,
  handleClosedModal: PropTypes.func,
};

let deliveryType;

function BuywithCrypto({ amountTransfer, toAddr, contractAddr, chain, currencyName, product, handleClosedModal}) {
  console.log(product.deliveryTypeList)
  
  const [buttonText, setButtonText] = React.useState(ONBOARD_TEXT);
  const [buyButtonDisable, setBuyButtonDisable] = React.useState(!enableBuyButton);
  const handleBuyButtonDisable = () => {
    setBuyButtonDisable(false);
  };
  const handleToggleBuyButtonDisable = () => {
    setBuyButtonDisable(!buyButtonDisable);
  };

  const [openLoadScreen, setOpenLoadScreen] = React.useState(false);
  const handleClose = () => {
    setOpenLoadScreen(false);
    handleClosedModal()
  };
  const handleToggle = () => {
    setOpenLoadScreen(!openLoadScreen);
  };

  const [defaultDeliveryRadio, setDefaultDeliveryRadio] = React.useState(product.deliveryTypeList[0]);
  // const [deliveryTypeList, setDeliveryTypeList] = React.useState([]);
  
  // const [deliveryType, setDeliveryType] = React.useState('');
  function handleDeliveryTypeChange(type) {
    console.log('Change the con4st to')
    console.log(type)
    deliveryType=type
  }
  // 

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
        .on('error', (error, receipt) => {
          console.log('error')
          console.log(error)
          handleClose()
        })
        .then((receipt) => {
          console.log(receipt)
          processReceipt(receipt, product, currencyName, chain, deliveryType)
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
            console.log('Query ABI from Etherscan fail, use local ABI file instead');
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
              processReceipt(receipt, product, currencyName, chain, deliveryType)
            });
          
        }) 
      }
    
    })
  }

  const onClickBuy = () => {
    // Sending Ethereum to an address
    acc = window.ethereum.request({ method: 'eth_requestAccounts' });
    acc.then((result) => {
      console.log('result when call')
      console.log(result)
      // console.log('submit the Type as')
      // console.log(deliveryType)
      handleToggle()
      ivkContractFuncBySEND(result[0])
    });
  };

  const DeliveryTypeTxt = {
    themselves: "by Buyers",
    collectpt: "Collection Point",
    door: "Door to door"
  };

  handleDeliveryTypeChange("themselves")
  return (
    <>
      <Stack direction="row" spacing={2} pt={2} alignItems="center" justifyContent="center" >
        <div maxWidth='40%'>
          <FormControl>
            <FormLabel id="demo-radio-buttons-group-label">Delivery Method</FormLabel>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue={defaultDeliveryRadio}
              name="radio-buttons-group"
              // onChange={()=>handleDeliveryTypeChange}
            >
              {product.deliveryTypeList.map((submitValue) => {
                const labelSelect=DeliveryTypeTxt[submitValue]
                return (<FormControlLabel 
                        key={submitValue} 
                        value={submitValue} 
                        control={<Radio />} 
                        label={labelSelect}
                        onClick={()=>handleDeliveryTypeChange(submitValue)}
                        />)
              })}
            
            </RadioGroup>
          </FormControl>
        </div>
        
        <Button variant="contained" sx={{ mb: 5, mt: 2, maxHeight: 75 }} disabled={buyButtonDisable} onClick={()=>onClickBuy()}>
          {buttonText}
        </Button>
      </Stack>
      <div>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2 }}
          open={openLoadScreen}
          onClick={handleClose}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </div></>
  );

}

export default BuywithCrypto;
