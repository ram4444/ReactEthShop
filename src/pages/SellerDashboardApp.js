import React, { useState, useEffect, useContext } from 'react';

import { faker } from '@faker-js/faker';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography } from '@mui/material';

import {uuid} from 'uuidv4'
import Cookies from 'js-cookie';

// components
import Page from '../components/Page';
import Iconify from '../components/Iconify';
// sections
import {
  AppTasks,
  AppNewsUpdate,
  AppOrderTimeline,
  AppCurrentVisits,
  AppWebsiteVisits,
  AppTrafficBySite,
  AppWidgetSummary,
  AppCurrentSubject,
  AppConversionRates,
  LatestOrdersUpdate,
  DeliveredOrdersUpdate
} from '../sections/@dashboard/app';
// util
import { scanTable, queryOrdersByReceiver, queryDeliveredOrdersByReceiver } from '../utils/awsClient'


// ----------------------------------------------------------------------




export default function SellerDashboardApp() {
  const [orderList, setOrderList] = React.useState([]);
  const [deliveredOrderList, setDeliveredOrderList] = React.useState([]);
  
  let qR=[];
  let qRDelivered=[];
  let usr;
  function init() {
    console.log('init')
    const acc = window.ethereum.request({ method: 'eth_requestAccounts' });
    acc.then((result) => {
      usr= result[0]
      console.log(usr)
    }).then(()=> {
      queryDyDb(usr)
      queryDyDbDeliveryFinished(usr)
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
  
  

  useEffect(()=> {
    console.log('useEffect')
    init()
  }, []);
  

  
  
  
  const theme = useTheme();

  console.log(orderList);
  console.log(deliveredOrderList);

  return (
    <Page title="Dashboard">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography>

        <Grid container spacing={3}>

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
      </Container>
    </Page>
  );
}
