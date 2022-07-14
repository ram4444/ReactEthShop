import React, { useState } from 'react';
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

import { zhHK, en } from './translate';

// ----------------------------------------------------------------------


export default function Router() {
  const [langPack, setLangPack] = useState(en)

  const handleLangChange = (lang) => {
    switch (lang) {
      case 'zhHK':
        setLangPack(zhHK);
        break;
      case 'en':
        setLangPack(en);
        break;
      default:
        setLangPack(en);
    }
  };
  
  return useRoutes([
    {
      path: '/list',
      element: <DashboardLayout onChangeLang={handleLangChange} langPack={langPack}/>,
      children: [
        { path: 'user', element: <User /> },
        { path: 'products', element: <Products langPack={langPack}/> },
        { path: 'blog', element: <Blog langPack={langPack}/> },
        { path: 'articles', element: <Articles langPack={langPack}/> },
        { path: 'artistsparties', element: <Parties langPack={langPack}/> },
        { path: 'artist', element: <PartiesHome langPack={langPack}/> },
        { path: 'party', element: <PartiesHome langPack={langPack}/> },
        
      ],
    },
    {
      path: '/form',
      element: <DashboardLayout onChangeLang={handleLangChange} langPack={langPack}/>,
      children: [
        { path: 'createtoken', element: <CreateToken /> },
        { path: 'currentUserInfo', element: <CurrentUserInfo langPack={langPack}/> },
      ],
    },
    {
      path: '/dashboard',
      element: <DashboardLayout onChangeLang={handleLangChange} langPack={langPack}/>,
      children: [
        { path: 'app', element: <DashboardApp /> },
        { path: 'home', element: <HomeApp langPack={langPack}/> },
        { path: 'seller', element: <SellerDashboardApp langPack={langPack}/> },
        { path: 'buyer', element: <BuyererDashboardApp langPack={langPack}/> },
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
