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

    function secondAxio(product) {
      const prom = axios({
        method: 'get',
        url: `http://${drupalHostname}/jsonapi/node/product/${product.id}?include=field_product_photo,field_currency`,
        responseType: 'json',
        // crossDomain: true,
        headers: { 'Access-Control-Allow-Origin': '*' }
      }) 
        .then((responsePhoto) => {
          console.log('HTTP call for Product photo done');
          console.log(responsePhoto)
          return (
            {"filename": responsePhoto.data.included[0].attributes.name,
            "contractAddr": responsePhoto.data.included[1].attributes.field_contractaddress,
            "chainName": responsePhoto.data.included[1].attributes.field_chain,
            "cryptoName": responsePhoto.data.included[1].attributes.title});
      })
        .then((obj) => ({
            id: product.id,
            cover: `http://${drupalHostname}/sites/default/files/media/Image/productPhoto/${obj.filename}`,
            name: product.attributes.title,
            // price: _.attributes.price,
            price: product.attributes.field_price,
            priceSale: null,
            colors: ['#000000'],
            status: '',
            receiverAddr: product.attributes.field_walletaddr,
            currency: obj.cryptoName,
            contractAddr: obj.contractAddr,
            chain: obj.chainName,
            dpshift: product.attributes.field_dptshift
            
      }))
      return prom;
    } 

    function promiseHttp() {
      return axios({
        method: 'get',
        url: `http://${drupalHostname}/jsonapi/node/product`,
        responseType: 'json',
        // crossDomain: true,
        headers: { 'Access-Control-Allow-Origin': '*' }
      })
        .then((response) => {
          console.log('HTTP call for Product lists done');
          return response.data;
      })
        .then((data) => {
          console.log('----data----');
          console.log(data);
          const dataArray = data.data.map((_) => _);
          return dataArray;
      })
        
    }

    useEffect(() => { 
      
        const a = promiseHttp().then((prom) => {
          // console.log('prom')
          // console.log(prom)
          const arr = [];
          
          let donecount =0;
          const s = prom.map((product,i ) => {
            secondAxio(product).then((prom2) => {
              // console.log('prom2');
              // console.log(prom2);
              arr.push(prom2);
              donecount+=1;
              return prom2;
            }).then((prom2) => {
              if (donecount===prom.length) {
                console.log('end')
                setPd(arr);
                setLoading(false);
              }
              
            })
            return[]
          })
          return arr;
        });
        
        console.log(a);
        
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