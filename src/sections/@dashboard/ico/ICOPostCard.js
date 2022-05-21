import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
// material
import { alpha, styled } from '@mui/material/styles';
import { Box, Link, Card, Grid, Avatar, Typography, CardContent, Modal, Item } from '@mui/material';
// utils
import { fDate } from '../../../utils/formatTime';
import { fShortenNumber } from '../../../utils/formatNumber';
//
import SvgIconStyle from '../../../components/SvgIconStyle';
import Iconify from '../../../components/Iconify';
import BuywithPaypal from '../../../components/BuywithPaypal';


// ----------------------------------------------------------------------

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
  height: 800,
  maxHeight: 800,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  borderRadius: '25px',
  overflow: "hidden",
  overflowY: "scroll", // added scroll
  boxShadow: 24,
  p: 4,
};

// ----------------------------------------------------------------------

ICOPostCard.propTypes = {
  post: PropTypes.object.isRequired,
  index: PropTypes.number,
};

export default function ICOPostCard({ post, index }) {
  const { id, cover, title, summary, body, endDate, minUnit, startupPrice, fiat, paypalClientId, issueAddr, openStatus, createdAt, author } = post;
  
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  const latestPostLarge = index === 0;
  const latestPost = index === 1 || index === 2;
  
  // console.log(post.body)
  return (
    <Grid item xs={12} sm={12} md={9}>
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
                // bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
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
            onClick={handleOpen}
          >
            Coin Name: {title}
            
          </TitleStyle>
          
          <div>
            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={ModalStyle}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                {title}
                </Typography>
                <div dangerouslySetInnerHTML={{ __html: body }} height={200} />
                <Box>
                <BuywithPaypal
                  title={title}
                  body={body}
                  endDate={endDate}
                  startupPrice={startupPrice}
                  fiat={fiat}
                  minUnit={minUnit}
                  paypalClientId={paypalClientId}
                  issueAddr={issueAddr}
                  open={open}
                />
                </Box>
              </Box>


            </Modal>
          </div>
          

          <InfoStyle>
            
            
              <Box
                key={index}
                width='75%'
                sx={{
                  display: 'flex',
                  alignItems: 'right',
                  ml: index === 0 ? 0 : 1.5,
                  ...((latestPostLarge || latestPost) && {
                    color: 'grey.500',
                  }),
                }}
              >
                <Grid container spacing={1} >
                  <Grid container item xs={4} justifyContent='flex-end'>
                  <Iconify icon='eva:calendar-fill' sx={{ width: 16, height: 16, mr: 0.5 }} />
                  <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }} >
                      End: {fDate(endDate)}
                  </Typography>
                  </Grid>
                  <Grid container item xs={4} justifyContent='flex-end'>
                  <Iconify icon='bx:coin' sx={{ width: 16, height: 16, mr: 0.5 }} />
                  <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }} >
                      Min. Buy-in unit: {minUnit}
                  </Typography>
                  </Grid>
                  <Grid container item xs={4} justifyContent='flex-end'>
                  <Iconify icon='bi:cash-coin' sx={{ width: 16, height: 16, mr: 0.5 }} />
                  <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }} >
                      Price per unit: {startupPrice}
                  </Typography>
                  </Grid>
                </Grid>
              </Box>
            
              
          </InfoStyle>
          
        </CardContent>
      </Card>
    </Grid>
  );
}
