import * as Yup from 'yup';
import React, { useState, useEffect, useContext, useRef} from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import PropTypes from 'prop-types';
import axios from 'axios';
// Material
import { styled } from '@mui/material/styles';
import { Stack, TextField, Typography, Container, Divider} from '@mui/material';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useFormik, Form, FormikProvider } from 'formik';
import { LoadingButton } from '@mui/lab';
import {uuid} from 'uuidv4'
import Cookies from 'js-cookie';


import { TestContext, ProdContext } from '../Context';
// import { contractAddr } from '../properties/contractAddr';
import { urls } from '../properties/urls';
import { putItemICO } from '../utils/awsClient'

async function processICO(details, minUnit, startupPrice, paypalClientId, issueAddr, formUsername, formEmail, formAmount) {
  
  const detailsId = details.id 
  const currencyCode = details.purchase_units[0].amount.currency_code
  const amount = details.purchase_units[0].amount.value
  const payeeEmailAddress = details.purchase_units[0].payee.email_address
  const payeeMerchantId = details.purchase_units[0].payee.merchant_id
  const softDescriptor = details.purchase_units[0].soft_descriptor
  const shippingFullName = details.purchase_units[0].shipping.name.full_name
  const shippingAddressLine1 = details.purchase_units[0].shipping.address.address_line_1
  const shippingAddressLine2 = details.purchase_units[0].shipping.address.address_line_2
  const shippingAddressAdminArea1 = details.purchase_units[0].shipping.address.admin_area_1
  const shippingAddressAdminArea2 = details.purchase_units[0].shipping.address.admin_area_2
  const shippingAddressCountryCode = details.purchase_units[0].shipping.address.country_code
  const paymentId = details.purchase_units[0].payments.captures[0].id
  const paymentCurrencyCode = details.purchase_units[0].payments.captures[0].amount.currency_code
  const paymentAmount = details.purchase_units[0].payments.captures[0].amount.value
  const paymentCreateTime = details.purchase_units[0].payments.captures[0].create_time
  const paymentUpdateTime = details.purchase_units[0].payments.captures[0].update_time
  const payerGivenName = details.payer.name.given_name
  const payerSurname = details.payer.name.surname
  const payerEmailAddress = details.payer.email_address
  const payerId = details.payer.payer_id // Review
  const payerAddressLine1 = details.payer.address.address_line_1
  const payerAddressLine2 = details.payer.address.address_line_2
  const payerAddressAdminArea1 = details.payer.address.admin_area_1
  const payerAddressAdminArea2 = details.payer.address.admin_area_2
  const payerCountryCode = details.payer.address.country_code
  const createTime= details.create_time
  const updateTime= details.update_time
  const payerCheckoutHref= details.links[0].href

  const stringifyJson = JSON.stringify(details)
  

  // In custom TOKEN contract address is in receipt.to, Receiver is in receipt.events.Transfer.returnValues.to
  // 
  
  /*
  With Cap letters:
  receipt.events.Transfer.returnValues.to
  product.receiverAddr

  Lower Cap letters only:
  eth_request_account
  receipt.to, receipt.from
  */
  console.log(stringifyJson)
  const uid=uuid()
  // console.log(uid)
  
  const record=
  { 
    // MAP type need hard code
    "ico_order_id": { S: uid },
    // info from form 
    "form_username": {S: formUsername},
    "form_email": {S: formEmail},
    "form_amount": {N: formAmount.toString()},
    
    // Info from drupal
    "min_unit": {S: minUnit},
    "startup_price": {S: startupPrice},
    "paypal_clientId" : {S: paypalClientId},
    "issue_addr" : {S: issueAddr},

    // Info from paypal return
    "details_id": { S: detailsId },
    "currency_code": { S: currencyCode },
    "amount": { N: amount }, 
    "payee_email_address": { S: payeeEmailAddress },
    "payee_merchant_id": { S: payeeMerchantId },
    "soft_descriptor": {S: softDescriptor},
    "shipping_full_name": {S: shippingFullName},
    "shipping_address_line_1": {S: shippingAddressLine1},
    "shipping_address_line_2": {S: shippingAddressLine2},
    "shipping_address_admin_area_1": {S: shippingAddressAdminArea1},
    "shipping_address_admin_area_2": {S: shippingAddressAdminArea2},
    "shipping_address_country_code": {S: shippingAddressCountryCode},
    "payment_id": { S: paymentId },
    "payment_currency_code": { S: paymentCurrencyCode },
    "payment_amount": { S: paymentAmount },
    "payment_create_time": { S: paymentCreateTime },
    "payment_update_time": { S: paymentUpdateTime },
    "payer_given_name": { S: payerGivenName },
    "payer_surname": { S: payerSurname },
    "payer_email_address": { S: payerEmailAddress },
    "payer_id": { S: payerId },
    "payer_address_line_1": { S: payerAddressLine1 },
    "payer_address_line_2": { S: payerAddressLine2 },
    "payer_address_admin_area_1": { S: payerAddressAdminArea1 },
    "payer_address_admin_area_2": { S: payerAddressAdminArea2 },
    "payer_country_code": { S: payerCountryCode },
    "payer_create_time": { S: createTime },
    "payer_update_time": { S: updateTime },
    "payer_checkout_href": { S: payerCheckoutHref },
    // Delivery Info From Cookies
    /*
    "buyer_name": {S: Cookies.get('username')},
    "buyer_email": {S: Cookies.get('email')},
    "delivery_addr1": {S: Cookies.get('address1')},
    "delivery_addr2": {S: Cookies.get('address2')},
    */
  }
  
  putItemICO('ico_orders',record)
}

