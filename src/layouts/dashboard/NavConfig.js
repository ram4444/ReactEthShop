// component
import Iconify from '../../components/Iconify';

// ----------------------------------------------------------------------

const getIcon = (name) => <Iconify icon={name} width={22} height={22} />;

const navConfig = [
  {
    title: 'home',
    path: '/list/articles',
    icon: getIcon('eva:file-text-fill'),
  },
  {
    title: 'product',
    path: '/list/products',
    icon: getIcon('eva:shopping-bag-fill'),
  },
  {
    title: 'create token',
    path: '/form/createtoken',
    icon: getIcon('eva:stop-circle-fill')
  },
  {
    title: 'Seller Dashboard',
    path: '/dashboard/seller',
    icon: getIcon('eva:car-fill')
  }
  
];

export default navConfig;
