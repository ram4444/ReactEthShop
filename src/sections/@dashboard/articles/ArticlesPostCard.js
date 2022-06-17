import React, { useState } from 'react';
import Web3 from 'web3';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
// material
import { alpha, styled } from '@mui/material/styles';
import { Box, Link, Card, Grid, Avatar, Typography, CardContent, Modal, Backdrop, CircularProgress, Stack } from '@mui/material';
// utils
import { fDate } from '../../../utils/formatTime';
import { fShortenNumber } from '../../../utils/formatNumber';
import { triggerTransaction } from '../../../utils/ethUtil';
//
import SvgIconStyle from '../../../components/SvgIconStyle';
import Iconify from '../../../components/Iconify';
import { urls } from '../../../properties/urls';
import { localChainList } from '../../../properties/localChainList';

// ----------------------------------------------------------------------

const { abi } = require('../../../abi/ERC777.json');

const CardMediaStyle = styled('div')({
  position: 'relative',
  paddingTop: 'calc(100% * 3 / 4)',
});

const TitleStyle = styled(Link)({
  height: 44,
  overflow: 'hidden',
  WebkitLineClamp: 2,
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
});

const AvatarStyle = styled(Avatar)(({ theme }) => ({
  zIndex: 9,
  width: 32,
  height: 32,
  position: 'absolute',
  left: theme.spacing(3),
  bottom: theme.spacing(-2),
}));

const InfoStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  marginTop: theme.spacing(3),
  color: theme.palette.text.disabled,
}));

const CoverImgStyle = styled('img')({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute',
});

const ModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  maxHeight: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  borderRadius: '25px',
  overflow: "hidden",
  overflowY: "scroll", // added scroll
  boxShadow: 24,
  p: 4,
};

// ----------------------------------------------------------------------



const App = new Web3()
let web3
let walletFound = false;

async function init() {
  
  if (window.ethereum) {
    App.web3Provider = window.ethereum;
    try {
      // Request account access
      
      // Depricatd soon 
      // await window.ethereum.enable();
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      walletFound=true
      console.log('Wallet found')
    } catch (error) {
      // User denied account access...
      console.error("User denied account access")
    }
  } else if (window.web3) {
    App.web3Provider = window.web3.currentProvider;
    walletFound=true
    console.log('Wallet found [Legacy]')
  }
  // If no injected web3 instance is detected, fall back to Ganache
  else {
    console.error('web3 was undefined');
    walletFound=false
  }
  web3 = new Web3(App.web3Provider);
  // legacy 
  /*
  if (typeof web3 !== 'undefined') {
    console.log('Web3 found');
    window.web3 = new Web3(window.web3.currentProvider);
    // web3.eth.defaultAccount = web3.eth.accounts[0];
    walletFound=true
  } else {
    console.error('web3 was undefined');
    walletFound=false
  }
  */

}
init();

let contract;

function promiseHttpAbi(chain, contractAddr) {
  let apiURL;
  switch (chain) {
    case 'Rinkeby':
      apiURL = urls.etherscan_rinkeby;
      break;
    case 'Ethereum Mainnet':
      apiURL = urls.etherscan_mainnet;
      break;
    default:
      apiURL = urls.etherscan_rinkeby;
  }

  return axios({
    method: 'get',
    url: apiURL+contractAddr,
    responseType: 'json',
    // crossDomain: true,
    // headers: { 'Access-Control-Allow-Origin': '*' }
  })
    .then((response) => {
      console.log(`HTTP call to ${chain} Etherscan is done`);
      console.log(response);
      return response;
  })
    
}

ArticlesPostCard.propTypes = {
  post: PropTypes.object.isRequired,
  index: PropTypes.number,
};

