import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
// material
import { styled } from '@mui/material/styles';
//
import DashboardNavbar from './DashboardNavbar';
import DashboardSidebar from './DashboardSidebar';

// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const RootStyle = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden'
});

const MainStyle = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('lg')]: {
    paddingTop: APP_BAR_DESKTOP + 24,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  }
}));

// ----------------------------------------------------------------------
DashboardLayout.propTypes = {
  onChangeLang: PropTypes.func,
  langPack: PropTypes.object
};

export default function DashboardLayout({onChangeLang, langPack}) {
  const [open, setOpen] = useState(false);



  return (
    <RootStyle>
      <DashboardNavbar onOpenSidebar={() => setOpen(true)} onChangeLang={onChangeLang} langPack={langPack}/>
      <DashboardSidebar isOpenSidebar={open} onCloseSidebar={() => setOpen(false)} langPack={langPack} />
      <MainStyle>
        <Outlet />
      </MainStyle>
    </RootStyle>
  );
}
