import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// material
import { Grid, Button, Container, Stack, Typography } from '@mui/material';
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

export default function Articles() {

  const context = useContext(TestContext);
  const { drupalHostname } = context;

  const [displayArticleList, setDisplayArticleList] = useState([]);
  const [allArticleList, setAllArticleList] = useState([]);
  
  function promiseHttp() {
    return axios({
      method: 'get',
      url: `http://${drupalHostname}/jsonapi/node/article`,
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
  
  return (
    <Page title="Crypto shop: Articles">
      <Container>
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
    </Page>
  );
}
