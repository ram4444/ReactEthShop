import React, { useState, useEffect, useContext } from 'react';
// material
import { Container, Stack, Typography } from '@mui/material';

import axios from 'axios';
// components
import Page from '../components/Page';
import ConnectMetaMask from '../components/ConnectMetaMask';
import TransferERC777 from '../components/TransferERC777';
import { ProductSort, ProductList, ProductCartWidget, ProductFilterSidebar } from '../sections/@dashboard/products';
// mock
// import PRODUCTS from '../_mock/products';

import { TestContext, ProdContext } from '../Context';

// ----------------------------------------------------------------------

export default function EcommerceShop() {
  const [openFilter, setOpenFilter] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [netId, setNetId] = useState('UNKNOWN');
  const [pd, setPd] = useState();

  const context = useContext(TestContext);
  const { drupalHostname, localNetId, erc777ContractAddr, receiverAddr } = context;


  function promiseHttp() {
    return axios({
      method: 'get',
      url: `http://${drupalHostname}/jsonapi/node/product?include=field_product_photo`,
      responseType: 'json',
      // crossDomain: true,
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
      .then((response) => {
        console.log('HTTP call done');
        return response.data;
      })
      .then((data) => {
        const dataArray = data.data.map((_) => _);
        const includedArray = data.included.map((_) => _.attributes.name);

        return dataArray.map((_, i) => {
          console.log('Merging JSON');
          return {
            id: _.id,
            cover: `http://${drupalHostname}/sites/default/files/media/Image/productPhoto/${includedArray[i]}`,
            name: _.attributes.title,
            // price: _.attributes.price,
            price: _.attributes.field_price,
            priceSale: null,
            colors: ['#000000'],
            status: ''
          };
        });
      });
  }

  useEffect(() => {
    promiseHttp().then((prom) => {
      setPd(prom);
      setLoading(false);
    });
  }, []);

  const handleOpenFilter = () => {
    setOpenFilter(true);
  };

  const handleCloseFilter = () => {
    setOpenFilter(false);
  };

  const handleSetNetId = (fromChild) => {
    console.log(fromChild);
    setNetId(fromChild);
  };

  if (isLoading) {
    return <Page title="LOADING" />;
  }

  return (
    <Page title="Dashboard: Products">
      <Container>
        <Stack direction="row" spacing={2}>
          <Typography variant="h4" sx={{ mb: 5 }}>
            Products
          </Typography>
          <ConnectMetaMask handler={handleSetNetId} />
          <TransferERC777 />
        </Stack>

        <Stack direction="row" flexWrap="wrap-reverse" alignItems="center" justifyContent="flex-end" sx={{ mb: 5 }}>
          <Stack direction="row" spacing={1} flexShrink={0} sx={{ my: 1 }}>
            <ProductFilterSidebar
              isOpenFilter={openFilter}
              onOpenFilter={handleOpenFilter}
              onCloseFilter={handleCloseFilter}
            />
            <ProductSort />
          </Stack>
        </Stack>

        <ProductList products={pd} />
        <ProductCartWidget />
      </Container>
    </Page>
  );
}