/* eslint-disable jsx-a11y/label-has-associated-control */
import * as Yup from 'yup';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useFormik, Form, FormikProvider, Formik, Field } from 'formik';
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
  FormLabel
} from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';

// ----------------------------------------------------------------------

export default function CreateTokenForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const RegisterSchema = Yup.object().shape({
    chainNetwork: Yup.string().required(
      'Please select the network for the token smart contract to be deployed'
    ),
    deploy: Yup.string().required('Please select the deploy option'),
    tokenName: Yup.string()
      .min(2, 'Too Short!')
      .max(30, 'Too Long!')
      .required('Token name required'),
    tokenAlias: Yup.string()
      .min(2, 'Too Short!')
      .max(5, 'Too Long!')
      .required('Token Alias required'),
    mintAmount: Yup.number().required('Mint amount required'),
    custOwnerAddr: Yup.string().required('Contract Owner Address is required'),
    custInfuraProjId: Yup.string().required('Infura Project Id is required'),
    custMnem: Yup.string().required('Mnemoric phase is required')
  });

  const formik = useFormik({
    initialValues: {
      chainNetwork: '',
      deploy: '',
      tokenName: '',
      tokenAlias: '',
      mintAmount: '',
      custOwnerAddr: '',
      custInfuraProjId: '',
      custMnem: ''
    },
    validationSchema: RegisterSchema,
    onSubmit: async (values) => {
      await new Promise((r) => setTimeout(r, 500));
      alert(JSON.stringify(values, null, 2));
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Chain Network</FormLabel>
            <RadioGroup row aria-label="chainNetwork" name="chainNetwork">
              <FormControlLabel value="rinkeby" control={<Radio />} label="Rinkeby Testnet" />
              <FormControlLabel value="mainnet" control={<Radio />} label="Mainnet" />
            </RadioGroup>
          </FormControl>
          <FormControl component="fieldset">
            <FormLabel component="legend">Deploy Option</FormLabel>
            <RadioGroup row aria-label="deployOption" name="deploy">
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

          <TextField
            fullWidth
            label="Wallet address"
            {...getFieldProps('custOwnerAddr')}
            error={Boolean(touched.custOwnerAddr && errors.custOwnerAddr)}
            helperText={touched.custOwnerAddr && errors.custOwnerAddr}
          />

          <TextField
            fullWidth
            label="Infura Project ID"
            {...getFieldProps('custInfuraProjId')}
            error={Boolean(touched.custInfuraProjId && errors.custInfuraProjId)}
            helperText={touched.custInfuraProjId && errors.custInfuraProjId}
          />

          <TextField
            fullWidth
            type={showPassword ? 'text' : 'custMnem'}
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
