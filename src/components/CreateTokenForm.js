/* eslint-disable jsx-a11y/label-has-associated-control */
import * as Yup from 'yup';
import React, { useState } from 'react';
import { Icon } from '@iconify/react';

import { useFormik, Form, FormikProvider } from 'formik';

// import eyeFill from '@iconify/icons-eva/eye-fill';
// import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
import { useNavigate } from 'react-router-dom';

// material
import {
  Typography,
  Grid,
  Stack,
  TextField,
  IconButton,
  InputAdornment,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Switch,
  Backdrop, 
  CircularProgress,
  Link,
  Button
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import AppShortcutIcon from '@mui/icons-material/AppShortcut';
import axios from 'axios';
import Iconify from './Iconify';
import { urls } from '../properties/urls';
// ----------------------------------------------------------------------

const fakeResponseJSON = {
  "data": {
      "success": true,
      "msg": "Truffle migrate is completed. ONECLICK is deployed to goerli",
      "log": "\nCompiling your contracts...\n===========================\n> Everything is up to date, there is nothing to compile.\n\n\nStarting migrations...\n======================\n> Network name:    'goerli'\n> Network id:      5\n> Block gas limit: 29999944 (0x1c9c348)\n\n\n1_initial_migration.js\n======================\n\n   Deploying 'Migrations'\n   ----------------------\n   > transaction hash:    0x93bb0ef593980bf7b6d547bc8f61d76c03d18abb34cae1819f88bc57fbe1be98\n   > Blocks: 2            Seconds: 20\n   > contract address:    0x747Ce44e2298ecC268F0e75E91b7F7C831921Bfa\n   > block number:        7013318\n   > block timestamp:     1654487927\n   > account:             0x7104F1aDf1224611b7c3831BfeEe591e42e48858\n   > balance:             0.307428862310769373\n   > gas used:            203143 (0x31987)\n   > gas price:           1.500000007 gwei\n   > value sent:          0 ETH\n   > total cost:          0.000304714501422001 ETH\n\n   Pausing for 2 confirmations...\n\n   -------------------------------\n   > confirmation number: 1 (block: 7013319)\n   > confirmation number: 2 (block: 7013320)\n   > Saving migration to chain.\n   > Saving artifacts\n   -------------------------------------\n   > Total cost:     0.000304714501422001 ETH\n\n\n2_deploy.js\n===========\nReady to deploy Token contract\n\n   Deploying 'ONECLICKToken'\n   -------------------------\n   > transaction hash:    0xe357fe727be8e3f135222ca243f6273140855245c7271286c73c1ba677641423\n   > Blocks: 0            Seconds: 8\n   > contract address:    0xE079f2a482705247C920BA5f85Cd4dE9688B0771\n   > block number:        7013322\n   > block timestamp:     1654487987\n   > account:             0x7104F1aDf1224611b7c3831BfeEe591e42e48858\n   > balance:             0.303148507290794383\n   > gas used:            2807654 (0x2ad766)\n   > gas price:           1.500000007 gwei\n   > value sent:          0 ETH\n   > total cost:          0.004211481019653578 ETH\n\n   Pausing for 2 confirmations...\n\n   -------------------------------\n   > confirmation number: 1 (block: 7013323)\n   > confirmation number: 2 (block: 7013324)\nToken contract address:\n0xE079f2a482705247C920BA5f85Cd4dE9688B0771\nReady to deploy Recipient contract\n\n   Deploying 'ONECLICKRecipient'\n   -----------------------------\n   > transaction hash:    0xcad4c8a532f7d8c8f0372a98f9d4bd41fcf68553815779c54b99a58d793d2dac\n   > Blocks: 0            Seconds: 12\n   > contract address:    0xAab3B8138621ff330049686B91E38d17a2EdfD33\n   > block number:        7013325\n   > block timestamp:     1654488032\n   > account:             0x7104F1aDf1224611b7c3831BfeEe591e42e48858\n   > balance:             0.302558464288040849\n   > gas used:            393362 (0x60092)\n   > gas price:           1.500000007 gwei\n   > value sent:          0 ETH\n   > total cost:          0.000590043002753534 ETH\n\n   Pausing for 2 confirmations...\n\n   -------------------------------\n   > confirmation number: 1 (block: 7013326)\n   > confirmation number: 2 (block: 7013327)\nRecipient contract address:\n0xAab3B8138621ff330049686B91E38d17a2EdfD33\nReady to deploy Sender contract\n\n   Deploying 'ONECLICKSender'\n   --------------------------\n   > transaction hash:    0x27aaa3ed776d69fea6f677640e8340d611e519936f98ffa46dd7426c51f462bb\n   > Blocks: 1            Seconds: 12\n   > contract address:    0x3E6C79ce062dD75437C8C9f27D548aaf32AaB783\n   > block number:        7013328\n   > block timestamp:     1654488077\n   > account:             0x7104F1aDf1224611b7c3831BfeEe591e42e48858\n   > balance:             0.302558464288040849\n   > gas used:            397895 (0x61247)\n   > gas price:           1.500000007 gwei\n   > value sent:          0 ETH\n   > total cost:          0.000596842502785265 ETH\n\n   Pausing for 2 confirmations...\n\n   -------------------------------\n   > confirmation number: 1 (block: 7013329)\n   > confirmation number: 2 (block: 7013330)\nSender contract address:\n0x3E6C79ce062dD75437C8C9f27D548aaf32AaB783\nEnd of truffle\n   > Saving migration to chain.\n   > Saving artifacts\n   -------------------------------------\n   > Total cost:     0.005398366525192377 ETH\n\nSummary\n=======\n> Total deployments:   4\n> Final cost:          0.005703081026614378 ETH\n",
      "chainNetwork": "goerli",
      "tokenAlias": "ONECK",
      "tokenContractAddr": "0xE079f2a482705247C920BA5f85Cd4dE9688B0771",
      "recipientContractAddr": "0xAab3B8138621ff330049686B91E38d17a2EdfD33",
      "senderContractAddr": "0x3E6C79ce062dD75437C8C9f27D548aaf32AaB783",
      "data": {
          "verification": {
              "result": "fyfgzlmcg29e1dazp2zbmbdnkiqashitaxbgp4ugxkuz4nynbb",
              "message": "OK",
              "status": "1"
          },
          "details": {
            "result": "success",
            "message": "OK",
            "status": "1"
        }
      }
  }
}

export default function CreateTokenForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showRequireMnem, setShowRequireMnem] = useState(false);
  const [deployResultJSON, setDeployResultJSON ] = useState(null)
  const [miscOption, setMiscOption] = useState(false);
  const [mainnetOption, setMainnetOption] = useState(false);
  const [showDetailOption, setShowDetailOption] = useState(false);

  const handleMainnetRadio = (event) => {
    console.log(event)
    if (event.target.id==='mainnetRadio') {
      setMainnetOption(true)
    } else {
      setMainnetOption(false)
    }


  };

  const [openLoadScreen, setOpenLoadScreen] = React.useState(false);
  const handleClose = () => {
    setOpenLoadScreen(false);
  };
  const handleToggle = () => {
    setOpenLoadScreen(!openLoadScreen);
  };

  const CreateTokenSchema = Yup.object().shape({
    chainNetwork: Yup.string().required(
      'Please select the network for the token smart contract to be deployed'
    ),
    deployOption: Yup.string().required('Please select the deploy option'),
    tokenName: Yup.string()
      .min(2, 'Too Short!')
      .max(30, 'Too Long!')
      .required('Token name required'),
    tokenAlias: Yup.string()
      .min(2, 'Too Short!')
      .max(5, 'Too Long!')
      .required('Token Alias required'),
    mintAmount: Yup.number().required('Mint amount required')
    /*
    custOwnerAddr: Yup.string().required('Contract Owner Address is required'),
    custInfuraProjId: Yup.string().required('Infura Project Id is required'),
    custMnem: Yup.string().required('Mnemoric phase is required')
    */
  });

  const formik = useFormik({
    initialValues: {
      chainNetwork: '',
      deployOption: '',
      tokenName: '',
      tokenAlias: '',
      mintAmount: '',
      custOwnerAddr: '',
      custInfuraProjId: '',
      custMnem: '',
      npmInstall: 'false',
      delNodeModuleDir: 'true',
      uploadSourceCode: 'true',
      retryWhenFail: 'true'
    },
    validationSchema: CreateTokenSchema,
    onSubmit: async (values) => {
      
      console.log(JSON.stringify(values, null, 2));

      if (mainnetOption && values.custMnem!=='') {
        handleToggle()
        await new Promise((r) => setTimeout(r, 500));
        axios({
          method: 'post',
          url: urls.truffleMigrate,
          responseType: 'json',
          crossDomain: true,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          data: JSON.stringify(values, null, 2)
        // }).error((error) => {
        //  handleToggle()
        //  console.log('HTTP call to Process Builder fail');
        }).then((response) => {
          console.log('HTTP call to deploy done');
          console.log(response);
          console.log(response.data);
          setDeployResultJSON(response.data)
          // extractJSON()
          handleClose()

        });
      } else {
        setShowRequireMnem(true)
      }
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;
  const getIcon = (name) => <Iconify icon={name} width={22} height={22} />;

  let senderContAddr='';
  let recipientContAddr='';
  let verificationMsg='';
  let detailsMsg='';
  let detailsResult='';
  let verificationResult='';
  let etherscanLink='#'

  function extractJSON (){
    console.log('extractJSON')
    
    if (deployResultJSON.data.chainNetwork === 'mainnet')
      etherscanLink = `https://etherscan.io/token/${deployResultJSON.data.tokenContractAddr}`
    else 
      etherscanLink = `https://${deployResultJSON.data.chainNetwork}.etherscan.io/token/${deployResultJSON.data.tokenContractAddr}`
    try { 
      senderContAddr=deployResultJSON.data.senderContractAddr
      recipientContAddr=deployResultJSON.data.recipientContractAddr
      verificationMsg=deployResultJSON.data.data.verification.message
      detailsMsg=deployResultJSON.data.data.details.message
      detailsResult=deployResultJSON.data.data.details.result
      verificationResult=deployResultJSON.data.data.verification.result
    } catch (error) {
     console.log('')    
    }
  }
  // extractJSON()
  
  async function addTokenFunction(tokenAddress,tokenSymbol) {

    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', 
          options: {
            address: tokenAddress, 
            symbol: tokenSymbol, 
            decimals: 18, 
            // image: tokenImage, 
          },
        },
      });
    
      if (wasAdded) {
        console.log('Thanks for your interest!');
      } else {
        console.log("{tokenSymbol} has not been added");
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
    <Grid container spacing={3} sx={{mt:2, mb: 2, width: '100%'} }>
      <Grid item xs={12} md={6} lg={6}>
        <FormikProvider value={formik}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <Stack spacing={3} >
              <FormControl component="fieldset">
                <FormLabel component="legend">Chain Network</FormLabel>
                <RadioGroup
                  row
                  aria-label="chainNetwork"
                  name="chainNetwork"
                  {...getFieldProps('chainNetwork')}
                >
                  <FormControlLabel value="rinkeby" control={<Radio />} label="Rinkeby Testnet" />
                  <FormControlLabel value="goerli" control={<Radio />} label="Goerli Testnet" />
                  <FormControlLabel value="mainnet" control={<Radio id="mainnetRadio" onChange={(e) => handleMainnetRadio(e) } />} label="Mainnet" />
                </RadioGroup>
              </FormControl>
              <FormControl component="fieldset">
                <FormLabel component="legend">Deployment Option</FormLabel>
                <RadioGroup
                  row
                  aria-label="Deploy"
                  name="deployOption"
                  {...getFieldProps('deployOption')}
                >
                  <FormControlLabel value="0" control={<Radio />} label="Create contract only" />
                  <FormControlLabel value="true" control={<Radio />} label="Deploy to blockchain" />
                </RadioGroup>
              </FormControl>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Token name"
                  {...getFieldProps('tokenName')}
                  error={Boolean(touched.tokenName && errors.tokenName)}
                  helperText={touched.tokenName && errors.tokenName}
                />

                <TextField
                  fullWidth
                  label="Token alias"
                  {...getFieldProps('tokenAlias')}
                  error={Boolean(touched.tokenAlias && errors.tokenAlias)}
                  helperText={touched.tokenAlias && errors.tokenAlias}
                />

                <TextField
                  fullWidth
                  label="Mint Amount"
                  {...getFieldProps('mintAmount')}
                  error={Boolean(touched.mintAmount && errors.mintAmount)}
                  helperText={touched.mintAmount && errors.mintAmount}
                />
              </Stack>

              <FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      // checked={state.checkedB}
                      onChange={() => setMiscOption((prev) => !prev)}
                      // name="checkedB"
                      color="primary"
                    />
                  }
                  label="Misc Options"
                />
              </FormControl>

              <Stack sx={!mainnetOption ? { visibility: 'hidden', height: 0} : { visibility: 'visible', height: 60 }} spacing={3}>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  label="Mnemoric phase"
                  {...getFieldProps('custMnem')}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton edge="end" onClick={() => setShowPassword((prev) => !prev)}>
                          <Icon icon={showPassword ? getIcon('eva:eye-fill') : getIcon('eva:eye-Off-Fill')} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  error={Boolean(touched.custMnem && errors.custMnem)}
                  helperText={touched.custMnem && errors.custMnem}
                  disabled={!mainnetOption}
                  sx={!mainnetOption ? { visibility: 'hidden' } : { visibility: 'visible' }}
                />
                <Typography variant="caption" gutterBottom color="error" sx={!showRequireMnem ? { visibility: 'hidden', height: 0} : { visibility: 'visible', height: 60 }}>
                  Mnemoric phase is required when deploy the contract to Mainnet.
                </Typography>

              </Stack>
              
              <Stack sx={!miscOption ? { visibility: 'hidden', height: 0} : { visibility: 'visible', height: 60 }} spacing={3}>
              {/*
              <TextField
                fullWidth
                label="Owner's Wallet address"
                {...getFieldProps('custOwnerAddr')}
                error={Boolean(touched.custOwnerAddr && errors.custOwnerAddr)}
                helperText={touched.custOwnerAddr && errors.custOwnerAddr}
                disabled={!miscOption}
                sx={!miscOption ? { visibility: 'hidden' } : { visibility: 'visible' }}
              />
              */}

              <TextField
                fullWidth
                label="Infura Project ID"
                {...getFieldProps('custInfuraProjId')}
                error={Boolean(touched.custInfuraProjId && errors.custInfuraProjId)}
                helperText={touched.custInfuraProjId && errors.custInfuraProjId}
                disabled={!miscOption}
                sx={!miscOption ? { visibility: 'hidden' } : { visibility: 'visible' }}
              />

              </Stack>
              {/*
              <Stack sx={!showRequireMnem ? { visibility: 'hidden', height: 0} : { visibility: 'visible', height: 60 }} spacing={3}>

              </Stack>
              */}
              
              <LoadingButton
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                Create Token
              </LoadingButton>
            </Stack>
          </Form>
        </FormikProvider>
      </Grid>
    
      <Grid item xs={12} md={6} lg={6}>
        <Stack >
        {deployResultJSON!=null ?
          <>
          <Typography variant="h5" gutterBottom>
            Deployment Result:
          </Typography>
          <Typography variant="inherit" gutterBottom>
            {deployResultJSON.data.msg}
          </Typography>
          

          {!deployResultJSON.data.success ? 
          <Typography variant="inherit" gutterBottom>Deployment fail. Please contact us</Typography> 
          : <><Typography variant="h5" gutterBottom>
              Token Contract Address:
            </Typography>
            
            <Typography variant="inherit" gutterBottom>
              {deployResultJSON.data.tokenContractAddr}
            </Typography>
            <Grid container columnSpacing={3}>
              <Grid item>
              <Link href={
                deployResultJSON.data.chainNetwork === 'mainnet'?
                  `https://etherscan.io/token/${deployResultJSON.data.tokenContractAddr}`
                : 
                  `https://${deployResultJSON.data.chainNetwork}.etherscan.io/token/${deployResultJSON.data.tokenContractAddr}`
                }
                target="_blank" variant="subtitle2" underline="hover" >
                [check on ETHERSCAN]
              </Link>
              </Grid>
              <Grid item>
                <Button onClick={() => {
                  addTokenFunction(deployResultJSON.data.tokenContractAddr,deployResultJSON.data.tokenAlias);
                }}
                variant="contained" color="success"
                endIcon={<AppShortcutIcon />}
                >
                  Add token to wallet
                </Button>
              </Grid>
            </Grid>
            </>
          }
          </>
          : <></>
        } 
        
        </Stack>
        {deployResultJSON!=null ?
        <>
        <Typography variant="caption" gutterBottom>
          Details log:
        </Typography>
        <TextField
          placeholder="MultiLine with rows: 10 and rowsMax: 10"
          multiline
          rows={10}
          value={deployResultJSON.data.log}
          sx= {{width: '100%'}}
        />
        <FormControl>
          <FormControlLabel
            control={
              <Switch
                onChange={() => setShowDetailOption((prev) => !prev)}
                color="primary"
              />
            }
            label="Show More Details"
            sx={ {pt:3}}
          
          />
        </FormControl>
        <Stack sx={!showDetailOption ? { visibility: 'hidden', height: 0} : { visibility: 'visible', height: 250 }} spacing={2} pd={5}>
          
          <Typography variant="h6">
            Sender Contract Address:
          </Typography>
          <Typography variant="inherit" gutterBottom>
            {deployResultJSON.data.senderContractAddr} 
          </Typography>
          <Typography variant="h6" gutterBottom>
            Recipient Contract Address:
          </Typography>
          <Typography variant="inherit" gutterBottom>
            {deployResultJSON.data.recipientContractAddr}
          </Typography>
          <Typography variant="h6" gutterBottom>
            Verification Return Message:
          </Typography>
          <Typography variant="inherit" gutterBottom>
            {deployResultJSON.data.data.verification.message}
          </Typography>
          <Typography variant="h6" gutterBottom>
            Verification Details Message:
          </Typography>
          <Typography variant="inherit" gutterBottom>
            {deployResultJSON.data.data.details.message}
          </Typography>
          <Typography variant="inherit" gutterBottom>
            {deployResultJSON.data.data.details.result}
          </Typography>
          <Typography variant="h6" gutterBottom>
            Verification GUID:
          </Typography>
          <Typography variant="inherit" gutterBottom>
            {deployResultJSON.data.data.verification.result}
          </Typography>
        </Stack>
        </>: <></>}
      </Grid>
    </Grid>
    <div>
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2 }}
      open={openLoadScreen}
      onClick={handleClose}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
    </div>
  </>
  );
}
