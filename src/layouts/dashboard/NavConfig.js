// component
import Iconify from '../../components/Iconify';

// ----------------------------------------------------------------------

const getIcon = (name) => <Iconify icon={name} width={22} height={22} />;

const navConfig = [
  {
    title: 'home',
    path: '/dashboard/home',
    icon: getIcon('eva:file-text-fill'),
  },
  {
    title: 'products',
    path: '/list/products',
    icon: getIcon('eva:shopping-bag-fill'),
  },
  {
    title: 'artists',
    path: '/list/artistsparties',
    icon: getIcon('fa-solid:hat-wizard'),
  },
  {
    title: 'articles',
    path: '/list/articles',
    icon: getIcon('material-symbols:article-outline'),
  },
  {
    title: 'create token',
    path: '/form/createtoken',
    icon: getIcon('eva:stop-circle-fill')
  },
  {
    title: 'Buyer Dashboard',
    path: '/dashboard/buyer',
    icon: getIcon('akar-icons:shipping-box-01')
  },
  {
    title: 'Seller Dashboard',
    path: '/dashboard/seller',
    icon: getIcon('eva:car-fill')
  }
  
];

export default navConfig;
