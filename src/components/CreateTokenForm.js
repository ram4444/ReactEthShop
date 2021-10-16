/* eslint-disable jsx-a11y/label-has-associated-control */
import * as Yup from 'yup';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useFormik, Form, FormikProvider } from 'formik';
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
import { useNavigate } from 'react-router-dom';

// material
import {
  Stack,
  TextField,
  IconButton,
  InputAdornment,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Switch
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import { urls } from '../properties/urls';
// ----------------------------------------------------------------------

export default function CreateTokenForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [advanceOption, setAdvanceOption] = useState(false);

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
      custMnem: ''
    },
    validationSchema: CreateTokenSchema,
    onSubmit: async (values) => {
      await new Promise((r) => setTimeout(r, 500));
      // console.log(JSON.stringify(values, null, 2));

      axios({
        method: 'post',
        url: urls.truffleMigrate,
        responseType: 'json',
        crossDomain: true,
        headers: { 'Access-Control-Allow-Origin': '*' },
        data: JSON.stringify(values, null, 2)
      }).then((response) => {
        console.log('HTTP call done');
        console.log(response.data);
      });
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Chain Network</FormLabel>
            <RadioGroup
              row
              aria-label="chainNetwork"
              name="chainNetwork"
              {...getFieldProps('chainNetwork')}
            >
              <FormControlLabel value="rinkeby" control={<Radio />} label="Rinkeby Testnet" />
              <FormControlLabel value="Rinkeby" control={<Radio />} label="Mainnet" />
            </RadioGroup>
          </FormControl>
          <FormControl component="fieldset">
            <FormLabel component="legend">Deploy Option</FormLabel>
            <RadioGroup
              row
              aria-label="deployOption"
              name="deployOption"
              {...getFieldProps('deployOption')}
            >
              <FormControlLabel value="0" control={<Radio />} label="Create contract only" />
              <FormControlLabel value="1" control={<Radio />} label="Deploy to blockchain" />
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
                  onChange={() => setAdvanceOption((prev) => !prev)}
                  // name="checkedB"
                  color="primary"
                />
              }
              label="Advance Options"
            />
          </FormControl>

          <TextField
            fullWidth
            label="Owner's Wallet address"
            {...getFieldProps('custOwnerAddr')}
            error={Boolean(touched.custOwnerAddr && errors.custOwnerAddr)}
            helperText={touched.custOwnerAddr && errors.custOwnerAddr}
            disabled={!advanceOption}
            sx={!advanceOption ? { visibility: 'hidden' } : { visibility: 'visible' }}
          />

          <TextField
            fullWidth
            label="Infura Project ID"
            {...getFieldProps('custInfuraProjId')}
            error={Boolean(touched.custInfuraProjId && errors.custInfuraProjId)}
            helperText={touched.custInfuraProjId && errors.custInfuraProjId}
            disabled={!advanceOption}
            sx={!advanceOption ? { visibility: 'hidden' } : { visibility: 'visible' }}
          />

          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="Mnemoric phase"
            {...getFieldProps('custMnem')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end" onClick={() => setShowPassword((prev) => !prev)}>
                    <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                  </IconButton>
                </InputAdornment>
              )
            }}
            error={Boolean(touched.custMnem && errors.custMnem)}
            helperText={touched.custMnem && errors.custMnem}
            disabled={!advanceOption}
            sx={!advanceOption ? { visibility: 'hidden' } : { visibility: 'visible' }}
          />

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
  );
}
