import PropTypes from 'prop-types';
// component
import Iconify from '../../components/Iconify';

// ----------------------------------------------------------------------

const getIcon = (name) => <Iconify icon={name} width={22} height={22} />;


const navConfig = (langPack) => [
  {
    title: langPack.navSide_Home,
    path: '/dashboard/home',
    icon: getIcon('eva:file-text-fill'),
  },
  {
    title: langPack.navSide_Products,
    path: '/list/products',
    icon: getIcon('eva:shopping-bag-fill'),
  },
  {
    title: langPack.navSide_Artists,
    path: '/list/artistsparties',
    icon: getIcon('fa6-solid:hat-wizard'),
  },
  {
    title: langPack.navSide_Articles,
    path: '/list/articles',
    icon: getIcon('material-symbols:article-outline'),
  },
  /*
  {
    title: langPack.navSide_CreateToken,
    path: '/form/createtoken',
    icon: getIcon('eva:stop-circle-fill')
  },
  */
  {
    title: langPack.navSide_BuyerDashBoard,
    path: '/dashboard/buyer',
    icon: getIcon('akar-icons:shipping-box-01')
  },
  {
    title: langPack.navSide_SellerDashBoard,
    path: '/dashboard/seller',
    icon: getIcon('eva:car-fill')
  }
  
];

export default navConfig;
