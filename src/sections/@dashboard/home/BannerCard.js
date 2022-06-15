import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
// material
import { alpha, styled } from '@mui/material/styles';
import { Box, Link, Card, Grid, Avatar, Typography, CardContent, Modal } from '@mui/material';
// utils
import { fDate } from '../../../utils/formatTime';
import { fShortenNumber } from '../../../utils/formatNumber';
//
import SvgIconStyle from '../../../components/SvgIconStyle';
import Iconify from '../../../components/Iconify';


// ----------------------------------------------------------------------

const CardMediaStyle = styled('div')({
  position: 'relative',
  paddingTop: 'calc(100% * 3 / 4)',
});

const TitleStyle = styled('div')({
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


// ----------------------------------------------------------------------

BannerCard.propTypes = {
  banner: PropTypes.object.isRequired,
  // cover: PropTypes.string,
  // text: PropTypes.string,
};

export default function BannerCard({ banner}) {
  const cover = banner.pic
  const text = banner.text
  // console.log(post.body)
  return (
    <Grid item xs={12} md={12} lg={12}>
      <Card sx={{ position: 'relative' }}>
        <CardMediaStyle
          sx={{
            ...( {
              pt: 'calc(100% * 4 / 3)',
              '&:after': {
                top: '85%',
                content: "''",
                width: '100%',
                height: '15%',
                position: 'absolute',
                bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
              },
            }),
            ...({
              pt: {
                xs: 'calc(100% * 4 / 3)',
                sm: 'calc(100% * 3 / 4.66)',
              },
            }),
          }}
        >

          <CoverImgStyle alt='Alt' src={cover} />
        </CardMediaStyle>

        <CardContent
          sx={{
            pt: 4,
              bottom: 0,
              width: '100%',
              position: 'absolute',
          }}
        >

          <TitleStyle
            to="#"
            color="inherit"
            variant="subtitle2"
            // component={RouterLink}
            sx={{
              ...({ typography: { xs: 'h5', sm: 'h4', md: 'h3'}, height: {xs: 30, sm: 45, md: 60} }),
              ...({ justifyContent: 'center' }),
              ...({
                color: 'common.white',
              }),
            }}
          >
            {text}
          </TitleStyle>
          {/*
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
              </Box>
            </Modal>
          </div>
          */}
          
        </CardContent>
      </Card>
    </Grid>
  );
}
