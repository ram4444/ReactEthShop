import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
// material
import { Grid, Button, Container, Stack, Typography, Box } from '@mui/material';
import axios from 'axios';
// components
import Page from '../components/Page';
import Iconify from '../components/Iconify';
import { UserWidget,PartiesSort, PartiesSearch } from '../sections/@dashboard/parties';

import { TestContext, ProdContext } from '../Context';

// ----------------------------------------------------------------------

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Popular' },
  { value: 'oldest', label: 'Oldest' },
];

// ----------------------------------------------------------------------

Parties.propTypes = {
  langPack: PropTypes.object
};

export default function Parties({langPack}) {

  const context = useContext(TestContext);
  const { drupalHostname } = context;

  const [displayPartiesList, setDisplayPartiesList] = useState([]);
  const [allPartiesList, setAllPartiesList] = useState([]);
  const [currentSort, setCurrentSort] = useState('newest');
  
  function promiseHttp() {
    return axios({
      method: 'get',
      url: `https://${drupalHostname}/jsonapi/user/user?sort=-created&page[limit]=16&filter[name-filter][condition][path]=name&filter[name-filter][condition][operator]=<>&filter[name-filter][condition][value][1]=`,
      responseType: 'json',
      // crossDomain: true,
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
      .then((response) => {
        // console.log(response);
        console.log('HTTP call for Parties lists done');
        return response.data;
    })
      .then((data) => {
        console.log('----data----');
        console.log(data);
        const dataArray = data.data.map((_) => _);
        // setAllPartiesList(dataArray)
        return dataArray;
    })
      
  }

  function promiseHttpUserPhoto(user) {
    console.log(user)
    const prom = axios({
      method: 'get',
      url: `https://${drupalHostname}/jsonapi/user/user/${user.id}?include=field_userlogo`,
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
          user_picture: `https://${drupalHostname}/sites/default/files/media/Image/userLogo/${obj.filename}`,
          display_name: displayNamepass,
          createdAt: user.attributes.created,
          introCaption: caption,
          introDetail: intro
        }})
    return prom;
  } 

  function applySort(sortBy, finalPartiesList) {
    console.log('apply sort')
    setCurrentSort(sortBy);
    // pList = finalPartiesList --- NOT FUCKING WORK
    const pList = []
    finalPartiesList.map((item)=>pList.push(item))
    console.log(pList)
    switch (sortBy) {
      case 'name':
        pList.sort((a, b) => a.display_name.localeCompare(b.display_name));
        // setDisplayProductList(pList)
        break;
      case 'name_desc':
        pList.sort((a, b) => a.display_name.localeCompare(b.display_name)).reverse();
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
    setDisplayPartiesList(pList)
  }

  useEffect(() => {
    // Load the Parties list
    const a = promiseHttp().then((prom)=>{
      console.log(prom)
      const arr = [];
      let donecount =0;
      const s = prom.map((Parties, i ) => {
        promiseHttpUserPhoto(Parties).then((prom2) => {
          arr.push(prom2);
          donecount+=1;
          return prom2;
        }).then((prom2) => {
          if (donecount===prom.length) {
            console.log('Currently there is no filter when the fist time load')
            console.log(arr)
            setAllPartiesList(arr)
            setDisplayPartiesList(arr)
          }
        })
        return [];
      })
    })

  }, []);

  const handleApplySort = (sortBy) => {
    applySort(sortBy, displayPartiesList)
  }
  
  return (
    <Page title={langPack.artists_title}>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid key='Title' item xs={3} sm={6} md={9}>
              <Typography variant="h4" gutterBottom width='30%'>
                {langPack.artists_Hdr}
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
                <PartiesSort
                  applySort={handleApplySort} 
                  langPack={langPack}
                />
              </Box>
            </Grid>
          </Grid>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 2 }}>
          {displayPartiesList.map((user,i) => {
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
      </Container>
    </Page>
  );
}
