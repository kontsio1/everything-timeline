import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { Controls } from './Controls';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'fixed',
        top: 80,
        right: 24,
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        p: 2,
        minWidth: 200,
        bgcolor: 'background.paper',
        opacity: 0.92,
        backdropFilter: 'blur(8px)',
        borderRadius: 2,
        boxShadow: 6,
        pointerEvents: 'all',
      }}
    >
      {/* Header row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing={0.5}>
          Timeline settings
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Close settings">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Controls rendered in vertical column */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Controls />
      </Box>
    </Paper>
  );
};

