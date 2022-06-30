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
import ConnectSolana from './ConnectSolana';
import BuywithERCnew from './BuywithERCnew';

import { urls } from '../properties/urls';
import { putItem, putItemNotification } from '../utils/awsClient'
import { triggerTransaction } from '../utils/ethUtil';
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
  handleUnderTx: PropTypes.func,
};

let deliveryType;

function BuywithCrypto({ amountTransfer, toAddr, contractAddr, chain, currencyName, product, handleClosedModal, handleUnderTx}) {
  console.log(product.deliveryTypeList)
  
  const [buttonText, setButtonText] = React.useState(ONBOARD_TEXT);
  const [buyButtonDisable, setBuyButtonDisable] = React.useState(!enableBuyButton);
  const [openLoadScreen, setOpenLoadScreen] = React.useState(false);
  const [openLoadCircle, setOpenLoadCircle] = React.useState(true);
  const [openFinishTick, setOpenFinishTick] = React.useState(false);
  const [openFinishX, setOpenFinishX] = React.useState(false);
  const [defaultDeliveryRadio, setDefaultDeliveryRadio] = React.useState(product.deliveryTypeList[0]);

  const handleClose = () => {
    if (openFinishTick || openFinishX) {
      console.log('Close loading screen')
      setOpenLoadScreen(false);
      handleClosedModal(openFinishTick, openFinishX)
    }
  };
  const handleToggle = () => {
    setOpenLoadScreen(!openLoadScreen);
  };

  function handleDeliveryTypeChange(type) {
    console.log('Change the const to')
    console.log(type)
    deliveryType=type
  }

  const context = useContext(TestContext);


  const onSuccess = (receipt) => {
    console.log("Transaction successful")
    handleToggle()
    setOpenLoadCircle(false)
    setOpenFinishTick(true)
    setOpenFinishX(false)
    processReceipt(receipt, product, currencyName, chain, deliveryType)
    handleUnderTx(false)
  }

  const onFail = (receipt) => {
    console.log("Fail to transfer")
    handleToggle()
    setOpenLoadCircle(false)
    setOpenFinishTick(false)
    setOpenFinishX(true)
    handleUnderTx(false)
  }

  const DeliveryTypeTxt = {
    themselves: "by Buyers",
    collectpt: "Collection Point",
    door: "Door to door"
  };

  const btnERC = (
    <BuywithERCnew
          amountTransfer={amountTransfer} 
          toAddr={toAddr} 
          contractAddr={contractAddr} 
          chain={chain} 
          currencyName={currencyName} 
          product={product} 
          handleToggle={handleToggle}
          handleUnderTx={handleUnderTx}
          handleClosedModal={handleClose} 
          handleOnSuccess={onSuccess}
          handleOnFail={onFail}
        />
  )

  const btnSolana = (
    <ConnectSolana amountTransfer={amountTransfer} toAddr={toAddr} chain={chain}/>
  )

  let btn
  if (chain.includes('Solana')) {
    btn = btnSolana
  } else {
    btn = btnERC
  }

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
        
        { btn }
        
      </Stack>
      <div>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2 }}
          open={openLoadScreen}
          onClick={handleClose}
        >
          <Stack justifyContent="center" >
            <CircularProgress color="inherit" sx={
                !openLoadCircle ? { display: 'none' } : 
                { visibility: 'visible'}} />
            
            <Stack sx={!openFinishTick ? { display: 'none' } : { visibility: 'visible', justifyContent: 'center'}}>
              <Iconify icon="mdi:check" 
                sx={{width: 128, height: 128, margin: 'auto'}} />
              <Typography variant="h3" align='center'>
                  Transaction Success
              </Typography>
              <Typography variant="subtitle2" align='center'>
                  Press to continue
              </Typography>
            </Stack>
            
            <Stack sx={!openFinishX ? { display: 'none' } : { visibility: 'visible', justifyContent: 'center'}}>
              <Iconify icon="codicon:error"
                sx={{width: 128, height: 128, margin: 'auto'}} />
              <Typography variant="h3" >
                  Transaction Fail
              </Typography>
              <Typography variant="subtitle2" align='center'>
                  Press to continue
              </Typography>
            </Stack>
          </Stack>
        </Backdrop>
      </div></>
  );

}

export default BuywithCrypto;
