import { Link as RouterLink } from 'react-router-dom';
// material
import { styled } from '@mui/material/styles';
import { Box, Card, Link, Container, Typography } from '@mui/material';
// layouts
// import AuthLayout from '../layouts/AuthLayout';
// components
import Page from '../components/Page';
// import { MHidden } from '../components/@material-extend';
import CreateTokenForm from '../components/CreateTokenForm';
// import AuthSocial from '../components/authentication/AuthSocial';

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  }
}));

const SectionStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 464,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: theme.spacing(2, 0, 2, 2)
}));

const ContentStyle = styled('div')(({ theme }) => ({
  margin: 'auto',
  display: 'flex',
  // minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'center',
  // padding: theme.spacing(4, 0)
  pt: 32
}));

// ----------------------------------------------------------------------

export default function CreateToken() {
  return (
    <RootStyle title="Create Token">
      <Container>
        <ContentStyle>
            <Box sx={{ mb: 5 }} >
              <Typography variant="h4" gutterBottom>
                Create a tradable TOKEN on blockchain
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>In ERC777 standard</Typography>
            </Box>

            <CreateTokenForm />
        </ContentStyle>
      </Container>
    </RootStyle>
  );
}
