import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
//
import Articles from './pages/Articles';
import Blog from './pages/Blog';
import User from './pages/User';
import Login from './pages/Login';
import NotFound from './pages/Page404';
import Register from './pages/Register';
import Products from './pages/Products';
import Parties from './pages/Parties';
import PartiesHome from './pages/PartiesHome';
import DashboardApp from './pages/DashboardApp';
import HomeApp from './pages/Home';
import SellerDashboardApp from './pages/SellerDashboardApp';
import BuyererDashboardApp from './pages/BuyerDashboardApp';
import CreateToken from './pages/CreateToken';
import CurrentUserInfo from './pages/CurrentUserInfo';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: '/list',
      element: <DashboardLayout />,
      children: [
        { path: 'user', element: <User /> },
        { path: 'products', element: <Products /> },
        { path: 'blog', element: <Blog /> },
        { path: 'articles', element: <Articles /> },
        { path: 'artists', element: <Articles /> },
        { path: 'artist', element: <PartiesHome /> },
        { path: 'party', element: <PartiesHome /> },
        
      ],
    },
    {
      path: '/form',
      element: <DashboardLayout />,
      children: [
        { path: 'createtoken', element: <CreateToken /> },
        { path: 'currentUserInfo', element: <CurrentUserInfo /> },
      ],
    },
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        { path: 'app', element: <DashboardApp /> },
        { path: 'home', element: <HomeApp /> },
        { path: 'seller', element: <SellerDashboardApp /> },
        { path: 'buyer', element: <BuyererDashboardApp /> },
      ],
    },
    {
      path: '/',
      element: <LogoOnlyLayout />,
      children: [
        { path: '/', element: <Navigate to="/dashboard/home" /> },
        { path: 'login', element: <Login /> },
        { path: 'register', element: <Register /> },
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
