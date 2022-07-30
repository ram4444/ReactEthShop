/* eslint-disable camelcase */
import Web3 from 'web3';
import PropTypes from 'prop-types';
import { set, sub } from 'date-fns';
import { noCase } from 'change-case';
import { faker } from '@faker-js/faker';
import { useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import {uuid} from 'uuidv4'
// @mui
import {
  Box,
  List,
  Badge,
  Button,
  Avatar,
  Tooltip,
  Divider,
  Typography,
  IconButton,
  ListItemText,
  ListSubheader,
  ListItemAvatar,
  ListItemButton,
} from '@mui/material';
// utils
import { fToNow } from '../../utils/formatTime';
import { queryNotificationByAddr,queryNotificationReadByAddr, putItemNotificationRead  } from '../../utils/awsClient'
// components
import Iconify from '../../components/Iconify';
import Scrollbar from '../../components/Scrollbar';
import MenuPopover from '../../components/MenuPopover';

// ----------------------------------------------------------------------

const NOTIFICATIONS = [
  {
    id: faker.datatype.uuid(),
    title: 'Your order is placed',
    description: 'waiting for shipping',
    avatar: null,
    type: 'order_placed',
    createdAt: set(new Date(), { hours: 10, minutes: 30 }),
    isUnRead: true,
  },
  {
    id: faker.datatype.uuid(),
    title: faker.name.findName(),
    description: 'answered to your comment on the Minimal',
    avatar: '/static/mock-images/avatars/avatar_2.jpg',
    type: 'friend_interactive',
    createdAt: sub(new Date(), { hours: 3, minutes: 30 }),
    isUnRead: true,
  },
  {
    id: faker.datatype.uuid(),
    title: 'You have new message',
    description: '5 unread messages',
    avatar: null,
    type: 'chat_message',
    createdAt: sub(new Date(), { days: 1, hours: 3, minutes: 30 }),
    isUnRead: false,
  },
  {
    id: faker.datatype.uuid(),
    title: 'You have new mail',
    description: 'sent from Guido Padberg',
    avatar: null,
    type: 'mail',
    createdAt: sub(new Date(), { days: 2, hours: 3, minutes: 30 }),
    isUnRead: false,
  },
  {
    id: faker.datatype.uuid(),
    title: 'Delivery processing',
    description: 'Your order is being shipped',
    avatar: null,
    type: 'order_shipped',
    createdAt: sub(new Date(), { days: 3, hours: 3, minutes: 30 }),
    isUnRead: false,
  },
];

const App = new Web3()
let web3

NotificationsPopover.propTypes = {
  langPack: PropTypes.object
};

export default function NotificationsPopover({langPack}) {
  const anchorRef = useRef(null);

  const [isWalletFound, setWalletFound] = useState(false);
  const [currentWalletAddr, setCurrentWalletAddr] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notificationsRead, setNotificationsRead] = useState([]);
  

  const totalUnRead = notifications.filter((item) => item.isUnRead === true).length;

  const [open, setOpen] = useState(null);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleMarkAllAsRead = () => {
    notifications.map((notification) => {
      const recordMsgRead=
      { 
        "id": { S: notification.id },
        "userAddr": { S: notification.userAddr},
        "related_id": { S: notification.related_id },
        "createdAt": {S: new Date()}
      }
      putItemNotificationRead(recordMsgRead)
      return null
    })
    console.log('Mark all as read send to DB')
    // queryDyDbNotificationRead(currentWalletAddr)
    // queryDyDbNotification(currentWalletAddr)
    
    
    const acc = window.ethereum.request({ method: 'eth_requestAccounts' });
    acc.then((result) => {
      usr= result[0]
      console.log(usr)
    }).then(async ()=> {
      await queryDyDbNotificationRead(usr)
      await queryDyDbNotification(usr)
      
    })
    

    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        isUnRead: false,
      }))
    );

    
    
  };
  
  let qNoti=[];
  let qNotiRead=[];
  let usr;

  async function init() {
    console.log('init')
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        
        // Depricatd soon 
        // await window.ethereum.enable();
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        setWalletFound(true)
        const acc = window.ethereum.request({ method: 'eth_requestAccounts' });
        acc.then((result) => {
          usr= result[0]
          console.log(usr)
        }).then(async ()=> {
          setCurrentWalletAddr(usr)
        })
        console.log('Wallet found')
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    } else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
      setWalletFound(true)
      console.log('Wallet found [Legacy]')
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      console.error('web3 was undefined');
      setWalletFound(false)
    }
    web3 = new Web3(App.web3Provider);
    
    const acc = window.ethereum.request({ method: 'eth_requestAccounts' });
    acc.then((result) => {
      usr= result[0]
      console.log(usr)
    }).then(async ()=> {
      await queryDyDbNotificationRead(usr)
      await queryDyDbNotification(usr)
      
    })
  }
  
    

  function queryDyDbNotification(addr) {
    queryNotificationByAddr(addr).then((queryResult) => {
      console.log('Query the DB for notification: done')
      qNoti=queryResult.Items.map((msg)=> ({
          id: msg.id.S,
          title: msg.title.S,
          description: msg.description.S,
          avatar: null,
          type: msg.type.S,
          createdAt: msg.createdAt.S,
          userAddr: msg.userAddr.S,
          isUnRead: !qNotiRead.includes(msg.id.S), // False=ReadED
          related_id: msg.related_id.S,
        }))
        qNoti.sort((a, b) => a.createdAt.localeCompare(b.createdAt)).reverse();
        const slicedArray = qNoti.slice(0, 5);
        console.log(slicedArray)
      setNotifications(slicedArray)
    })
  }

  function queryDyDbNotificationRead(addr) {
    queryNotificationReadByAddr(addr).then((queryResult) => {
      console.log('Query the DB for notification read: done')
      qNotiRead=queryResult.Items.map((msg)=> (
        msg.id.S
      ))
      setNotificationsRead(qNotiRead)
    })
  }

  useEffect(()=> {
    console.log('useEffect')
    init()
  }, []);

  return (
    <>
      <IconButton
        ref={anchorRef}
        color={open ? 'primary' : 'default'}
        onClick={handleOpen}
        sx={{ width: 40, height: 40 }}
      >
        <Badge badgeContent={totalUnRead} color="error">
          <Iconify icon="eva:bell-fill" width={20} height={20} />
        </Badge>
      </IconButton>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{ width: 360, p: 0, mt: 1.5, ml: 0.75 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">{langPack.notification_barTitle}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {langPack.notification_unread1} {totalUnRead} {langPack.notification_unread2}
            </Typography>
          </Box>

          {totalUnRead > 0 && (
            <Tooltip title=" Mark all as read">
              <IconButton color="primary" onClick={handleMarkAllAsRead}>
                <Iconify icon="eva:done-all-fill" width={20} height={20} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar sx={{ height: { xs: 340, sm: 'auto' } }}>
          <List
            disablePadding
            subheader={
              <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                {langPack.notification_barNew}
              </ListSubheader>
            }
          >
            {notifications.slice(0, 2).map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </List>

          <List
            disablePadding
            subheader={
              <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                {langPack.notification_barB4}
              </ListSubheader>
            }
          >
            {notifications.slice(2, 5).map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </List>
        </Scrollbar>
        
        {/*
        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth disableRipple>
          {langPack.notification_barViewAll}
          </Button>
        </Box>
            */}
      </MenuPopover>
    </>
  );
}

// ----------------------------------------------------------------------

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    createdAt: PropTypes.string,
    id: PropTypes.string,
    isUnRead: PropTypes.bool,
    title: PropTypes.string,
    description: PropTypes.string,
    type: PropTypes.string,
    avatar: PropTypes.any,
    userAddr: PropTypes.string,
    related_id: PropTypes.string
  }),
};



function NotificationItem({ notification }) {
  const { avatar, title } = renderContent(notification);
  const navigate = useNavigate();

  async function readNotification(notification) {
    // const uidRead=uuid()
    const recordMsgRead=
    { 
      "id": { S: notification.id },
      "userAddr": { S: notification.userAddr},
      "related_id": { S: notification.related_id },
      "createdAt": {S: new Date()}
    }
    
    let route;
    switch (notification.type) {
      case 'order_place':
        route = '/dashboard/buyer';
        break;
      case 'order_received':
        route = '/dashboard/seller';
        break;
      default:
        route = '/dashboard/home';
    }

    await putItemNotificationRead(recordMsgRead)
    notification.isUnRead=false

    navigate(route, { replace: true });
  }

  return (
    <ListItemButton
      onClick= {()=> {
        readNotification(notification);
        
        }
      }
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(notification.isUnRead && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.neutral' }}>{avatar}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              display: 'flex',
              alignItems: 'center',
              color: 'text.disabled',
            }}
          >
            <>
              <Iconify icon="eva:clock-outline" sx={{ mr: 0.5, width: 16, height: 16 }} />
              {fToNow(notification.createdAt)}
            </>
          </Typography>
        }
      />
    </ListItemButton>
  );
}

