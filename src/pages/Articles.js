import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
// material
import { Grid, Button, Container, Stack, Typography, Box } from '@mui/material';
import axios from 'axios';
// components
import Page from '../components/Page';
import Iconify from '../components/Iconify';
import { ArticlesPostCard, ArticlesPostsSort, ArticlesPostsSearch } from '../sections/@dashboard/articles';

import { TestContext, ProdContext } from '../Context';

// ----------------------------------------------------------------------

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Popular' },
  { value: 'oldest', label: 'Oldest' },
];

// ----------------------------------------------------------------------

Articles.propTypes = {
  langPack: PropTypes.object
};

export default function Articles({langPack}) {

  const context = useContext(TestContext);
  const { drupalHostname } = context;

  const [displayArticleList, setDisplayArticleList] = useState([]);
  const [allArticleList, setAllArticleList] = useState([]);
  const [currentSort, setCurrentSort] = useState('newest');
  
  function promiseHttp() {
    return axios({
      method: 'get',
      url: `https://${drupalHostname}/jsonapi/node/article`,
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

  function promiseHttpPhoto(article) {
    console.log(article)
    const prom = axios({
      method: 'get',
      url: `https://${drupalHostname}/jsonapi/node/article/${article.id}?include=field_coverimage,uid,field_payment_currency`,
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
           "payment_tokenname": responsePhoto.data.included[2].attributes.field_tokenname,
          });
    })
      .then((obj) => ({
          id: article.id,
          cover: `https://${drupalHostname}/sites/default/files/media/Image/coverPhoto/${obj.filename}`,
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
          paymentTokenName: obj.payment_tokenname,
          createdAt: article.attributes.created
        }))
    return prom;
  } 

  function applySort(sortBy, finalArticlesList) {
    console.log('apply sort')
    setCurrentSort(sortBy);
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

  useEffect(() => {
    // Load the article list
    const a = promiseHttp().then((prom)=>{
      console.log(prom)
      const arr = [];
      let donecount =0;
      const s = prom.map((article, i ) => {
        promiseHttpPhoto(article).then((prom2) => {
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

  }, []);
  
  const handleApplySort = (sortBy) => {
    applySort(sortBy, displayArticleList)
  }

  return (
    <Page title={langPack.articles_title}>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid key='Title' item xs={3} sm={6} md={9}>
              <Typography variant="h4" gutterBottom width='30%'>
                {langPack.articles_Hdr}
              </Typography>
            </Grid>

            <Grid key='SortButton' item xs={9} sm={6} md={3} >
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                {/* Pending
                <ProductFilterSidebar 
                  isOpenFilter={openFilter}
                  onOpenFilter={handleOpenFilter}
                  onCloseFilter={handleCloseFilter}
                  applyFilter={handleApplyFilter}
                  filterTokenList={filterTokenList}
                  displayTokenList={displayTokenList}
                />
                */}
                <ArticlesPostsSort
                  applySort={handleApplySort} langPack={langPack}
                />
              </Box>
            </Grid>
          </Grid>
        </Stack>

        <Grid container spacing={3}>
          { 
            displayArticleList.map((post, index) => (
            <ArticlesPostCard key={post.id} post={post} index={index} langPack={langPack}/>
            ))}
        </Grid>
      </Container>
    </Page>
  );
}
