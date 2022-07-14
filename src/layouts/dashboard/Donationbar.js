import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
// material
import { styled, alpha } from '@mui/material/styles';
import { Input, Slide, Button, IconButton, InputAdornment, ClickAwayListener } from '@mui/material';
// component
import Iconify from '../../components/Iconify';
import DonateUSDT from '../../components/DonateUSDT';

// ----------------------------------------------------------------------

const APPBAR_MOBILE = 64;
const APPBAR_DESKTOP = 92;

const DonationbarStyle = styled('div')(({ theme }) => ({
  top: 0,
  left: 0,
  zIndex: 99,
  width: '100%',
  display: 'flex',
  position: 'absolute',
  alignItems: 'center',
  height: APPBAR_MOBILE,
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)', // Fix on Mobile
  padding: theme.spacing(0, 3),
  boxShadow: theme.customShadows.z8,
  backgroundColor: `${alpha(theme.palette.background.default, 0.72)}`,
  [theme.breakpoints.up('md')]: {
    height: APPBAR_DESKTOP,
    padding: theme.spacing(0, 5),
  },
}));

// ----------------------------------------------------------------------

Donationbar.propTypes = {
  langPack: PropTypes.object
};

export default function Donationbar({langPack}) {
  const [isBarOpen, setBarOpen] = useState(false);
  const [value, setValue] = useState('0');
  const [chainId, setChainId] = useState('UNKNOWN');
  const [chainName, setChainName] = useState('UNKNOWN');
  const [usdtContractAddr, setUsdtContractAddr] = useState('0xdAC17F958D2ee523a2206206994597C13D831ec7');
  const [reveiverAddr, setReveiverAddr] = useState('0x9B40d31fdc6Ef74D999AFDdeF151f8E864391cfF');
  const [isWalletFound, setWalletFound] = useState(false);

  const handleBarOpen = () => {
    setBarOpen((prev) => !prev);
  };

  const handleClose = () => {
    setBarOpen(false);
  };


  useEffect(() => { 
    if (window.ethereum) {
      setWalletFound(true)
      setChainId(window.ethereum.chainId)
      /*
      switch (window.ethereum.chainId) {
        case '0x1':
          setUsdtContractAddr('0xdAC17F958D2ee523a2206206994597C13D831ec7')
          setReveiverAddr('0x9B40d31fdc6Ef74D999AFDdeF151f8E864391cfF')
          setChainName('Ethereum Mainnet')
          break;
        case '0x4':
          setUsdtContractAddr('0xD9BA894E0097f8cC2BBc9D24D308b98e36dc6D02')
          setReveiverAddr('0x7104F1aDf1224611b7c3831BfeEe591e42e48858')
          setChainName('Rinkeby')
          break;
        default:
          setUsdtContractAddr('0xdAC17F958D2ee523a2206206994597C13D831ec7')
          setReveiverAddr('0x9B40d31fdc6Ef74D999AFDdeF151f8E864391cfF')
          setChainName('Ethereum Mainnet')
      }
      */
      setUsdtContractAddr('0xdAC17F958D2ee523a2206206994597C13D831ec7')
      setReveiverAddr('0x9B40d31fdc6Ef74D999AFDdeF151f8E864391cfF')
      setChainName('Ethereum Mainnet')
    } 
  })

  return (
    
    <ClickAwayListener onClickAway={handleClose}>
      <div>
        {!isBarOpen && (
          <IconButton onClick={handleBarOpen}>
            <Iconify icon="bx:donate-heart" width={20} height={20} />
          </IconButton>
        )}

        <Slide direction="down" in={isBarOpen} mountOnEnter unmountOnExit>
          
          <DonationbarStyle>
            {isWalletFound && (
            <>
            <Input
              id='donate'
              autoFocus
              fullWidth
              disableUnderline
              placeholder={langPack.donationbar_caption}
              startAdornment={
                <InputAdornment position="start">
                  <Iconify icon="eva:bx:donate-heart" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
                </InputAdornment>
              }
              type='number'
              onChange={(e) => {
                setValue(e.target.value.toString());
              }}
              sx={{ mr: 1, fontWeight: 'fontWeightBold' }}
            />
            
            <DonateUSDT amountTransfer={value}
            toAddr={reveiverAddr}
            contractAddr={usdtContractAddr}
            chain={chainName}
            currencyName='Tether' 
            langPack={langPack} />
            </>
            )}
            { /* Else */ }
            {!isWalletFound && (
              <Input
              id='notEnable'
              disabled
              autoFocus
              fullWidth
              disableUnderline
              placeholder={langPack.donationbar_noWallet}
              startAdornment={
                <InputAdornment position="start">
                  <Iconify icon="eva:bx:donate-heart" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
                </InputAdornment>
              }
              type='number'
              sx={{ mr: 1, fontWeight: 'fontWeightBold' }}
            />
            )}
            
          </DonationbarStyle>
        </Slide>
      </div>
    </ClickAwayListener>
  );
}
