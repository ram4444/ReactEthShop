import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFormik, Form, FormikProvider } from 'formik';
// material
import { Link, Stack, Checkbox, TextField, IconButton, InputAdornment, FormControlLabel } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import Cookies from 'js-cookie';
import { urls } from '../../../properties/urls';
// component
import Iconify from '../../../components/Iconify';

// ----------------------------------------------------------------------
CurrentUserForm.propTypes = {
  langPack: PropTypes.object
};

export default function CurrentUserForm({langPack}) {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const CurrentUserInfoSchema = Yup.object().shape({
    username: Yup.string()
      .min(2, langPack.userInfoForm_wrn_short)
      .max(30, langPack.userInfoForm_wrn_long)
      .required(langPack.userInfoForm_wrn_usernameReq),
    email: Yup.string().email(langPack.userInfoForm_wrn_emailReq).required(langPack.userInfoForm_wrn_emailInvalid),  
    address1: Yup.string()
      .min(2, langPack.userInfoForm_wrn_short)
      .max(200, langPack.userInfoForm_wrn_long)
      .required(langPack.userInfoForm_wrn_addrReq),
    address2: Yup.string()
      .max(200, langPack.userInfoForm_wrn_long),
    /*
    custOwnerAddr: Yup.string().required('Contract Owner Address is required'),
    custInfuraProjId: Yup.string().required('Infura Project Id is required'),
    custMnem: Yup.string().required('Mnemoric phase is required')
    */
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      username: '',
      country: '',
      address1: '',
      address2: '',
    },
    validationSchema: CurrentUserInfoSchema,
    onSubmit: async (values) => {
      await new Promise((r) => setTimeout(r, 500));
      // console.log(JSON.stringify(values, null, 2));
      Cookies.set('username',values.username);
      Cookies.set('email',values.email);
      Cookies.set('address1',values.address1);
      Cookies.set('address2',values.address2);
      Cookies.set('DeliveryAddrFilled',true);
      axios({
        method: 'post',
        url: urls.appendwalletaddr,
        responseType: 'json',
        crossDomain: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(values, null, 2)
      }).then((response) => {
        console.log('HTTP call done');
        console.log(response.data);
        // Store infor to cookies
        // Redirect back to home
        navigate('/list/articles', { replace: true });
      });
      
    },
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            autoComplete="name"
            type="text"
            label={langPack.userInfoForm_Lbl_username}
            {...getFieldProps('username')}
            error={Boolean(touched.username && errors.username)}
            helperText={touched.username && errors.username}
          />
          <TextField
            fullWidth
            autoComplete="username"
            type="email"
            label={langPack.userInfoForm_Lbl_email}
            {...getFieldProps('email')}
            error={Boolean(touched.email && errors.email)}
            helperText={touched.email && errors.email}
          />
          <TextField
            fullWidth
            autoComplete="address-line1"
            type="text"
            label={langPack.userInfoForm_Lbl_addr1}
            {...getFieldProps('address1')}
            helperText={touched.address1 && errors.address1}
          />
          <TextField
            fullWidth
            autoComplete="address-line2"
            type="text"
            label={langPack.userInfoForm_Lbl_addr2}
            {...getFieldProps('address2')}
            helperText={touched.address1 && errors.address1}
          />

          <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
            {langPack.userInfoForm_btn}
          </LoadingButton>
        </Stack>
      </Form>
    </FormikProvider>
  );
}
