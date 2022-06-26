import React, { useState, useEffect, useContext } from 'react';
import MetaMaskOnboarding from '@metamask/onboarding';
// material
import { Container, Stack, Typography, Grid, Box } from '@mui/material';

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
    const [currentSort, setCurrentSort] = useState('newest');
    const [isWalletFound, setWalletFound] = useState(false);

    const [allProductList, setAllProductList] = useState();

    const context = useContext(TestContext);
    const { drupalHostname } = context;

    function promiseHttpProductPhoto(product) {

      const prom = axios({
        method: 'get',
        url: `http://${drupalHostname}/jsonapi/node/product/${product.id}?include=field_product_photo,field_currency,uid`,
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
            "cryptoName": responsePhoto.data.included[1].attributes.field_tokenname});
      })
        .then((obj) => ({
            id: product.id,
            cover: `http://${drupalHostname}/sites/default/files/media/Image/productPhoto/${obj.filename}`,
            coverFilename: obj.filename,
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
            dpshift: product.attributes.field_dptshift,
            email: product.attributes.field_email,
            phone: product.attributes.field_phone,
            deliveryTypeList: product.attributes.field_deilvery_type,
            location: product.attributes.field_location,
            lastChanged: product.attributes.changed,
            description: product.attributes.field_description.value
      }))
      return prom;
    } 

    function promiseHttp() {
      return axios({
        method: 'get',
        url: `http://${drupalHostname}/jsonapi/node/product?sort=-created`,
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

    function applySortfun(sortBy, finalProdlist) {
      console.log('call')
      setCurrentSort(sortBy);
      // pList = finalProdlist --- NOT FUCKING WORK
      const pList = []
      finalProdlist.map((item)=>pList.push(item))
      console.log(pList)
      switch (sortBy) {
        case 'name':
          pList.sort((a, b) => a.name.localeCompare(b.name));
          // setDisplayProductList(pList)
          break;
        case 'name_desc':
          pList.sort((a, b) => a.name.localeCompare(b.name)).reverse();
          // setDisplayProductList(pList)
          break;
        case 'newest':
          pList.sort((a, b) => a.lastChanged.localeCompare(b.lastChanged)).reverse();
          // setDisplayProductList(pList)
          break;
        default:
          console.log('not applicable');
      }

      console.log(pList)
      setDisplayProductList(pList)
    }

    useEffect(() => { 
      
      if (MetaMaskOnboarding.isMetaMaskInstalled()) {
        setWalletFound(true)
      }


      // Load the product list
      const a = promiseHttp().then((prom) => {
        // console.log('prom')
        // console.log(prom)
        const arr = [];
        
        let donecount =0;
        const s = prom.map((product,i ) => {
          promiseHttpProductPhoto(product).then((prom2) => {
            // console.log('prom2');
            // console.log(prom2);
            arr.push(prom2);
            donecount+=1;
            return prom2;
          }).then((prom2) => {
            if (donecount===prom.length) {
              console.log('All product info has been obatined. Apply filter afterwards.')
              
              // if (MetaMaskOnboarding.isMetaMaskInstalled()) {
                
                // setNetId(window.ethereum.chainId);
                let chainId ='' ; // in 0x1
                try {
                  // await window.ethereum.request({ method: 'eth_requestAccounts' })
                  // console.log('Wallet found')
                  console.log('chainId: ')
                  console.log(window.ethereum.chainId);
                  chainId=window.ethereum.chainId
                } catch (error) {
                  console.error("window.ethereum not found")
                  setWalletFound(false)
                }
                
                // Token
                promiseHttpToken().then((prom) => {
                  console.log("promiseHttpToken");
                  console.log(prom);
        
                  let chainName;
                  switch (chainId) {
                    case '0x1':
                      setNetId('Mainnet');
                      chainName=('Ethereum Mainnet');
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
                      chainName=('Ethereum Mainnet');
                  }
                  
                  const filterTokenList4Pass = prom.map((tokenObj) => {
                    const tokenChain=tokenObj.attributes.field_chain
                    const tokenIdinDrupal=tokenObj.attributes.name
                    const tokenNameinDrupal=tokenObj.attributes.field_tokenname
                    const tokenAliasinDrupal=tokenObj.attributes.field_alias
                    
                    
                    if (tokenChain===chainName){
                      setfilterTokenList(oldArray => [...oldArray, tokenNameinDrupal])
                      // filterTokenList4Pass.push(tokenIdinDrupal)
                      console.log(tokenNameinDrupal)
                      return tokenNameinDrupal;
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
                  
                  // Default sort by latest update
                  finalProdlist.sort((a, b) => a.lastChanged.localeCompare(b.lastChanged)).reverse();

                  // console.log(finalProdlist)
                  // The first time loading loads all products
                  setAllProductList(finalProdlist)
                  setDisplayProductList(finalProdlist);
                  setLoading(false);
                });
              // }
            }
            
          })
          return[]
        })
        return arr;
      });

      

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
      let donecount2 =0;
      allProductList.forEach((prod) => {
        console.log(prod)
        
        if (displayTokenList.get(prod.currency)){
          finalProdlist.push(prod)
        }
        donecount2+=1;
        if (donecount2===allProductList.length) {
          console.log(finalProdlist)
          setDisplayProductList(finalProdlist);
          const sortBy = currentSort
          applySortfun(sortBy, finalProdlist)
        }

      })
      
      
    };

    const handleApplySort = (sortBy) => {
      applySortfun(sortBy,displayProductList)
    }

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

          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            {!isWalletFound && (
            <Typography variant="caption"  width='100%'>
              Please connect your wallet to enable the purchase function  
            </Typography>
            )}

            <Grid container spacing={3} sx={{ mb: 2 }}>
              <Grid key='Title' item xs={3} sm={6} md={9}>
                <Typography variant="h4" gutterBottom width='15%'>
                  Products
                </Typography>
              </Grid>

              <Grid key='SortButton' item xs={9} sm={6} md={3} >
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <ProductFilterSidebar 
                    isOpenFilter={openFilter}
                    onOpenFilter={handleOpenFilter}
                    onCloseFilter={handleCloseFilter}
                    applyFilter={handleApplyFilter}
                    filterTokenList={filterTokenList}
                    displayTokenList={displayTokenList}
                  />
                  <ProductSort
                    applySort={handleApplySort} 
                  />
                </Box>
              </Grid>
            </Grid>
          </Stack>

          <ProductList products={displayProductList} />
        </Container>
      </Page>
    );
  }