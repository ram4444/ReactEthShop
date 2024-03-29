import { useState } from 'react';
import PropTypes from 'prop-types';
// material
import { Menu, Button, MenuItem, Typography } from '@mui/material';
// component
import Iconify from '../../../components/Iconify';

// ----------------------------------------------------------------------

ArticlesPostSort.propTypes = {
  applySort: PropTypes.func,
  langPack: PropTypes.object
};

export default function ArticlesPostSort({applySort, langPack}) {
  const [open, setOpen] = useState(null);
  const [currentSort, setCurrentSort] = useState('newest');

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const clickSort = (v) => {
    setCurrentSort(v)
    applySort(v)
    handleClose()
  }

  const SORT_BY_OPTIONS = [
    // { value: 'featured', label: 'Featured' },
    { value: 'newest', label: (langPack.articlesSort_byNewest) },
    { value: 'author', label: (langPack.articlesSort_byAuthor) },
    { value: 'author_desc', label: (langPack.articlesSort_byAuthorDesc) }
  ];

  return (
    <>
      <Button
        color="inherit"
        disableRipple
        onClick={handleOpen}
        endIcon={<Iconify icon={open ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} />}
      >
        {langPack.articlesSort_title}:&nbsp;
        <Typography component="span" variant="subtitle2" sx={{ color: 'text.secondary' }}>
          {currentSort}
        </Typography>
      </Button>
      <Menu
        keepMounted
        anchorEl={open}
        open={Boolean(open)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {SORT_BY_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === currentSort}
            onClick={async () => clickSort(option.value)}
            sx={{ typography: 'body2' }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
