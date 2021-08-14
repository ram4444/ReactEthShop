import { useFormik } from 'formik';
import { useState, useEffect } from 'react';
import axios from 'axios';
// material
import { Container, Stack, Typography } from '@material-ui/core';
// components
import Page from '../components/Page';
import ConnectMetaMask from '../components/ConnectMetaMask';
import TransferERC777 from '../components/TransferERC777';
import {
  ProductSort,
  ProductList,
  ProductCartWidget,
  ProductFilterSidebar
} from '../components/_dashboard/products';
//
// import PRODUCTS from '../_mocks_/products';

// ---------------This only return a promise only-------------------------------------------------
function promiseHttp() {
  return axios({
    method: 'get',
    url: 'http://localhost/jsonapi/node/product?include=field_product_photo',
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
          cover: `http://localhost/sites/default/files/2021-08/${includedArray[i]}`,
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

export default function EcommerceShop() {
  const [openFilter, setOpenFilter] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [pd, setPd] = useState();

  useEffect(() => {
    promiseHttp().then((prom) => {
      setPd(prom);
      setLoading(false);
    });
  }, []);

  const formik = useFormik({
    initialValues: {
      gender: '',
      category: '',
      colors: '',
      priceRange: '',
      rating: ''
    },
    onSubmit: () => {
      setOpenFilter(false);
    }
  });

  const { resetForm, handleSubmit } = formik;

  const handleOpenFilter = () => {
    setOpenFilter(true);
  };

  const handleCloseFilter = () => {
    setOpenFilter(false);
  };

  const handleResetFilter = () => {
    handleSubmit();
    resetForm();
  };

  if (isLoading) {
    return <Page title="LOADING" />;
  }

  return (
    <Page title="Dashboard: Products | Minimal-UI">
      <Container>
        <Stack direction="row" spacing={2}>
          <Typography variant="h4">Products</Typography>
          <ConnectMetaMask />
          <TransferERC777 />
        </Stack>

        <Stack
          direction="row"
          flexWrap="wrap-reverse"
          alignItems="center"
          justifyContent="flex-end"
          sx={{ mb: 5 }}
        >
          <Stack direction="row" spacing={1} flexShrink={0} sx={{ my: 1 }}>
            <ProductFilterSidebar
              formik={formik}
              isOpenFilter={openFilter}
              onResetFilter={handleResetFilter}
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
