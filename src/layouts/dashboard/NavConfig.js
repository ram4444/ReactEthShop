// component
import Iconify from '../../components/Iconify';

// ----------------------------------------------------------------------

const getIcon = (name) => <Iconify icon={name} width={22} height={22} />;

const navConfig = [
  {
    title: 'home',
    path: '/list/blog',
    icon: getIcon('eva:file-text-fill'),
  },
  {
    title: 'product',
    path: '/list/products',
    icon: getIcon('eva:shopping-bag-fill'),
  },
  {
    title: 'create token',
    path: '/list/createtoken',
    icon: getIcon('eva:stop-circle-fill')
  }
  
];

export default navConfig;
