import React, { useState, useEffect, useContext } from 'react';
import Web3 from 'web3';
import { faker } from '@faker-js/faker';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography } from '@mui/material';

// components
import Page from '../components/Page';
// sections
import {
  BuyRecordsUpdate,
} from '../sections/@dashboard/app';
// util
import { queryOrdersByOrderer } from '../utils/awsClient'


// ----------------------------------------------------------------------
const App = new Web3()

export default function BuyerDashboardApp() {
  const [orderList, setOrderList] = React.useState([]);
  const [isWalletFound, setWalletFound] = useState(false);
  
  let qR=[];
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

    const acc = window.ethereum.request({ method: 'eth_requestAccounts' });
    acc.then((result) => {
      usr= result[0]
      console.log(usr)
    }).then(()=>queryDyDb(usr))
    
  }

  function queryDyDb(addr) {
    queryOrdersByOrderer(addr).then((queryResult) => {
      console.log('Query the DB')
      qR=queryResult.Items
      setOrderList(qR)
    })
  }
  
  

  useEffect(()=> {
    console.log('useEffect')
    init()
  }, []);
  

  
  
  
  const theme = useTheme();

  return (
    <Page title="Dashboard">
      <Container maxWidth="xl">
      {isWalletFound && (
        <>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Buyer Dashboard
        </Typography>

        
        <Grid container spacing={3}>

          <Grid item xs={12} md={6} lg={8}>
            <BuyRecordsUpdate
              title="Latest Orders"
              list={orderList.map((_, index) => ({
                id: _.order_id,
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
              }))}
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
            Pleast connect the wallet to show your purchase record
          </Typography>
          </>
        )}
      </Container>
    </Page>
  );
}
