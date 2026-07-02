import React from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';

interface SideMenuDrawerProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: 'Home timeline', icon: <HomeOutlinedIcon fontSize="small" /> },
  { label: 'World history', icon: <PublicOutlinedIcon fontSize="small" /> },
  { label: 'Civilizations', icon: <AutoStoriesOutlinedIcon fontSize="small" /> },
  { label: 'Science milestones', icon: <ScienceOutlinedIcon fontSize="small" /> },
];

export const SideMenuDrawer: React.FC<SideMenuDrawerProps> = ({
  open,
  onClose,
}) => {
  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 280 }} role="presentation">
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Explore
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Example menu items
          </Typography>
        </Box>
        <Divider />
        <List sx={{ py: 0.5 }}>
          {menuItems.map((item) => (
            <ListItemButton key={item.label} onClick={onClose}>
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};