// ----------------------------------------------------------------------

function renderContent(notification) {
  const title = (
    <Typography variant="subtitle2">
      {notification.title}
      <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
        &nbsp; {noCase(notification.description)}
      </Typography>
    </Typography>
  );

  if (notification.type === 'order_place') {
    return {
      avatar: <img alt={notification.title} src="/static/icons/ic_notification_package.svg" />,
      title,
    };
  }
  if (notification.type === 'order_received') {
    return {
      avatar: <img alt={notification.title} src="/static/icons/ic_notification_package.svg" />,
      title,
    };
  }

  if (notification.type === 'ico_place') {
    return {
      avatar: <img alt={notification.title} src="/static/icons/ic_notification_package.svg" />,
      title,
    };
  }
  if (notification.type === 'ico_received') {
    return {
      avatar: <img alt={notification.title} src="/static/icons/ic_notification_package.svg" />,
      title,
    };
  }

  if (notification.type === 'order_shipped') {
    return {
      avatar: <img alt={notification.title} src="/static/icons/ic_notification_shipping.svg" />,
      title,
    };
  }
  if (notification.type === 'mail') {
    return {
      avatar: <img alt={notification.title} src="/static/icons/ic_notification_mail.svg" />,
      title,
    };
  }
  if (notification.type === 'chat_message') {
    return {
      avatar: <img alt={notification.title} src="/static/icons/ic_notification_chat.svg" />,
      title,
    };
  }
  return {
    avatar: notification.avatar ? <img alt={notification.title} src={notification.avatar} /> : null,
    title,
  };
}
