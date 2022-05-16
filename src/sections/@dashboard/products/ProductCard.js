import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
// material
import { Box, Card, Link, Typography, Stack, Modal, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
// utils
import { fCurrency } from '../../../utils/formatNumber';
// components
import Label from '../../../components/Label';
import { ColorPreview } from '../../../components/color-utils';
import BuywithCrypto from '../../../components/BuywithCrypto';

// ----------------------------------------------------------------------

const ProductImgStyle = styled('img')({
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
  maxHeight: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  borderRadius: '25px',
  overflow: "hidden",
  // overflowY: "scroll", // added scroll
  boxShadow: 24,
  p: 4,
};

// ----------------------------------------------------------------------

ShopProductCard.propTypes = {
  product: PropTypes.object,
};

export default function ShopProductCard({ product }) {
  const { name, cover, coverFilename, price, colors, status, priceSale, receiverAddr, currency, contractAddr, chain, dpshift, description } = product;
  // console.log(currency)

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // console.log(description)

  return (
    <Card>
      <Box sx={{ pt: '100%', position: 'relative' }}>
        {status && (
          <Label
            variant="filled"
            color={(status === 'sale' && 'error') || 'info'}
            sx={{
              zIndex: 9,
              top: 16,
              right: 16,
              position: 'absolute',
              textTransform: 'uppercase',
            }}
          >
            {status}
          </Label>
        )}
        <ProductImgStyle alt={name} src={cover} onClick={handleOpen}/>
        <div>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={ModalStyle}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                {name}
              </Typography>
              <Box height={300} display="flex" overflow="auto" overflowY="scroll">
                <div dangerouslySetInnerHTML={{ __html: description }} />
              </Box>
              <br/>
              <Divider />
              <BuywithCrypto amountTransfer={price} toAddr={receiverAddr} contractAddr={contractAddr} chain={chain} currencyName={currency} product={product} handleClosedModal={handleClose}/>
            </Box>
          </Modal>
        </div>
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Link to="#" color="inherit" underline="hover" component={RouterLink}>
          <Typography variant="subtitle2" noWrap>
            {name}
          </Typography>
        </Link>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <ColorPreview colors={colors} />
          <Typography variant="subtitle1">
            <Typography
              component="span"
              variant="body1"
              sx={{
                color: 'text.disabled',
                textDecoration: 'line-through',
              }}
            >
              {priceSale && fCurrency(priceSale)}
            </Typography>
            &nbsp;
            {fCurrency(price)}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
