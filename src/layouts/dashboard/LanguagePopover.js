import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
// material
import { alpha } from '@mui/material/styles';
import { Box, MenuItem, Stack, IconButton } from '@mui/material';
// components
import MenuPopover from '../../components/MenuPopover';

// ----------------------------------------------------------------------

const LANGS = [
  {
    value: 'en',
    label: 'English',
    icon: '/static/icons/ic_flag_en.svg',
  },
  {
    value: 'zhHK',
    label: 'Trad. Chinese',
    icon: '/static/icons/ic_flag_hk.svg',
  },
  /*
  {
    value: 'cn',
    label: 'Simp. Chinese',
    icon: '/static/icons/ic_flag_cn.svg',
  },
  {
    value: 'jp',
    label: 'Japanese',
    icon: '/static/icons/ic_flag_jp.svg',
  },
  {
    value: 'de',
    label: 'German',
    icon: '/static/icons/ic_flag_de.svg',
  },
  {
    value: 'fr',
    label: 'French',
    icon: '/static/icons/ic_flag_fr.svg',
  },
  {
    value: 'sp',
    label: 'Spainish',
    icon: '/static/icons/ic_flag_sp.svg',
  },
  */
];

// ----------------------------------------------------------------------
LanguagePopover.propTypes = {
  onChangeLang: PropTypes.func,
};

export default function LanguagePopover({ onChangeLang }) {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(0);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = (lang, index) => {
    console.log(index)
    if (index !== 'backdropClick') {
      onChangeLang(lang)
      setCurrentLang(index)
      Cookies.set('langIndex',index, { expires: 365 });
    }
    setOpen(false);
    
  };

  useEffect(() => {
    if (Cookies.get('langIndex')) {
      const i = Cookies.get('langIndex')
      setCurrentLang(i)
      onChangeLang(LANGS[i].value)
  }})
  
  

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          padding: 0,
          width: 44,
          height: 44,
          ...(open && {
            bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.focusOpacity),
          }),
        }}
      >
        <img src={LANGS[currentLang].icon} alt={LANGS[currentLang].label} />
      </IconButton>

      <MenuPopover
        open={open}
        onClose={handleClose}
        anchorEl={anchorRef.current}
        sx={{
          mt: 1.5,
          ml: 0.75,
          width: 180,
          '& .MuiMenuItem-root': { px: 1, typography: 'body2', borderRadius: 0.75 },
        }}
      >
        <Stack spacing={0.75}>
          {LANGS.map((option, index) => (
            <MenuItem key={option.value} selected={option.value === LANGS[currentLang].value} onClick={() => handleClose(option.value, index)}>
              <Box component="img" alt={option.label} src={option.icon} sx={{ width: 28, mr: 2 }} />

              {option.label}
            </MenuItem>
          ))}
        </Stack>
      </MenuPopover>
    </>
  );
}