export default function ArticlesPostCard({ post, index }) {
  const { id, cover, title, summary, body, view, comment, share, author, authorWallet, price, paymentContract, paymentChain, paymentTokenAlias, paymentTokenName, createdAt} = post;
  
  const [openModal, setOpenModal] = React.useState(false);
  const [openLoadScreen, setOpenLoadScreen] = React.useState(false);
  const [openLoadCircle, setOpenLoadCircle] = React.useState(true);
  const [openFinishTick, setOpenFinishTick] = React.useState(false);
  const [openFinishX, setOpenFinishX] = React.useState(false);

  const handleOpenModal = () => setOpenModal(true);
  
  const handleCloseModal = () => {
    console.log("Close Modal")
    setOpenLoadScreen(false);
    setOpenModal(false);
  };
  const handleToggle = () => {
    if (openLoadScreen) {
      console.log("Close loading screen")
      setOpenLoadScreen(false);
      setOpenFinishTick(false);
      setOpenFinishX(false);
    } else {
      console.log("Open loading screen")
      setOpenLoadScreen(true);
    }


  };
  
  const latestPostLarge = index === 0;
  const latestPost = index === 1 || index === 2;

  
  const POST_INFO = [
    { number: comment, icon: 'eva:message-circle-fill' },
    { number: view, icon: 'eva:eye-fill' },
    { number: share, icon: 'eva:share-fill' },
  ];
  
  // console.log(post)
  // console.log(paymentTokenAlias)
  let acc = [];
  let abiUse;

  async function ivkContractFuncBySEND(acct) {
    function onSuccess() {
      console.log("Transaction successful")
      handleToggle()
      setOpenLoadCircle(false)
      setOpenFinishTick(true)
      setOpenFinishX(false)
      setOpenModal(true)
    }

    function onFail() {
      console.log("Fail to transfer")
      handleToggle()
      setOpenLoadCircle(false)
      setOpenFinishTick(false)
      setOpenFinishX(true)
    }

    setOpenLoadCircle(true)
    setOpenFinishTick(false)
    setOpenFinishX(false)
    triggerTransaction(paymentChain, paymentContract, paymentTokenName, acct, authorWallet, price, onSuccess, onFail)
  }
  
  /*
  async function ivkContractFuncBySEND(acct) {
    
    let chainIdUse=''
    switch (paymentChain) {
      case 'Rinkeby':
        chainIdUse = '0x4';
        break;
      case 'Ethereum Mainnet':
        chainIdUse = '0x1';
        break;
      default:
        chainIdUse = '0x4';
    }
    
    // Query the abi by the follow url as sample
    // const response = await fetch('https://api-ropsten.etherscan.io/api?module=contract&action=getabi&address=0xC1dcBB3E385Ef67f2173A375F63f5F4361C4d2f9&apikey=YourApiKeyToken');
    
    // Get the gas price first
    web3.eth.getGasPrice().then((result) => {
      
      console.log('GasFee in Wei')
      console.log(result)
  
      let gasFee
      let unit
      if (paymentTokenName.includes("Tether")) {
        // For adjustment of USDT
        unit='mwei'
      } else {
        unit='ether'
      }
  
      let chainIdUse;
      switch (paymentChain) {
        case 'Rinkeby':
          chainIdUse = '0x4';
          // gasFee = web3.utils.toHex(web3.utils.toWei('100', 'gwei'))
          gasFee = web3.utils.toBN(Math.round(web3.utils.fromWei('188729959600000', 'gwei')))
          if (paymentTokenName.includes("Tether")) {
            unit='ether'
          }
          break;
        case 'Ethereum Mainnet':
          chainIdUse = '0x1';
          gasFee = web3.utils.toBN(Math.round(web3.utils.fromWei(result, 'gwei')))
          console.log(gasFee)
          break;
        default:
          chainIdUse = '0x4';
          // gasFee = web3.utils.toHex(web3.utils.toWei('100', 'gwei'))
          gasFee = web3.utils.toBN(Math.round(web3.utils.fromWei('188729959600000', 'gwei')))
          if (paymentTokenName.includes("Tether")) {
            unit='ether'
          }
      }
  
      if (paymentTokenName.includes("Ethereum")) {
        console.log(`Read to send ${paymentTokenName} with no contract address`)
        web3.eth.sendTransaction({
          from: acct, 
          to: authorWallet, 
          value: web3.utils.toWei(price, 'ether'), 
          gas: gasFee
        })
        .on('error', (error, receipt) => {
          console.log('error')
          console.log(error)
          console.log(receipt)
          // handleClose()
        })
        .then((receipt) => {
          console.log(receipt)
          // processReceipt(receipt, product, currencyName, chain, deliveryType)
          // handleClose()
        });
      } else {
        console.log(`Read to send ${paymentTokenName}`)
        promiseHttpAbi(paymentChain, paymentContract).then((response) => {
          if (response.data.status === '1') {
            console.log(response.data.message);
            abiUse = JSON.parse(response.data.result);
            contract = new web3.eth.Contract(abiUse, paymentContract);
            
          } else {
            console.log(response.message);
            console.log(response.result);
            console.log('Query ABI from Etherscan fail, use local ABI file instead');
            contract = new web3.eth.Contract(abi, paymentContract);
          }
    
          contract.methods
            .transfer(authorWallet, web3.utils.toWei(price, unit))
            .send({
              from: acct,
              // value: web3.utils.toHex(web3.utils.toWei('100', 'gwei')),
              gas: gasFee,
              // gas: web3.utils.toHex(42000),
              chainId: chainIdUse,
              data: ''
            })
            .on('error', (error, receipt) => {
              console.log('error')
              console.log(error)
              console.log(receipt)
              // handleClose()
            })
            .then((receipt) => {
              // handleClose()
              console.log(receipt)
              // processReceipt(receipt, product, currencyName, chain, deliveryType)
            });
          
        }) 
      }
    
    })
  }
  */

  const onClickBuy = () => {
    if (parseFloat(price)!==0) {
      // Sending Ethereum to an address
      acc = window.ethereum.request({ method: 'eth_requestAccounts' });
      acc.then((result) => {
        console.log('result when call')
        console.log(result)
        handleToggle()
        ivkContractFuncBySEND(result[0])
      });
    } else {
      setOpenModal(true)
    }
  };

  return (
    <Grid item xs={12} sm={latestPostLarge ? 12 : 6} md={latestPostLarge ? 6 : 3}>
      <Card sx={{ position: 'relative' }}>
        <CardMediaStyle
          sx={{
            ...((latestPostLarge || latestPost) && {
              pt: 'calc(100% * 4 / 3)',
              '&:after': {
                top: 0,
                content: "''",
                width: '100%',
                height: '100%',
                position: 'absolute',
                bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
              },
            }),
            ...(latestPostLarge && {
              pt: {
                xs: 'calc(100% * 4 / 3)',
                sm: 'calc(100% * 3 / 4.66)',
              },
            }),
          }}
        >
          <SvgIconStyle
            color="paper"
            src="/static/icons/shape-avatar.svg"
            sx={{
              width: 80,
              height: 36,
              zIndex: 9,
              bottom: -15,
              position: 'absolute',
              color: 'background.paper',
              ...((latestPostLarge || latestPost) && { display: 'none' }),
            }}
          />

          <CoverImgStyle alt={title} src={cover} />
        </CardMediaStyle>

        <CardContent
          sx={{
            pt: 4,
            ...((latestPostLarge || latestPost) && {
              bottom: 0,
              width: '100%',
              position: 'absolute',
            }),
          }}
        >
          <Typography gutterBottom variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
            {fDate(createdAt)}
          </Typography>

          <TitleStyle
            to="#"
            color="inherit"
            variant="subtitle2"
            underline="hover"
            component={RouterLink}
            sx={{
              ...(latestPostLarge && { typography: 'h5', height: 60 }),
              ...((latestPostLarge || latestPost) && {
                color: 'common.white',
              }),
            }}
            onClick={
              onClickBuy
            }
          >
            {title}
          </TitleStyle>
          <Typography gutterBottom variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
            {parseFloat(price)!==0 ? `Pay to read Price: ${paymentTokenAlias} ${price}` : null}
          </Typography>
          <div>
            <Modal
              open={openModal}
              onClose={handleCloseModal}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={ModalStyle}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                {title}
                </Typography>
                <div dangerouslySetInnerHTML={{ __html: body }} height={200} />
              </Box>
            </Modal>
          </div>
          
            <Backdrop
              sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2 }}
              open={openLoadScreen}
              onClick={handleToggle}
            >
              <Stack justifyContent="center" >
                <CircularProgress color="inherit" sx={
                    !openLoadCircle ? { display: 'none' } : 
                    { visibility: 'visible'}} />
                
                <Stack sx={!openFinishTick ? { display: 'none' } : { visibility: 'visible', justifyContent: 'center'}}>
                  <Iconify icon="mdi:check" 
                    sx={{width: 128, height: 128, margin: 'auto'}} />
                  <Typography variant="h3" align='center'>
                      Transaction Success
                  </Typography>
                  <Typography variant="subtitle2" align='center'>
                      Press to continue
                  </Typography>
                </Stack>
                
                <Stack sx={!openFinishX ? { display: 'none' } : { visibility: 'visible', justifyContent: 'center'}}>
                  <Iconify icon="codicon:error"
                    sx={{width: 128, height: 128, margin: 'auto'}} />
                  <Typography variant="h3" >
                      Transaction Fail
                  </Typography>
                  <Typography variant="subtitle2" align='center'>
                      Press to continue
                  </Typography>
                </Stack>
              </Stack>

            </Backdrop>
          

          <InfoStyle>
            {POST_INFO.map((info, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  ml: index === 0 ? 0 : 1.5,
                  ...((latestPostLarge || latestPost) && {
                    color: 'grey.500',
                  }),
                }}
              >
                <Iconify icon={info.icon} sx={{ width: 16, height: 16, mr: 0.5 }} />
                <Typography variant="caption">{fShortenNumber(info.number)}</Typography>
              </Box>
            ))}
          </InfoStyle>
          
        </CardContent>
      </Card>
    </Grid>
  );
}
