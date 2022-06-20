import React, { useState, useEffect, useContext } from 'react';
import MetaMaskOnboarding from '@metamask/onboarding';
import Web3 from 'web3';
import axios from 'axios';
import { faker } from '@faker-js/faker';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography, Button, Backdrop, CircularProgress, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import {uuid} from 'uuidv4'
import Cookies from 'js-cookie';

// components
import Page from '../components/Page';
import Iconify from '../components/Iconify';
// sections
import {
  LatestOrdersUpdate,
  DeliveredOrdersUpdate
} from '../sections/@dashboard/app';
// util
import { scanTable, queryOrdersByReceiver, queryDeliveredOrdersByReceiver, queryIcoOrdersByAddr, putItemICODelivered, queryDeilveredIcoOrdersByIssueAddr } from '../utils/awsClient'
import { urls } from '../properties/urls';
import { triggerTransaction } from '../utils/ethUtil';
// import { netId } from 'src/Context';

const { abi } = require('../abi/ERC777.json');
// ----------------------------------------------------------------------



// let walletFound = false;

const App = new Web3()
let web3


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




export default function SellerDashboardApp() {
  const [orderList, setOrderList] = React.useState([]);
  const [deliveredOrderList, setDeliveredOrderList] = React.useState([]);
  const [icoOrderList, setIcoOrderList] = React.useState([]);
  const [deliverdIcoOrderList, setDeliverdIcoOrderList] = React.useState([]);
  const [currentNetId, setCurrentNetId] = useState('UNKNOWN');
  const [openLoadScreen, setOpenLoadScreen] = React.useState(false);
  const [openLoadCircle, setOpenLoadCircle] = React.useState(true);
  const [openFinishTick, setOpenFinishTick] = React.useState(false);
  const [openFinishX, setOpenFinishX] = React.useState(false);
  const [isWalletFound, setWalletFound] = useState(false);

  const handleClose = () => {
    if (openFinishTick || openFinishX) {
      console.log('Close loading screen')
      setOpenLoadScreen(false);
      // handleClosedModal(openFinishTick, openFinishX)
    }
  };
  const handleToggle = () => {
    setOpenLoadScreen(!openLoadScreen);
  };

  let qR=[];
  let qRDelivered=[];
  let qRICO=[];
  let qRICODelivered=[];
  let usr;

  async function init() {
    console.log('init')
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        
        // Depricatd soon 
        // await window.ethereum.enable();
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        setWalletFound(true)
        console.log('Wallet found')
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    } else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
      setWalletFound(true)
      console.log('Wallet found [Legacy]')
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      console.error('web3 was undefined');
      setWalletFound(false)
    }
    web3 = new Web3(App.web3Provider);
    let chainName;
  
    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      // setNetId(window.ethereum.chainId);
      console.log(window.ethereum.chainId);
      
      
      switch (window.ethereum.chainId) {
        case '0x1':
          setCurrentNetId('Mainnet');
          chainName=('Mainnet');
          break;
        case '0x3':
          setCurrentNetId('Ropsten');
          chainName=('Ropsten');
          break;
        case '0x4':
          setCurrentNetId('Rinkeby');
          chainName=('Rinkeby');
          break;
        case '0x5':
          setCurrentNetId('Goerli');
          chainName=('Goerli');
          break;
        default:
          setCurrentNetId('UNKNOWN');
          chainName=('UNKNOWN');
      }
  
    }



    const acc = window.ethereum.request({ method: 'eth_requestAccounts' });
    acc.then((result) => {
      usr= result[0]
      console.log(usr)
    }).then(async ()=> {
      queryDyDb(usr)
      queryDyDbDeliveryFinished(usr)
      await queryDyDbIco(usr)
      await queryDyDbDeliveredIco(usr) 
      await filterICOList(chainName)
    })
  }



  function queryDyDb(addr) {
    queryOrdersByReceiver(addr).then((queryResult) => {
      console.log('Query the DB done')
      qR=queryResult.Items
      setOrderList(qR)
    })
  }

  function queryDyDbDeliveryFinished(addr) {
    queryDeliveredOrdersByReceiver(addr).then((queryResult) => {
      console.log('Query the DB for delivered orders done')
      qRDelivered=queryResult.Items
      setDeliveredOrderList(qRDelivered)
    })
  }

  async function queryDyDbIco(addr) {
    await queryIcoOrdersByAddr(addr).then((queryResult) => {
      console.log('Query the DB for ICO orders done')
      qRICO=queryResult.Items
    })
  }

  async function queryDyDbDeliveredIco(addr) {
    await queryDeilveredIcoOrdersByIssueAddr(addr).then((queryResult) => {
      console.log('Query the DB for delivered ICO done')
      qRICODelivered=queryResult.Items
    })
  }

  async function filterICOList(chainName) {
    const arrDataGridNotfiltered=[]

    console.log('Start filtering ICO orders for chain')
    await qRICO.forEach((item,index) => {
      // console.log(item)
      if (item.chain.S===chainName){

        arrDataGridNotfiltered.push({
          id: index,
          ico_order_id: item.id.S,
          form_username: item.form_username.S,
          form_email: item.form_email.S,
          form_amount: item.form_amount.N,
          payerWalletAddr: item.payerWalletAddr.S,
          contract_addr: item.contract_addr.S,
          tokenName: item.token_name.S,
          chain: item.chain.S
        })
      }
    })

    console.log('Start filtering ICO orders for delivered')
    console.log('Remove the delivered record from the array')
    const icoList = []
    console.log('ICO order list after filtered by chain')
    console.log(arrDataGridNotfiltered)
    console.log('Deilivered ICO order list')
    console.log(qRICODelivered)
    arrDataGridNotfiltered.forEach( (icoItem) => {
      let alreadyDelivered =false
      qRICODelivered.forEach((deliveredItem) => {
        if (deliveredItem.ico_order_id.S===icoItem.ico_order_id) {
          alreadyDelivered=true
        }
      })
      if (alreadyDelivered) {
        console.log(`${icoItem.ico_order_id} already Delivered`)
      } else {
        icoList.push(icoItem)
      }
    })
    
    // console.log(arr)
    setIcoOrderList(icoList)
    
  }
  
  const columns = [
    { field: 'ico_order_id', headerName: 'ICO order ID', width: 120 },
    {
      field: 'form_username',
      headerName: 'Username',
      width: 150,
      editable: false,
    },
    {
      field: 'form_email',
      headerName: 'Email',
      width: 200,
      editable: false,
    },
    {
      field: 'contract_addr',
      headerName: 'Contract Addr',
      width: 200,
      editable: false,
      hide: true
    },
    {
      field: 'chain',
      headerName: 'Chain',
      width: 90,
      editable: false,
      hide: true
    },
    {
      field: 'tokenName',
      headerName: 'tokenName',
      width: 90,
      editable: false,
      hide: false
    },
    {
      field: 'payerWalletAddr',
      headerName: 'Payer Addr',
      width: 200,
      editable: false,
    },
    {
      field: 'form_amount',
      headerName: 'Amount',
      renderCell: (params) => {
        console.log({params})
        return (
          <strong>
            {params.value}
            <Button
              variant="contained"
              color="primary"
              size="small"
              style={{ marginLeft: 16 }}
              onClick={()=> {
                const acc = window.ethereum.request({ method: 'eth_requestAccounts' });
                acc.then((result) => {
                  console.log('eth_requestAccounts')
                  console.log(result)
                  ivkContractFuncBySEND(
                    result[0], 
                    params.row.contract_addr, // contractAddr
                    params.row.tokenName,
                    params.row.form_amount, 
                    params.row.payerWalletAddr,
                    params.row.ico_order_id,
                    params.row.chain)
                });
                
              }}
            >
              Send
            </Button>
          </strong>
        )
      },
    },
  ];

  useEffect(()=> {
    console.log('useEffect')
    init()
  }, []);
  
  // ---------- Button Trigger Function -----------------------------------
  async function ivkContractFuncBySEND(acct, contractAddr, tokenName, amount, toAddr, icoOrderId, chain) {
    async function onSuccess(receipt) {
      console.log("Transaction successful")
      handleToggle()
      setOpenLoadCircle(false)
      setOpenFinishTick(true)
      setOpenFinishX(false)
      // processReceipt(receipt, product, currencyName, chain, deliveryType)
      // handleUnderTx(false)
      console.log('put the ICO deliver record to DB')
      processICODeliver(icoOrderId,receipt,toAddr,amount,contractAddr,chain)
      
      console.log('Reflesh the ICO List every time')
      await queryDyDbIco(acct)
      await queryDyDbDeliveredIco(acct) 
      await filterICOList(chain)
      handleToggle()
    }

    function onFail(receipt) {
      console.log("Fail to transfer")
      handleToggle()
      setOpenLoadCircle(false)
      setOpenFinishTick(false)
      setOpenFinishX(true)
      // handleUnderTx(false)
    }

    handleToggle()
    setOpenLoadCircle(true)
    // handleUnderTx(true)
    setOpenFinishTick(false)
    setOpenFinishX(false)
    triggerTransaction(chain, contractAddr, tokenName, acct, toAddr, amount, onSuccess, onFail)
  }

  /*
  function ivkContractFuncBySENDOLD(acct, contractAddr, amount, toAddr, icoOrderId, chain) {
    // Query the abi by the follow url as sample
    // const response = await fetch('https://api-ropsten.etherscan.io/api?module=contract&action=getabi&address=0xC1dcBB3E385Ef67f2173A375F63f5F4361C4d2f9&apikey=YourApiKeyToken');
    
    // Get the gas price first
    web3.eth.getGasPrice().then((result) => {
      handleToggle()
      console.log('GasFee in Wei')
      console.log(result)

      let gasFee
      let unit

      let contract;
      let abiUse;

      // console.log(`Read to send ${currencyName}`)
      promiseHttpAbi(currentNetId, contractAddr).then((response) => {
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
          .transfer(toAddr, web3.utils.toWei(amount, unit))
          .send({
            from: acct,
            // value: web3.utils.toHex(web3.utils.toWei('100', 'gwei')),
            gas: gasFee,
            // gas: web3.utils.toHex(42000),
            // chainId: chainIdUse,
            data: ''
          })
          .on('error', (error, receipt) => {
            console.log('error')
            console.log(error)
            
          })
          .then(async (receipt) => {
            // handleClose()
            console.log(receipt)

            // put the record to DB
            // processReceipt(receipt, product, currencyName, chain, deliveryType)
            console.log('put the ICO deliver record to DB')
            processICODeliver(icoOrderId,receipt,toAddr,amount,contractAddr,chain)
            
            console.log('Reflesh the ICO List every time')
            await queryDyDbIco(acct)
            await queryDyDbDeliveredIco(acct) 
            await filterICOList(chain)
            handleToggle()
          });
        
      }) 
      
    
    })
  }
  */

  async function processICODeliver(icoOrderId,receipt,toAddr,amount,contractAddr,chain) {

    // In custom TOKEN contract address is in receipt.to, Receiver is in receipt.events.Transfer.returnValues.to
  
    const uid=uuid()
    // console.log(uid)
    const eventsjson = JSON.stringify(receipt.events)

    const record=
    { 
      // MAP type need hard code
      "id": { S: uid },
      "ico_order_id" : { S: icoOrderId},
      // info from form 
      
      // "form_username": {S: formUsername},
      // "form_email": {S: formEmail},
      "form_amount": {N: amount},
      "chain": {S: chain},
      
      // Info from transaction return
      "blockHash": { S: receipt.blockHash },
      "blockNumber": { N: receipt.blockNumber.toString() },
      "contractAddress": { S: contractAddr },
      "cumulativeGasUsed": { N: receipt.cumulativeGasUsed.toString() },
      "effectiveGasPrice": { N: receipt.effectiveGasPrice.toString() },
      "fromAddr": {S: receipt.from.toLowerCase()},
      "toAddr": {S: toAddr.toLowerCase()},
      "gasUsed": {N: receipt.gasUsed.toString()},
      "tx_status": {BOOL: receipt.status},
      "transactionHash": {S: receipt.transactionHash},
      "transactionIndex": {N: receipt.transactionIndex.toString()},
      "tx_type": {S: receipt.type},
      "tx_events": { S: eventsjson },

    }
    
    putItemICODelivered(record)
  }
  
  
  const theme = useTheme();

  console.log(orderList);
  console.log(deliveredOrderList);
  // At this stage the state value has been ready
  // ---------- Render-----------------------------------------------
  return (
    <Page title="Dashboard">
      <Container maxWidth="xl">
      {isWalletFound && (
        <>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Seller Dashboard
        </Typography>

        <Grid container spacing={3}>
            
          <Grid item xs={12} md={6} lg={8} height='400'>
            <div style={{ height: 400, width: '100%' }}>
            <Typography variant="h5" sx={{ mb: 5 }}>
              Pending ICO Orders
            </Typography>
            <DataGrid
              rows={icoOrderList}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              disableSelectionOnClick
            />
            </div>
          </Grid>
            
          
          <Grid item xs={12} md={6} lg={8}>
            <LatestOrdersUpdate
              title="Latest Orders Received"
              list={ orderList.map((_, index) => {
                
                let delivered=false
                deliveredOrderList.forEach((deliveredOrder) => {
                  console.log(_.order_id)
                  console.log(deliveredOrder.order_id.S)
                  if (deliveredOrder.order_id.S===_.order_id.S) {
                    
                    console.log('delivered')
                    delivered=true
                  }
                })
                if (delivered) {return null}
                return {
                  id: _.order_id.S,
                  title: _.product_name.S,
                  buyerName: _.buyer_name.S,
                  buyerEmail: _.buyer_email.S,
                  buyerAddr1: _.delivery_addr1.S,
                  buyerAddr2: _.delivery_addr2.S,
                  currency: _.currencyName.S,
                  price: _.product_price.N,
                  image: _.product_cover.S,
                  chain: _.chain.S,
                  txHash: _.transactionHash.S,
                  postedAt: faker.date.recent(),
                  fromAddr: _.fromAddr.S,
                  toAddr: _.toAddr.S,
                  deliveryType: _.delivery_type.S,
                  blockNumber: _.blockNumber.N,
                }
                
              }).filter(Boolean) }
                
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <DeliveredOrdersUpdate
              title="Delivered Orders"
              list={ deliveredOrderList.map((_, index) => ({
                  id: _.order_id.S,
                  title: _.product_name.S,
                  buyerName: _.buyer_name.S,
                  buyerEmail: _.buyer_email.S,
                  buyerAddr1: _.delivery_addr1.S,
                  buyerAddr2: _.delivery_addr2.S,
                  currency: _.currency.S,
                  price: _.product_price.N,
                  chain: _.chain.S,
                  txHash: _.txHash.S,
                  postedAt: faker.date.recent(),
                  fromAddr: _.fromAddr.S,
                  toAddr: _.toAddr.S,
                  deliveryType: _.delivery_type.S,
                  blockNumber: _.blockNumber.N,
                })).filter(Boolean) }
                
            />
          </Grid>


        </Grid>
        </>
        )}
        {!isWalletFound && (
          <>
          <Typography variant="h4" sx={{ mb: 5 }}>
            Wallet not found!
          </Typography>
          <Typography variant="h5" sx={{ mb: 5 }}>
            Pleast connect the wallet to show order received
          </Typography>
          </>
        )}
      </Container>
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
      </div>
    </Page>
  );
}
