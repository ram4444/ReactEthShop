import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet,   } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import React, { useCallback, useEffect } from 'react';
import { Button, Stack, Grid, Container, Typography } from '@mui/material';
import { faker } from '@faker-js/faker';
import PropTypes from 'prop-types';
import {
    BuyRecordsUpdate,
} from '../sections/@dashboard/app';
// util
import { queryOrdersByOrderer } from '../utils/awsClient'

BuyerRecordsSolana.propTypes = {
    langPack: PropTypes.object
};

export default function BuyerRecordsSolana({langPack}) {
    const [orderList, setOrderList] = React.useState([]);
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    
    let qR=[];

    

    const queryDyDb = useCallback(async(addr) =>{
        await queryOrdersByOrderer(addr).then((queryResult) => {
          console.log('Query the DB result for Solana')
          console.log(addr)
          console.log(queryResult.Items)
          qR=qR.concat(queryResult.Items)
        })
        setOrderList(qR)
    }, [])

    const fakeOnClick = useCallback(async () => {
        console.log(publicKey.toBase58().toLowerCase())
        queryDyDb(publicKey.toBase58().toLowerCase())
    },[publicKey, queryDyDb]);

    useEffect(()=> {
        console.log('useEffect BuyerRecordsSolana')
        fakeOnClick()
    }, [fakeOnClick]);

    return (
        <Grid container spacing={3}>

            <Grid item xs={12} md={6} lg={8}>
                <BuyRecordsUpdate
                title={langPack.buyerDashboard_latestOrder}
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
                    txHash: 'N/A',
                    postedAt: faker.date.recent(),
                }))}
                langPack={langPack}
                />
            </Grid>

        </Grid>
    );
};