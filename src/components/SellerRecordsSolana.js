import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet,   } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import React, { useCallback, useEffect } from 'react';
import { Button, Stack, Grid, Container, Typography } from '@mui/material';
import { faker } from '@faker-js/faker';
import PropTypes from 'prop-types';
import {
  LatestOrdersUpdate,
  DeliveredOrdersUpdate
} from '../sections/@dashboard/app';
// util
import { scanTable, queryOrdersByReceiver, queryDeliveredOrdersByReceiver, queryIcoOrdersByAddr, putItemICODelivered, queryDeilveredIcoOrdersByIssueAddr } from '../utils/awsClient'

BuyerRecordsSolana.propTypes = {
    langPack: PropTypes.object
};

export default function BuyerRecordsSolana({langPack}) {
    const [orderList, setOrderList] = React.useState([]);
    const [deliveredOrderList, setDeliveredOrderList] = React.useState([]);
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    
    let qR=[];
    let qRDelivered=[];

    const queryDyDb = useCallback(async(addr) =>{
        queryOrdersByReceiver(addr).then((queryResult) => {
            console.log('Query the DB for Solana orders is done')
            qR=queryResult.Items
            setOrderList(qR)
        })
    },[])
    
    const queryDyDbDeliveryFinished = useCallback(async(addr) => {
        queryDeliveredOrdersByReceiver(addr).then((queryResult) => {
            console.log('Query the DB for Solana delivered orders is done')
            qRDelivered=queryResult.Items
            setDeliveredOrderList(qRDelivered)
        })
    }, [])

    const fakeOnClick = useCallback(async () => {
        console.log(publicKey.toBase58().toLowerCase())
        queryDyDb(publicKey.toBase58().toLowerCase())
        queryDyDbDeliveryFinished(publicKey.toBase58().toLowerCase())
    },[publicKey, queryDyDb, queryDyDbDeliveryFinished]);

    useEffect(()=> {
        console.log('useEffect SellerRecordsSolana')
        fakeOnClick()
    }, [fakeOnClick]);

    return (
      <Grid container spacing={3}>

        <Grid item xs={12} md={6} lg={8}>
          <LatestOrdersUpdate
            title={langPack.sellerDashboard_latestOrder}
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
                txHash: 'N/A',
                postedAt: faker.date.recent(),
                fromAddr: _.fromAddr.S,
                toAddr: _.toAddr.S,
                deliveryType: _.delivery_type.S,
                blockNumber: _.blockNumber.N,
              }
              
            }).filter(Boolean) }
            langPack={langPack} 
          />
        </Grid>

        <Grid item xs={12} md={6} lg={8}>
          <DeliveredOrdersUpdate
            title={langPack.sellerDashboard_deliveredOrder}
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
                txHash: 'N/A',
                postedAt: faker.date.recent(),
                fromAddr: _.fromAddr.S,
                toAddr: _.toAddr.S,
                deliveryType: _.delivery_type.S,
                blockNumber: _.blockNumber.N,
              })).filter(Boolean) }
            langPack={langPack}  
          />
        </Grid>

      </Grid>
    );
};