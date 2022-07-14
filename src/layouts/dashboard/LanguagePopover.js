import { useRef, useState } from 'react';
import PropTypes from 'prop-types';

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

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = (lang) => {
    onChangeLang(lang)
    setOpen(false);
  };

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
        <img src={LANGS[0].icon} alt={LANGS[0].label} />
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
          {LANGS.map((option) => (
            <MenuItem key={option.value} selected={option.value === LANGS[0].value} onClick={() => handleClose(option.value)}>
              <Box component="img" alt={option.label} src={option.icon} sx={{ width: 28, mr: 2 }} />

              {option.label}
            </MenuItem>
          ))}
        </Stack>
      </MenuPopover>
    </>
  );
}
