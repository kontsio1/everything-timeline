import React, { useEffect, useState } from 'react';
import Fab from '@mui/material/Fab';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { alpha } from '@mui/material/styles';
import { tokens } from '../theme/theme';

interface ScrollFABProps {
  /** Whether the details panel is open */
  isVisible: boolean;
  /** Ref to the details panel (scroll target when going down) */
  panelRef: React.RefObject<HTMLDivElement | null>;
}

export const ScrollFAB: React.FC<ScrollFABProps> = ({
  isVisible,
  panelRef,
}) => {
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const updateScrollState = () => setIsAtTop(window.scrollY <= 0);

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, [isVisible]);

  const handleClick = () => {
    if (isAtTop) {
      // Timeline is visible — scroll down to the panel
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Page is scrolled down — scroll all the way back to the top of the page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const label = isAtTop ? 'Jump to details' : 'Back to top';

  return (
    <Zoom in={isVisible} unmountOnExit>
      <Tooltip title={label} placement="left">
        <Fab
          size="medium"
          onClick={handleClick}
          aria-label={label}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 20,
            bgcolor: 'background.paper',
            color: 'primary.main',
            border: '2px solid',
            borderColor: 'primary.main',
            boxShadow: `0 4px 16px ${alpha(tokens.rust, 0.35)}`,
            '&:hover': {
              bgcolor: alpha(tokens.rust, 0.15),
              borderColor: 'primary.light',
              color: 'primary.light',
            },
            zIndex: 1200,
          }}
        >
          {isAtTop ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
        </Fab>
      </Tooltip>
    </Zoom>
  );
};