BuywithPaypal.propTypes = {
  title: PropTypes.string,
  body: PropTypes.string,
  endDate: PropTypes.string,
  startupPrice: PropTypes.string,
  fiat: PropTypes.string,
  minUnit: PropTypes.string,
  paypalClientId: PropTypes.string,
  issueAddr: PropTypes.string,
  open: PropTypes.bool,
};

function BuywithPaypal({ title, body, endDate, minUnit, startupPrice, fiat, paypalClientId, issueAddr, open}) {
  const navigate = useNavigate();
  const ref = useRef(null);

  const initialOptions = ({
      'client-id': paypalClientId,
      currency: fiat,
      intent: "capture",
  })
  
  // -------------------------Formik--------------------------

  const ICOInputSchema = Yup.object().shape({
    username: Yup.string()
      .min(2, 'Too Short!')
      .max(30, 'Too Long!')
      .required('Userame required'),
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),  
    amount: Yup.number()
      .min(1, 'The number must be >= 1')
      .required('Buy-in Amount required')
      .integer('Amount must be integer')
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      username: '',
      amount: '1',
    },
    validationSchema: ICOInputSchema,
    onSubmit: async (values) => {
      await new Promise((r) => setTimeout(r, 500));
      // console.log(JSON.stringify(values, null, 2));
      setFormUsername(values.username)
      setFormEmail(values.email)
      setFormAmount(values.amount)
      
      setTotalPayAmount((Math.round((values.amount*startupPrice*100))/100).toString())
      setShowPaypal(true);
      setShowForm(false);
      
    },
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps } = formik;
  
  // -------------------------State--------------------------
  const [formAmount, setFormAmount] = React.useState('');
  const [formUsername, setFormUsername] = React.useState('');
  const [formEmail, setFormEmail] = React.useState('');
  const [totalPayAmount, setTotalPayAmount] = React.useState('');
  const [showPaypal, setShowPaypal] = useState(false);
  const [showForm, setShowForm] = useState(true);

  return (
    
    <>
    <Container sx={{ mb: 5 }}>
      
      <FormikProvider innerRef={ref} value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              autoComplete="name"
              type="text"
              label="Name"
              {...getFieldProps('username')}
              error={Boolean(touched.username && errors.username)}
              helperText={touched.username && errors.username}
            />
            <TextField
              fullWidth
              autoComplete="email"
              type="email"
              label="Email address"
              {...getFieldProps('email')}
              error={Boolean(touched.email && errors.email)}
              helperText={touched.email && errors.email}
            />
            <TextField
              fullWidth
              type="number"
              label="Buy-in Amount"
              {...getFieldProps('amount')}
              error={Boolean(touched.amount && errors.amount)}
              helperText={touched.amount && errors.amount}
            />
            {showForm && 
            <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
              bUY-iN
            </LoadingButton>
            }
          </Stack>
        </Form>
      </FormikProvider>
      
    </Container>
    
    <Divider />
    {showPaypal && 
      <Typography variant="h4" sx={{ mb: 5 }}>
        Total Transfer Amount: {totalPayAmount}
      </Typography>
    }
    {showPaypal && 
    
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons 
        createOrder={(data, actions) => actions.order.create({
              purchase_units: [
                  {
                      amount: {
                          value: totalPayAmount,
                      },
                  },
              ],
          })}
        onApprove={(data, actions) => actions.order.capture().then((receiptDetails) => {
                console.log(receiptDetails)
                // console.log(ref.current.values)
                const name = receiptDetails.payer.name.given_name;
                console.log(`Transaction completed by ${name}`);
                processICO(receiptDetails, minUnit, startupPrice, paypalClientId, issueAddr, formUsername, formEmail, formAmount)
                // setShowPaypal(false);
                // setShowForm(true);
                
            })}
      />
    </PayPalScriptProvider>
    }
    </>
  )
}

export default BuywithPaypal;
