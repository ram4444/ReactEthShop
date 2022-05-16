// @mui
import PropTypes from 'prop-types';
import { alpha, styled } from '@mui/material/styles';
import { Card, Typography } from '@mui/material';
import { orange } from '@mui/material/colors';
// utils
import { fShortenNumber } from '../../../utils/formatNumber';
// components
import Iconify from '../../../components/Iconify';


// ----------------------------------------------------------------------

const IconWrapperStyle = styled('div')(({ theme }) => ({
  margin: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
}));

const UserLogoImgStyle = styled('img')({
  margin: 'auto',
  resizeMode: "contain",
  // display: 'flex',
  width: '100%',
  height: '100%',
  maxWidth: '100px',
  maxHeight: '100px',
  objectFit: 'scale-down',
  alignItems: 'center',
  justifyContent: 'center',
  
  // position: 'absolute',
});

// ----------------------------------------------------------------------

UserWidget.propTypes = {
  title: PropTypes.string.isRequired,
  color: PropTypes.string,
  logoUrl: PropTypes.string,
  caption: PropTypes.string,
  sx: PropTypes.object,
  ctrlIndex: PropTypes.number,
};


  export default function UserWidget({ title, color = 'primary', logoUrl, caption, sx, ctrlIndex, ...other }) {
  return (
    <Card
      sx={{
        py: 5,
        boxShadow: 0,
        textAlign: 'center',
        color: (theme) => theme.palette[color].darker,
        bgcolor: orange[ctrlIndex],
        ...sx,
      }}
      {...other}
    >
      <IconWrapperStyle
        sx={{
          color: (theme) => theme.palette[color].dark,
          backgroundImage: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette[color].dark, 0)} 0%, ${alpha(
              theme.palette[color].dark,
              0.24
            )} 100%)`,
        }}
      >
        <UserLogoImgStyle alt='alt' src={logoUrl}/>
      </IconWrapperStyle>
      

      <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>
        {title}
      </Typography>

      <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>
        {caption}
      </Typography>
    </Card>
  );
}
