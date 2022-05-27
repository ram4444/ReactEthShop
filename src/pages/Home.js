import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { faker } from '@faker-js/faker';
// @mui
import { useTheme,styled } from '@mui/material/styles';
import { Grid, Container, Typography, Box, Divider } from '@mui/material';
import { orange } from '@mui/material/colors';
import axios from 'axios';
// components
import Page from '../components/Page';
import Iconify from '../components/Iconify';
// sections
import {
  AppCurrentVisits,
  AppWidgetSummary,
} from '../sections/@dashboard/app';
import {
  UserWidget,
} from '../sections/@dashboard/home';
import { ArticlesPostCard, ArticlesPostsSort, ArticlesPostsSearch } from '../sections/@dashboard/articles';
import { TestContext, ProdContext } from '../Context';

// ---------------Style--------------------------------------------------

const BannerImgStyleBig = styled('img')({
  top: 0,
  width: '100%',
  maxHeight: '400',
  objectFit: 'cover',
  // position: 'absolute',
});

const BannerImgStyleSmall = styled('img')({
  top: 0,
  maxWidth: '400',
  maxheight: '400',
  height: '100%',
  objectFit: 'cover',
  // position: 'absolute',
});


// ----------------------------------------------------------------------

export default function HomeApp() {
  const theme = useTheme();

  const [displayArticleList, setDisplayArticleList] = useState([]);
  const [allArticleList, setAllArticleList] = useState([]);
  const [displayUserList, setDisplayUserList] = useState([]);
  const [allUserList, setAllUserList] = useState([]);

  const context = useContext(TestContext);
  const { drupalHostname } = context;

  function promiseHttpArticles() {
    return axios({
      method: 'get',
      url: `http://${drupalHostname}/jsonapi/node/article?sort=-created`,
      responseType: 'json',
      // crossDomain: true,

      headers: { 'Access-Control-Allow-Origin': '*'}
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

  function promiseHttpUser() {
    return axios({
      method: 'get',
      url: `http://${drupalHostname}/jsonapi/user/user?sort=-created&page[limit]=4&filter[name-filter][condition][path]=name&filter[name-filter][condition][operator]=<>&filter[name-filter][condition][value][1]=`,
      responseType: 'json',
      // crossDomain: true,

      headers: { 'Access-Control-Allow-Origin': '*'}
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
  
  function promiseHttpUserPhoto(user) {
    console.log(user)
    const prom = axios({
      method: 'get',
      url: `http://${drupalHostname}/jsonapi/user/user/${user.id}?include=field_userlogo`,
      responseType: 'json',
      // crossDomain: true,
      headers: { 'Access-Control-Allow-Origin': '*' }
    }) 
      .then((responsePhoto) => {
        console.log('HTTP call for user photo done');
        console.log(responsePhoto)
        let filenamelogo;
        try {
          filenamelogo = responsePhoto.data.included[0].attributes.name
        } catch (error) {
          console.error(error);
          filenamelogo = ''
        }
        
        return (
          {"filename": filenamelogo,
          });
    })
      .then((obj) => {
        let caption=''
        let intro =''
        let displayNamepass = ''
        try {
          caption = user.attributes.field_self_intro.summary
          intro= user.attributes.field_self_intro.value
          displayNamepass = user.attributes.display_name
        } catch (error) {
          console.error(error);
          caption = 'no caption for anoynum user'
          intro = ''
          displayNamepass = ''
        }
        return {
          id: user.id,
          user_picture: `http://${drupalHostname}/sites/default/files/media/Image/userLogo/${obj.filename}`,
          display_name: displayNamepass,
          createdAt: user.attributes.created,
          introCaption: caption,
          introDetail: intro
        }})
    return prom;
  } 
  
  useEffect(() => {
    // Load the article list
    const a = promiseHttpArticles().then((prom)=>{
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

    // Query for Latest User
    const userPromisecall = promiseHttpUser().then((prom)=>{
      console.log(prom)
      const arr = [];
      let donecount =0;
      const s = prom.map((user, i ) => {
        promiseHttpUserPhoto(user).then((prom2) => {
          arr.push(prom2);
          donecount+=1;
          return prom2;
        }).then((prom2) => {
          if (donecount===prom.length) {
            console.log(arr)
            setAllUserList(arr)
            setDisplayUserList(arr)
          }
        })
        return [];
      })
    })
  
  }, []);

  return (
    <Page title="Home Page">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome to Crypto Marketplace
        </Typography>

        <Grid container spacing={3} sx={{ mb: 2 }}>
          <Grid item xs={12} md={8} lg={8}>
            <Box sx={{ p: 3, pb: 1 }} dir="ltr">
              <BannerImgStyleBig alt='bigbanner' src='http://mstdatalite.dionysbiz.xyz/sites/default/files/styles/large/public/media/Image/banner/testbanner1.jpg'/>
            </Box>
          </Grid>

          <Grid item xs={12} md={4} lg={4}>
            <Box sx={{ p: 3, pb: 1 }} dir="ltr">
              <BannerImgStyleSmall alt='smallbanner' src='http://mstdatalite.dionysbiz.xyz/sites/default/files/styles/large/public/media/Image/banner/testbanner2.jpg'/>
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 2 }}>
          {allUserList.map((user,i) => {
            // this line is for the color of the grid
            const index = 500+(((-1)**i)*100*Math.floor((Math.random() * 3) + 1))
            return (
              <Grid key={i} tem xs={12} sm={6} md={3} pt={'24px'} pl={'24px'}>
                <UserWidget userId={user.id}
                  title={user.display_name} 
                  logoUrl={user.user_picture} 
                  caption={user.introCaption} 
                  ctrlIndex={index}/>
              </Grid>
            )
          })}
        </Grid>
        
        {/*
        <Grid container spacing={3} sx={{ mb: 2 }}>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Weekly Sales" total={714000} color='info' icon={'ant-design:android-filled'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="New Users" total={1352831} color='info' icon={'ant-design:apple-filled'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Item Orders" total={1723315} color="warning" icon={'ant-design:windows-filled'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Bug Reports" total={234} color="error" icon={'ant-design:bug-filled'} />
          </Grid>

        </Grid>
        */}
        <Divider />

        <Typography variant="h4" sx={{ mt: 5 }}>
          Latest Articles
        </Typography>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          { 
            allArticleList.map((post, index) => (
              <ArticlesPostCard key={post.id} post={post} index={index} />
            ))}
        </Grid>


      </Container>
    </Page>
  );
}
