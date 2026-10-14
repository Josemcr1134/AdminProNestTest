import CategoryIcon from '@mui/icons-material/Category';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import LogoutIcon from '@mui/icons-material/Logout';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { NavLink, Outlet } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import PeopleIcon from '@mui/icons-material/People';

const DRAWER_WIDTH = 200;

const links = [
  { to: '/', label: 'Dashboard', icon: <DashboardIcon /> },
  { to: '/products', label: 'Productos', icon: <InventoryIcon /> },
  { to: '/categories', label: 'Categorias', icon: <CategoryIcon /> },
  { to: '/users', label: 'Usuarios', icon: <PeopleIcon /> , roles: ['ADMIN'] }
];

export function AppLayout() {

  const { user, logout } = useAuth();
  const availablesLinks = links.filter((l) => !l.roles || l.roles.includes(user!.role));

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position='fixed' sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant='h6' sx={{ flexGrow: 1 }}>
            AdminPro
          </Typography>
          <Typography variant="body2" sx={{ mr: 1 }}>
            {user?.name} - {user?.role}
          </Typography>
          <Tooltip title="Cerrar sesión">
            <IconButton color="inherit" onClick={logout}>
              <LogoutIcon></LogoutIcon>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{ width: DRAWER_WIDTH, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
      >
        <Toolbar />
        <List>
          {availablesLinks.map((link) => (
            <ListItemButton key={link.to} component={NavLink} to={link.to} end={link.to === '/'}>
              <ListItemIcon>{link.icon}</ListItemIcon>
              <ListItemText primary={link.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet/>
      </Box>
    </Box>
  )
}
