  import React, { useState, useEffect, useContext } from 'react';
  import MetaMaskOnboarding from '@metamask/onboarding';
  // material
  import { Container, Stack, Typography } from '@mui/material';

  import axios from 'axios';
  // components
  import Page from '../components/Page';
  // import ConnectMetaMask from '../components/ConnectMetaMask';
  // import TransferERC777 from '../components/TransferERC777';
  import { ProductSort, ProductList, ProductCartWidget, ProductFilterSidebar } from '../sections/@dashboard/products';
  // mock
  // import PRODUCTS from '../_mock/products';

  import { TestContext, ProdContext } from '../Context';

  // ----------------------------------------------------------------------

  export default function EcommerceShop() {
    const [openFilter, setOpenFilter] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [netId, setNetId] = useState('UNKNOWN');
    // This is for display to filter sidebar
    const [filterTokenList, setfilterTokenList] = useState([]);
    const [displayTokenList, setDisplayTokenList] = useState([]);
    const [displayProductList, setDisplayProductList] = useState();

    const [allProductList, setAllProductList] = useState();

    const context = useContext(TestContext);
    const { drupalHostname } = context;

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
          // console.log(responsePhoto)
          return (
            {"filename": responsePhoto.data.included[0].attributes.name,
            "contractAddr": responsePhoto.data.included[1].attributes.field_contractaddress,
            "chainName": responsePhoto.data.included[1].attributes.field_chain,
            "cryptoName": responsePhoto.data.included[1].attributes.field_tokenname});
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
          // console.log(response);
          console.log('HTTP call for Product lists done');
          return response.data;
      })
        .then((data) => {
          console.log('----data----');
          // console.log(data);
          const dataArray = data.data.map((_) => _);
          return dataArray;
      })
        
    }

    function promiseHttpChain() {
      return axios({
        method: 'get',
        url: `http://${drupalHostname}/jsonapi/taxonomy_term/chain_network`,
        responseType: 'json',
        // crossDomain: true,
        headers: { 'Access-Control-Allow-Origin': '*' }
      })
        .then((response) => {
          console.log('HTTP call for Taxonomy Token done');
          return response.data;
      })
        .then((data) => {
          console.log('----data chain list----');
          // console.log(data);
          const dataArray = data.data.map((_) => _);
          return dataArray;
      })
        
    }

    function promiseHttpToken() {
      return axios({
        method: 'get',
        url: `http://${drupalHostname}/jsonapi/taxonomy_term/cryptotoken`,
        responseType: 'json',
        // crossDomain: true,
        headers: { 'Access-Control-Allow-Origin': '*' }
      })
        .then((response) => {
          console.log('HTTP call for Taxonomy Chain done');
          return response.data;
      })
        .then((data) => {
          // console.log('----data token list----');
          // console.log(data);
          const dataArray = data.data.map((_) => _);
          return dataArray;
      })
        
    }

    useEffect(() => { 
      
      // Load the product list
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
              console.log('All product info has been obatined. Apply filter afterwards.')
              
              if (MetaMaskOnboarding.isMetaMaskInstalled()) {
                // setNetId(window.ethereum.chainId);
                console.log(window.ethereum.chainId);
                // Token
                promiseHttpToken().then((prom) => {
                  console.log("promiseHttpToken");
                  console.log(prom);
        
                  let chainName;
                  switch (window.ethereum.chainId) {
                    case '0x1':
                      setNetId('Mainnet');
                      chainName=('Mainnet');
                      break;
                    case '0x3':
                      setNetId('Ropsten');
                      chainName=('Ropsten');
                      break;
                    case '0x4':
                      setNetId('Rinkeby');
                      chainName=('Rinkeby');
                      break;
                    case '0x5':
                      setNetId('Goerli');
                      chainName=('Goerli');
                      break;
                    default:
                      setNetId('UNKNOWN');
                      chainName=('UNKNOWN');
                  }
                  
                  const filterTokenList4Pass = prom.map((tokenObj) => {
                    const tokenChain=tokenObj.attributes.field_chain
                    const tokenIdinDrupal=tokenObj.attributes.name
                    const tokenNameinDrupal=tokenObj.attributes.field_tokenname
                    const tokenAliasinDrupal=tokenObj.attributes.field_alias
                    
                    
                    if (tokenChain===chainName){
                      setfilterTokenList(oldArray => [...oldArray, tokenIdinDrupal])
                      // filterTokenList4Pass.push(tokenIdinDrupal)
                      console.log(tokenIdinDrupal)
                      return tokenIdinDrupal;
                    }
                    return null;
                  }).filter(Boolean) ;
                  console.log(filterTokenList4Pass)
                  
                  const displayTokensMap = new Map()
                  filterTokenList4Pass.map((tokenName) => {
                    console.log(tokenName)
                    displayTokensMap.set(tokenName , true)
                    return null;
                  });
                  console.log(displayTokensMap)
                  setDisplayTokenList(displayTokensMap);

                  const finalProdlist=[];
                  arr.forEach((prod) => {
                    // console.log(prod)
                    if (prod.chain===chainName){
                      finalProdlist.push(prod)
                    }
                  }) 

                  // console.log(finalProdlist)
                  // The first time loading loads all products
                  setAllProductList(finalProdlist)
                  setDisplayProductList(finalProdlist);
                  setLoading(false);
                });
              }
            }
            
          })
          return[]
        })
        return arr;
      });

      // Product category
      
    }, []);

    const handleOpenFilter = () => {
      setOpenFilter(true);
    };

    const handleCloseFilter = () => {
      setOpenFilter(false);
    };

    const handleApplyFilter = (tokenName) => {
      console.log("handle apply filter in Product");
      // console.log(filterList);
      // arrFilter.push(filterList)

      const displayProductListB4 = displayProductList;
      const displayTokenListB4 = displayTokenList;

      // console.log(displayProductListB4)
      // console.log(displayTokenListB4)

      // displayTokenList:
      // USDT: true
      // ETH: true

      if (displayTokenListB4.get(tokenName))
        displayTokenListB4.set(tokenName, false)
      else 
        displayTokenListB4.set(tokenName, true)

      console.log(displayTokenListB4)
      setDisplayTokenList(displayTokenListB4)

      // Apply the token list filter
      const finalProdlist=[];
      console.log(displayProductListB4)
      allProductList.forEach((prod) => {
        console.log(prod)
        
        if (displayTokenList.get(prod.currency)){
          finalProdlist.push(prod)
        }
        
      }) 
      
      console.log(finalProdlist)
      setDisplayProductList(finalProdlist);
    };

    const handleSetNetId = (fromChild) => {
      // console.log("handleSetNetId");
      // console.log(fromChild);
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
                applyFilter={handleApplyFilter}
                filterTokenList={filterTokenList}
                displayTokenList={displayTokenList}
              />
              <ProductSort />
            </Stack>
          </Stack>

          <ProductList products={displayProductList} />
          <ProductCartWidget />
        </Container>
      </Page>
    );
  }