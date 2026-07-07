import AppBar from '@mui/material/AppBar';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import React from 'react';
import { Login } from './Login';
import { useThemeContext } from '../context/ThemeContext';

interface HeaderProps {
  databaseOptions: string[];
  onDatabaseChange: (event: React.SyntheticEvent, value: string | null) => void;
  selectedDatabase: string | null;
  onMenuClick: () => void;
  children?: React.ReactNode;
}

export const Header = ({
  databaseOptions,
  onDatabaseChange,
  selectedDatabase,
  onMenuClick,
  children,
}: HeaderProps) => {
  const { mode, toggleTheme } = useThemeContext();

  const autocompleteWrapperSx = {
    display: 'flex',
    gap: 1,
    width: '100%',
    maxWidth: 300,
  } as const;

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar
          sx={{
            px: { xs: 1.5, sm: 4 },
            py: 1,
            minHeight: { xs: 56, sm: 72 },
            alignItems: 'center',
            gap: 1,
          }}
        >
          {/* Left: Logo */}
          <Box
            sx={{
              flex: '0 0 auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1.25,
            }}
          >
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={onMenuClick}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="subtitle1" color="text.primary">
              Kontsio's
            </Typography>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                mb: '3px',
              }}
            />
            <Typography variant="subtitle2" color="text.primary">
              Timeline of Everything
            </Typography>
          </Box>
          <Box
            component="img"
            src="/hourglass-transparent.png"
            alt="Everything Timeline logo"
            sx={{ width: 40, height: 40, objectFit: 'contain' }}
          />

          {/* Center: spacer */}
          <Box sx={{ flex: 1 }} />

          {/* Right: user controls */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'right',
              alignItems: 'center',
              gap: 1.5,
              flex: '0 0 auto',
              minWidth: 380,
            }}
          >
            <Box sx={autocompleteWrapperSx}>
              <Autocomplete
                options={databaseOptions}
                value={selectedDatabase}
                onChange={onDatabaseChange}
                popupIcon={null}
                sx={{ flex: 1 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select a dataset"
                    size="medium"
                    variant="standard"
                  />
                )}
              />
            </Box>
            <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
              <IconButton
                size="large"
                onClick={toggleTheme}
                sx={{
                  bgcolor: 'primary.main',
                  color: '#fff',
                  '&:hover': { bgcolor: 'primary.light' },
                  width: 36,
                  height: 36,
                }}
              >
                {mode === 'dark' ? (
                  <LightModeIcon fontSize="small" />
                ) : (
                  <DarkModeIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
            <Login />
          </Box>

          {children}
        </Toolbar>
      </AppBar>
    </>
  );
};
