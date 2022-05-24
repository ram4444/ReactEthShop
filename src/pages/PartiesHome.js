import React, { useState, useEffect, useContext } from 'react';
import MetaMaskOnboarding from '@metamask/onboarding';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
// material
import { Grid, Button, Container, Stack, Typography, Divider } from '@mui/material';
import axios from 'axios';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
// components
import Page from '../components/Page';
import Iconify from '../components/Iconify';
import { ArticlesPostCard, ArticlesPostsSort, ArticlesPostsSearch } from '../sections/@dashboard/articles';
import { ProductSort, ProductList, ProductFilterSidebar } from '../sections/@dashboard/products';
import { ICOPostCard } from '../sections/@dashboard/ico';

import { TestContext, ProdContext } from '../Context';


// ----------------------------------------------------------------------

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Popular' },
  { value: 'oldest', label: 'Oldest' },
];

const initialOptionsSandbox = {
  "client-id": "ATHUcCN24SWqR9Fi9OuEqBuZRzR1EOFYC-SjL0fzYn4t_YyZ4Ql1o5InZ6Oue_Q1pR37m3ajQqtiLhna",
  currency: "HKD",
  intent: "capture",
};

// ----------------------------------------------------------------------

export default function PartiesHome() {

  const context = useContext(TestContext);
  const { drupalHostname } = context;
  const [searchParams, setSearchParams] = useSearchParams();

  const [displayArticleList, setDisplayArticleList] = useState([]);
  const [allArticleList, setAllArticleList] = useState([]);
  const [displayProductList, setDisplayProductList] = useState([]);
  const [currentSort, setCurrentSort] = useState('newest');

  const [allProductList, setAllProductList] = useState();

  const [allICOList, setAllICOList] = useState([]);

  const [netId, setNetId] = useState('UNKNOWN');
  const [filterTokenList, setfilterTokenList] = useState([]);
  const [displayTokenList, setDisplayTokenList] = useState([]);
  const [isLoading, setLoading] = useState(true);

  // For Paypal button 
  const [show, setShow] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ErrorMessage, setErrorMessage] = useState("");
  const [orderID, setOrderID] = useState(false);

  // ------------------- HTTP call -----------------------------
  
  function promiseHttpArticles(userId) {
    return axios({
      method: 'get',
      url: `http://${drupalHostname}/jsonapi/node/article?sort=-created&filter[name-filter][condition][path]=uid.id&filter[name-filter][condition][operator]==&filter[name-filter][condition][value][1]=${userId}`,
      responseType: 'json',
      // crossDomain: true,
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
      .then((response) => {
        // console.log(response);
        console.log('HTTP call for Article lists done');
        return response.data;
    })
      .then((data) => {
        console.log('----data----');
        console.log(data);
        const dataArray = data.data.map((_) => _);
        // setAllArticleList(dataArray)
        return dataArray;
    })
      
  }

  function promiseHttpArticlePhoto(article) {
    console.log(article)
    const prom = axios({
      method: 'get',
      url: `http://${drupalHostname}/jsonapi/node/article/${article.id}?include=field_coverimage,uid`,
      responseType: 'json',
      // crossDomain: true,
      headers: { 'Access-Control-Allow-Origin': '*' }
    }) 
      .then((responsePhoto) => {
        console.log('HTTP call for Product photo done');
        console.log(responsePhoto)
        return (
          {"filename": responsePhoto.data.included[0].attributes.name,
           "userDisplayName": responsePhoto.data.included[1].attributes.display_name,
          });
    })
      .then((obj) => ({
          id: article.id,
          cover: `http://${drupalHostname}/sites/default/files/media/Image/coverPhoto/${obj.filename}`,
          title: article.attributes.title,
          summary: article.attributes.body.summary,
          body: article.attributes.body.value,
          view: 0,
          comment: 0,
          share: 0,
          author: obj.userDisplayName,
          createdAt: article.attributes.created
        }))
    return prom;
  } 

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

  function promiseHttpProducts(userId) {
    return axios({
      method: 'get',
      url: `http://${drupalHostname}/jsonapi/node/product?sort=-created&filter[name-filter][condition][path]=uid.id&filter[name-filter][condition][operator]==&filter[name-filter][condition][value][1]=${userId}`,
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

  function promiseHttpICO(userId) {
    return axios({
      method: 'get',
      url: `http://${drupalHostname}/jsonapi/node/ico?filter[name-filter][condition][path]=uid.id&filter[name-filter][condition][operator]==&filter[name-filter][condition][value][1]=${userId}&sort=-created`,
      responseType: 'json',
      // crossDomain: true,
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
      .then((response) => {
        // console.log(response);
        console.log('HTTP call for ICO lists done');
        return response.data;
    })
      .then((data) => {
        console.log('----data----');
        console.log(data);
        const dataArray = data.data.map((_) => _);
        // setAllArticleList(dataArray)
        return dataArray;
    })
      
  }

  function promiseHttpICOPhoto(ico) {
    console.log(ico)
    const prom = axios({
      method: 'get',
      url: `http://${drupalHostname}/jsonapi/node/ico/${ico.id}?include=field_coverimageico,uid,field_icocurrency`,
      responseType: 'json',
      // crossDomain: true,
      headers: { 'Access-Control-Allow-Origin': '*' }
    }) 
      .then((responsePhoto) => {
        console.log('HTTP call for ICO photo done');
        console.log(responsePhoto)
        return (
          {"filename": responsePhoto.data.included[0].attributes.name,
           "userDisplayName": responsePhoto.data.included[1].attributes.display_name,
           "contractAddr": responsePhoto.data.included[2].attributes.field_contractaddress,
           "chain":responsePhoto.data.included[2].attributes.field_chain,
          });
    })
      .then((obj) => ({
          id: ico.id,
          cover: `http://${drupalHostname}/sites/default/files/media/Image/coverPhoto/${obj.filename}`,
          title: ico.attributes.title,
          summary: ico.attributes.body.summary,
          body: ico.attributes.body.value,
          author: obj.userDisplayName,
          createdAt: ico.attributes.created,
          endDate: ico.attributes.field_end_date,
          minUnit: ico.attributes.field_min_unit,
          startupPrice: ico.attributes.field_startup_price,
          fiat: ico.attributes.field_fiat_currency,
          paypalClientId: ico.attributes.field_paypal_clientid,
          issueAddr: ico.attributes.field_issue_address,
          contractAddr: obj.contractAddr,
          chain: obj.chain,
          openStatus: ico.attributes.field_open_status
        }))
    return prom;
  } 

  // ------------------- Pre-load-----------------------------

  useEffect(() => {
    console.log(searchParams.get("userId"))
    const userId = searchParams.get("userId")

    // Load the article list
    const promiseArticles = promiseHttpArticles(userId).then((prom)=>{
      console.log(prom)
      const arr = [];
      let donecount =0;
      const s = prom.map((article, i ) => {
        promiseHttpArticlePhoto(article).then((prom2) => {
          arr.push(prom2);
          donecount+=1;
          return prom2;
        }).then((prom2) => {
          if (donecount===prom.length) {
            console.log('Currently there is no filter when the fist time load')
            console.log(arr)
            setAllArticleList(arr)
            setDisplayArticleList(arr)
          }
        })
        return [];
      })
    })

    
    // Load the product list
    const promiseProduct = promiseHttpProducts(userId).then((prom) => {
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

                console.log(finalProdlist)
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
    });

    // Load the ICO list
    const promiseICO = promiseHttpICO(userId).then((prom)=>{
      console.log(prom)
      const arr = [];
      let donecount =0;
      const s = prom.map((ico, i ) => {
        promiseHttpICOPhoto(ico).then((prom2) => {
          arr.push(prom2);
          donecount+=1;
          return prom2;
        }).then((prom2) => {
          if (donecount===prom.length) {
            console.log('Currently there is no filter when the fist time load')
            console.log(arr)
            setAllICOList(arr)
          }
        })
        return [];
      })
    })

  }, []);

   // creates a paypal order

  // capture likely error
  const onError = (data, actions) => {
    setErrorMessage("An Error occured with your payment ");
  };
  
  return (
    <Page title="Artist Home">

      <Container sx={{ mb: 5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Latest ICO
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          { 
            allICOList.map((ico, index) => (
            <ICOPostCard key={ico.id} post={ico} index={index} />
            ))}
        </Grid>
      </Container>

      <Container sx={{ mb: 5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Articles
          </Typography>
          <ArticlesPostsSort options={SORT_OPTIONS} />
        </Stack>

        <Grid container spacing={3}>
          { 
            allArticleList.map((post, index) => (
            <ArticlesPostCard key={post.id} post={post} index={index} />
            ))}
        </Grid>
      </Container>

      <Divider />

      <Container sx={{ mt: 5 }}>
          <Stack direction="row" spacing={2}>
            <Typography variant="h4" sx={{ mb: 5 }}>
              Products
            </Typography>
          </Stack>
          
          {/*
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
              <ProductSort 
                applySort={handleApplySort} 
              />
            </Stack>
          </Stack>
            
          */}
          <ProductList products={displayProductList} /> 
          
        </Container>
    </Page>
  );
}
