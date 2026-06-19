import React, { useState, useEffect } from 'react';
import {
  Menu,
  MenuItem,
  Divider,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../api/authConfig';

export const Login = () => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);

  const { instance, accounts } = useMsal();
  const activeAccount = accounts[0] ?? instance.getActiveAccount();

  const displayName = activeAccount
    ? activeAccount.name && activeAccount.name !== 'unknown'
      ? activeAccount.name
      : ((activeAccount.idTokenClaims as any)?.email ?? 'User')
    : null;

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget as unknown as HTMLElement);
  };
  const handleCloseMenu = () => setMenuAnchor(null);

  const handleRedirect = async () => {
    setLoading(true);
    instance
      .loginRedirect({ ...loginRequest, prompt: 'select_account' })
      .catch((error) => {
        console.error('loginRedirect() error:', error);
        setLoading(false);
      });
    handleCloseMenu();
  };

  const handleLogout = () => {
    setLoading(true);
    instance.logoutRedirect().catch((error) => {
      console.error('logoutRedirect error:', error);
      setLoading(false);
    });
    handleCloseMenu();
  };

  useEffect(() => {
    if (accounts.length > 0 && !instance.getActiveAccount()) {
      instance.setActiveAccount(accounts[0]);
    }
  }, [accounts, instance]);

  return (
    <>
      <Tooltip title="Account">
        <IconButton
          onClick={handleOpenMenu}
          sx={{
            bgcolor: 'primary.main',
            color: '#fff',
            '&:hover': { bgcolor: 'primary.light' },
            width: 36,
            height: 36,
          }}
        >
          <PersonIcon fontSize="medium" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        disableAutoFocus
        disableEnforceFocus
      >
        {activeAccount
          ? [
              <MenuItem key="name" disabled sx={{ opacity: '1 !important' }}>
                {displayName}
              </MenuItem>,
              <Divider key="divider" />,
              <MenuItem key="logout" onClick={handleLogout} disabled={loading}>
                {loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  'Log Out'
                )}
              </MenuItem>,
            ]
          : [
              <MenuItem key="login" onClick={handleRedirect} disabled={loading}>
                {loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </MenuItem>,
            ]}
      </Menu>
    </>
  );
};
