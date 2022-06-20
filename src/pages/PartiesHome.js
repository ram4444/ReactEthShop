import React, { useState, useEffect, useContext } from 'react';
import MetaMaskOnboarding from '@metamask/onboarding';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
// material
import { Grid, Button, Container, Stack, Typography, Divider, Box } from '@mui/material';
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
  const [openProductFilter, setOpenProductFilter] = useState(false);

  const [displayArticleList, setDisplayArticleList] = useState([]);
  const [allArticleList, setAllArticleList] = useState([]);
  const [displayProductList, setDisplayProductList] = useState([]);
  const [currentSortArticle, setCurrentSortArticle] = useState('newest');
  const [currentSortProducts, setCurrentSortProducts] = useState('newest');
  const [isWalletFound, setWalletFound] = useState(false);

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
      url: `http://${drupalHostname}/jsonapi/node/article/${article.id}?include=field_coverimage,uid,field_payment_currency`,
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
           "userWalletAddr": responsePhoto.data.included[1].attributes.field_default_address,
           "payment_contract": responsePhoto.data.included[2].attributes.field_contractaddress,
           "payment_chain": responsePhoto.data.included[2].attributes.field_chain,
           "payment_tokenalias": responsePhoto.data.included[2].attributes.field_alias,
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
          authorWallet: obj.userWalletAddr,
          price: article.attributes.field_read_price,
          paymentContract: obj.payment_contract,
          paymentChain: obj.payment_chain,
          paymentTokenAlias: obj.payment_tokenalias,
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
           "tokenName":responsePhoto.data.included[2].attributes.field_tokenname,
          });
    })
      .then((obj) => ({
          id: ico.id,
          cover: `http://${drupalHostname}/sites/default/files/media/Image/coverPhoto/${obj.filename}`,
          title: ico.attributes.title,
          summary: ico.attributes.body.summary,
          body: ico.attributes.body.value,
          tokenName: obj.tokenName,
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

    if (MetaMaskOnboarding.isMetaMaskInstalled()) {
      setWalletFound(true)
    }

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
            
            // if (MetaMaskOnboarding.isMetaMaskInstalled()) {

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
                    chainName=('Mainnet');
                }
                
                const arrFilterTokenList=[]
                const filterTokenList4Pass = prom.map((tokenObj) => {
                  const tokenChain=tokenObj.attributes.field_chain
                  const tokenIdinDrupal=tokenObj.attributes.name
                  const tokenNameinDrupal=tokenObj.attributes.field_tokenname
                  const tokenAliasinDrupal=tokenObj.attributes.field_alias
                  
                  console.log(tokenChain)
                  console.log(chainName)
                  console.log(tokenNameinDrupal)
                  if (tokenChain===chainName){
                    console.log(filterTokenList)
                    // setfilterTokenList(oldArray => [...oldArray, tokenNameinDrupal])
                    // filterTokenList4Pass.push(tokenIdinDrupal)
                    arrFilterTokenList.push(tokenNameinDrupal)
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
                setfilterTokenList(arrFilterTokenList)
                setAllProductList(finalProdlist)
                setDisplayProductList(finalProdlist);
                setLoading(false);
              });
            // }
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

  const handleApplySortArticles = (sortBy) => {
    applySortArticle(sortBy, displayArticleList)
  }

  const handleOpenProductFilter = () => {
    setOpenProductFilter(true);
  };

  const handleCloseProductFilter = () => {
    setOpenProductFilter(false);
  };

  function applySortArticle(sortBy, finalArticlesList) {
    console.log('apply sort')
    setCurrentSortArticle(sortBy);
    // pList = finalArticlesList --- NOT FUCKING WORK
    const pList = []
    finalArticlesList.map((item)=>pList.push(item))
    console.log(pList)
    switch (sortBy) {
      case 'author':
        pList.sort((a, b) => a.author.localeCompare(b.author));
        // setDisplayProductList(pList)
        break;
      case 'author_desc':
        pList.sort((a, b) => a.author.localeCompare(b.author)).reverse();
        // setDisplayProductList(pList)
        break;
      case 'newest':
        pList.sort((a, b) => a.createdAt.localeCompare(b.createdAt)).reverse();
        // setDisplayProductList(pList)
        break;
      default:
        console.log('not applicable');
    }

    console.log(pList)
    setDisplayArticleList(pList)
  }

  function applyProductSort(sortBy, finalProdlist) {
    console.log('call')
    setCurrentSortProducts(sortBy);
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

  const handleApplyProductFilter = (tokenName) => {
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
        const sortBy = currentSortProducts
        applyProductSort(sortBy, finalProdlist)
      }
    })
  };

  const handleApplyProductSort = (sortBy) => {
    applyProductSort(sortBy,displayProductList)
  }
  
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
        <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid key='Title' item xs={3} sm={6} md={9}>
              <Typography variant="h4" gutterBottom width='30%'>
                Articles
              </Typography>
            </Grid>

            <Grid key='SortButton' item xs={9} sm={6} md={3} >
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                {/* Pending
                <ArticleFilterSidebar 
                  isOpenFilter={openFilter}
                  onOpenFilter={handleOpenFilter}
                  onCloseFilter={handleCloseFilter}
                  applyFilter={handleApplyFilter}
                  filterTokenList={filterTokenList}
                  displayTokenList={displayTokenList}
                />
                */}
                <ArticlesPostsSort
                  applySort={handleApplySortArticles} 
                />
              </Box>
            </Grid>
          </Grid>
        </Stack>

        <Grid container spacing={3}>
          { 
            displayArticleList.map((post, index) => (
            <ArticlesPostCard key={post.id} post={post} index={index} />
            ))}
        </Grid>
      </Container>

      <Divider />

      <Container sx={{ mt: 5 }}>
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
                isOpenFilter={openProductFilter}
                onOpenFilter={handleOpenProductFilter}
                onCloseFilter={handleCloseProductFilter}
                applyFilter={handleApplyProductFilter}
                filterTokenList={filterTokenList}
                displayTokenList={displayTokenList}
              />
              <ProductSort
                applySort={handleApplyProductSort} 
              />
            </Box>
          </Grid>
        </Grid>
        <ProductList products={displayProductList} />
      </Container>
    </Page>
  );
}
