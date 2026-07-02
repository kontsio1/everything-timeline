import React, { useCallback, useEffect, useRef, useState } from 'react';
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

interface PanelPosition {
  x: number;
  y: number;
}

const SETTINGS_PANEL_POSITION_KEY = 'everythingTimeline_settingsPanelPosition';
const PANEL_MARGIN = 12;
const FALLBACK_PANEL_WIDTH = 240;

const getDefaultPosition = (): PanelPosition => {
  if (typeof window === 'undefined') {
    return { x: 24, y: 80 };
  }

  return {
    x: Math.max(PANEL_MARGIN, window.innerWidth - FALLBACK_PANEL_WIDTH - 24),
    y: 80,
  };
};

const readStoredPosition = (): PanelPosition | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(SETTINGS_PANEL_POSITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PanelPosition>;
    if (typeof parsed.x !== 'number' || typeof parsed.y !== 'number') {
      return null;
    }
    return { x: parsed.x, y: parsed.y };
  } catch {
    return null;
  }
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ open, onClose }) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const [position, setPosition] = useState<PanelPosition>(
    () => readStoredPosition() ?? getDefaultPosition(),
  );

  const clampToViewport = useCallback((candidate: PanelPosition): PanelPosition => {
    if (typeof window === 'undefined') return candidate;

    const panelWidth = panelRef.current?.offsetWidth ?? FALLBACK_PANEL_WIDTH;
    const panelHeight = panelRef.current?.offsetHeight ?? 260;

    const maxX = Math.max(PANEL_MARGIN, window.innerWidth - panelWidth - PANEL_MARGIN);
    const maxY = Math.max(PANEL_MARGIN, window.innerHeight - panelHeight - PANEL_MARGIN);

    return {
      x: Math.min(Math.max(candidate.x, PANEL_MARGIN), maxX),
      y: Math.min(Math.max(candidate.y, PANEL_MARGIN), maxY),
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SETTINGS_PANEL_POSITION_KEY, JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    if (!open) return;
    setPosition((prev) => clampToViewport(prev));
  }, [open, clampToViewport]);

  useEffect(() => {
    if (!open || typeof window === 'undefined') return;

    const handleResize = () => {
      setPosition((prev) => clampToViewport(prev));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open, clampToViewport]);

  const handleDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    };
  };

  const handleDragMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = draggingRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    event.preventDefault();
    const next = {
      x: drag.originX + (event.clientX - drag.startX),
      y: drag.originY + (event.clientY - drag.startY),
    };
    setPosition(clampToViewport(next));
  };

  const handleDragEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || draggingRef.current.pointerId !== event.pointerId) {
      return;
    }

    draggingRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  if (!open) return null;

  return (
    <Paper
      ref={panelRef}
      elevation={4}
      sx={{
        position: 'fixed',
        top: position.y,
        left: position.x,
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
      <Box
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 0.5,
          cursor: 'grab',
          touchAction: 'none',
          userSelect: 'none',
          '&:active': { cursor: 'grabbing' },
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600, letterSpacing: 0.5 }}
        >
          Timeline settings
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          onPointerDown={(event) => event.stopPropagation()}
          aria-label="Close settings"
        >
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

