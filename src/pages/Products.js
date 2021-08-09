import { useFormik } from 'formik';
import { useState } from 'react';
import axios from 'axios';
// material
import { Container, Stack, Typography } from '@material-ui/core';
// components
import Page from '../components/Page';
import {
  ProductSort,
  ProductList,
  ProductCartWidget,
  ProductFilterSidebar
} from '../components/_dashboard/products';
//
import PRODUCTS from '../_mocks_/products';

// ----------------------------------------------------------------------

let pd = axios({
  method: 'get',
  url: 'http://localhost/jsonapi/node/product',
  responseType: 'json',
  // crossDomain: true,
  headers: { 'Access-Control-Allow-Origin': '*' }
})
  .then((response) => {
    console.log('response');
    return response.data.data;
  })
  .then((data) => {
    pd = data.map((_, index) => {
      const jsonImglink = _.relationships.field_product_photo.links.related.href;
      const setIndex = index + 1;
      // console.log(_.id);
      // console.log(setIndex);

      const imglink = axios({
        method: 'get',
        url: jsonImglink,
        responseType: 'json',
        // crossDomain: true,
        headers: { 'Access-Control-Allow-Origin': '*' }
      })
        .then((response) => response.data.data)
        .then(
          (data2) => `http://localhost/sites/default/files/2021-08/${data2[0].attributes.name}`
          /*
          data2.map((_) => {
            console.log(_.name);
          });
          */
          // console.log(data2[0].attributes.name);
        );
      return {
        id: _.id,
        cover: imglink.PromiseResult,
        name: _.attributes.title,
        // price: _.attributes.price,
        price: 13,
        priceSale: null,
        colors: '#000000',
        status: ''
      };
    });
    // pd = data;
    console.log(PRODUCTS);
    console.log(pd);
  });

export default function EcommerceShop() {
  const [openFilter, setOpenFilter] = useState(false);

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

  return (
    <Page title="Dashboard: Products | Minimal-UI">
      <Container>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Products
        </Typography>

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
