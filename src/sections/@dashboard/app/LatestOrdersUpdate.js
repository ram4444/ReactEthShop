import React, { useState } from 'react';
// @mui
import PropTypes from 'prop-types';
import { Box, Stack, Link, Card, Button, Divider, Typography, CardHeader, Modal } from '@mui/material';
// utils
import { fToNow } from '../../../utils/formatTime';
// components
import Iconify from '../../../components/Iconify';
import Scrollbar from '../../../components/Scrollbar';

// ----------------------------------------------------------------------

const ModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  maxHeight: 640,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  borderRadius: '25px',
  overflowY: "scroll", // added scroll
  boxShadow: 24,
  p: 4,
};

LatestOrdersUpdate.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  list: PropTypes.array.isRequired,
};

export default function LatestOrdersUpdate({ title, subheader, list, ...other }) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Scrollbar>
        <Stack spacing={3} sx={{ p: 3, pr: 0 }}>
          {list.map((orders) => (
            <OrdersItem key={orders.id} orders={orders} />
          ))}
        </Stack>
      </Scrollbar>

      <Divider />

      <Box sx={{ p: 2, textAlign: 'right' }}>
        <Button size="small" color="inherit" endIcon={<Iconify icon={'eva:arrow-ios-forward-fill'} />}>
          View all
        </Button>
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

OrdersItem.propTypes = {
  orders: PropTypes.shape({
    buyerName: PropTypes.string,
    buyerEmail: PropTypes.string,
    buyerAddr1: PropTypes.string,
    buyerAddr2: PropTypes.string,
    currency: PropTypes.string,
    price: PropTypes.string,
    chain: PropTypes.string,
    txHash: PropTypes.string,
    image: PropTypes.string,
    postedAt: PropTypes.instanceOf(Date),
    title: PropTypes.string,
  }),
};

function OrdersItem({ orders }) {
  const { image, title, buyerName, buyerEmail, buyerAddr1, buyerAddr2, currency, price, chain, txHash, postedAt } = orders;

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  async function openURL(chain, txHash) {
    const url = ''
    const urlNormal= url.concat('etherscan.io/tx/',txHash);
    let urlFinal = ''
    switch (chain) {
      case 'Mainnet':
        urlFinal=urlNormal
        break;
      case 'Ropsten':
        urlFinal= chain.toLowerCase().concat('.',urlNormal)
        break;
      case 'Rinkeby':
        urlFinal= chain.toLowerCase().concat('.',urlNormal)
        break;
      case 'Goerli':
        urlFinal= chain.toLowerCase().concat('.',urlNormal)
        break;
      default:
        urlFinal= chain.toLowerCase().concat('.',urlNormal)
    }

    console.log(urlFinal)
    window.open('http://'.concat(urlFinal), "_blank")
  }

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box component="img" alt={title} src={image} sx={{ width: 48, height: 48, borderRadius: 1.5, flexShrink: 0 }} />

      <Box sx={{ minWidth: 120, flexGrow: 1 }} onClick={handleOpen}>
        <Link color="inherit" variant="subtitle2" noWrap>
          {title}
        </Link>

        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
          {buyerName}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
          {buyerEmail}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
          {buyerAddr1}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
          {buyerAddr2}
        </Typography>
      </Box>

      <div>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={ModalStyle}>
            <Stack direction="row" spacing={2}>
              <Typography id="modal-modal-title" variant="h6" component="h2" width='50%'>
              {title}
              </Typography>
              <Typography align='right' width='50%'>
                <Link id="modal-modal-etherscan" variant="caption" component="h2" sx={{ flexShrink: 0, color: 'text.secondary', align:'right'}} 
                  onClick={() => {
                    openURL(chain,txHash)
                    }}>
                  Check on Etherscan
                </Link>
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Typography id="modal-modal-currency" variant="body1" component="div">
                Traded in: {currency}
              </Typography>
              <Typography id="modal-modal-price" variant="body1" component="div">
                Pirce: {price}
              </Typography>
            </Stack>
            <Box component="img" alt={title} src={image} sx={{ width: 400, borderRadius: 1.5, flexShrink: 0 }} />
            <Typography id="modal-modal-description" variant="subtitle1" component="div">
            Deilver to: 
            </Typography>
            <Typography id="modal-modal-address" variant="body1" component="div">
            {buyerAddr1} 
            {buyerAddr2}
            </Typography>
            
          </Box>
        </Modal>
      </div>

      <Typography variant="caption" sx={{ pr: 3, flexShrink: 0, color: 'text.secondary' }}>
        {fToNow(postedAt)}
      </Typography>
    </Stack>
  );
}
