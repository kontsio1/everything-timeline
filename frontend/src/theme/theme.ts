import { createTheme, alpha } from '@mui/material/styles';

// ── Design tokens ────────────────────────────────────────────────────────────
export const tokens = {
  ink: '#0f0e0b',
  ink2: 'rgba(55, 31, 3, 0.9)',
  parchment: '#f5f0e8',
  aged: '#e8dfc8',
  muted: '#c4bba8',
  rust: '#c45c2e',
  rustLight: '#d4683a',
  rustDark: '#a34a23',
  gold: '#b8963e',
  slate: '#4a5568',
  mist: '#9aa5b4',
  crimson: '#8b1a1a',
} as const;

// Re-exported for legacy use in GlobalConfigConstants / D3 code
export const bgColor = tokens.ink;
export const txtColor = tokens.parchment;
export const txtColor2 = tokens.aged;
export const btnColor = tokens.rust;
export const highlightColor = tokens.rust;

// ── Theme ──────────────────────────���─────────────────────────────────────────
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: tokens.rust,
      light: tokens.rustLight,
      dark: tokens.rustDark,
      contrastText: tokens.parchment,
    },
    secondary: {
      main: tokens.gold,
      contrastText: tokens.ink,
    },
    background: {
      default: tokens.ink,
      paper: tokens.ink2,
    },
    text: {
      primary: tokens.parchment,
      secondary: tokens.aged,
      disabled: tokens.muted,
    },
    error: {
      main: tokens.crimson,
    },
    divider: 'rgba(255,255,255,0.12)',
  },

  typography: {
    fontFamily: "'DM Sans', sans-serif",
    h1: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
    h2: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
    h3: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
    h4: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
    h5: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
    h6: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
    // logo variants
    subtitle1: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    subtitle2: {
      fontFamily: "'DM Mono', monospace",
      letterSpacing: '2px',
      textTransform: 'uppercase' as const,
      fontSize: '0.75rem',
    },
    body1: { fontFamily: "'DM Sans', sans-serif", fontSize: '1rem' },
    body2: { fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem' },
    caption: { fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: tokens.aged },
    button: {
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 500,
      textTransform: 'none' as const,
    },
  },

  shape: {
    borderRadius: 4,
  },

  components: {
    // ── CssBaseline ──────────────────────────────────────────────────────────
    MuiCssBaseline: {
      styleOverrides: {
        'html, body': {
          backgroundColor: tokens.ink,
          color: tokens.parchment,
          scrollbarColor: `${tokens.rust} transparent`,
          '&::-webkit-scrollbar': { width: 8 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: tokens.rust,
            borderRadius: 4,
            '&:hover': { background: tokens.rustLight },
          },
        },
      },
    },

    // ── Button ───────────────────────────────────────────────────────────────
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          '&.MuiButton-containedPrimary': {
            backgroundColor: tokens.rust,
            color: '#fff',
            '&:hover': { backgroundColor: tokens.rustLight },
            '&.Mui-disabled': {
              backgroundColor: alpha(tokens.rust, 0.3),
              color: 'rgba(255,255,255,0.3)',
            },
          },
          '&.MuiButton-outlinedPrimary': {
            borderColor: 'rgba(255,255,255,0.2)',
            color: tokens.parchment,
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.35)',
              backgroundColor: 'rgba(255,255,255,0.05)',
            },
          },
        },
      },
    },

    // ── IconButton ───────────────────────────────────────────────────────────
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: tokens.parchment,
          '&:hover': { backgroundColor: alpha(tokens.rust, 0.15) },
        },
      },
    },

    // ── TextField / OutlinedInput ────────────────────────────────────────────
    MuiTextField: {
      defaultProps: { variant: 'outlined' as const },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: tokens.parchment,
          backgroundColor: 'rgba(255,255,255,0.05)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.12)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.25)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: tokens.rust,
          },
          '&.Mui-disabled': {
            backgroundColor: 'rgba(255,255,255,0.02)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255,255,255,0.06)',
            },
          },
        },
        input: {
          '&.Mui-disabled': {
            color: alpha(tokens.parchment, 0.5),
            WebkitTextFillColor: alpha(tokens.parchment, 0.5),
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: "'DM Sans', sans-serif",
          color: tokens.aged,
          '&.Mui-focused': { color: tokens.aged },
          '&.Mui-disabled': { color: alpha(tokens.aged, 0.5) },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: { color: tokens.muted },
      },
    },

    // ── Autocomplete ─────────────────────────────────────────────────────────
    MuiAutocomplete: {
      styleOverrides: {
        clearIndicator: { color: tokens.aged },
        popupIndicator: { display: 'none' },
        noOptions: {
          fontFamily: "'DM Sans', sans-serif",
          color: tokens.aged,
        },
        option: {
          fontFamily: "'DM Sans', sans-serif",
          color: tokens.aged,
          '&:hover': { backgroundColor: `${alpha(tokens.rust, 0.2)} !important` },
          '&[aria-selected="true"]': {
            backgroundColor: `${alpha(tokens.rust, 0.3)} !important`,
          },
        },
        paper: {
          backgroundColor: tokens.ink2,
          color: tokens.parchment,
          border: '1px solid rgba(255,255,255,0.12)',
        },
      },
    },

    // ── Switch ───────────────────────────────────────────────────────────────
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: tokens.rust,
            '& + .MuiSwitch-track': { backgroundColor: tokens.rust },
          },
        },
        track: { backgroundColor: 'rgba(255,255,255,0.2)' },
      },
    },

    // ── Slider ───────────────────────────────────────────────────────────────
    MuiSlider: {
      styleOverrides: {
        root: { color: tokens.rust },
        thumb: { '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 8px ${alpha(tokens.rust, 0.16)}` } },
        track: { backgroundColor: tokens.rust },
        rail: { backgroundColor: 'rgba(255,255,255,0.2)' },
      },
    },

    // ── Menu / MenuItem ──────────────────────────────────────────────────────
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: alpha(tokens.ink2.replace('rgba(55, 31, 3, 0.9)', 'rgb(55,31,3)'), 0.95),
          color: tokens.parchment,
          border: '1px solid rgba(255,255,255,0.12)',
          minWidth: 160,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: tokens.parchment,
          '&:hover': { backgroundColor: alpha(tokens.rust, 0.2) },
          '&.Mui-disabled': { opacity: 1, color: tokens.parchment },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(255,255,255,0.15)' },
      },
    },

    // ── LinearProgress ───────────────────────────────────────────────────────
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 6,
          borderRadius: 3,
          backgroundColor: alpha(tokens.rust, 0.2),
        },
        bar: {
          backgroundColor: tokens.rust,
          borderRadius: 3,
        },
      },
    },

    // ── CircularProgress ─────────────────────────────────────────────────────
    MuiCircularProgress: {
      defaultProps: { style: { color: tokens.rust } },
    },

    // ── Alert (dev banner) ───────────────────────────────────────────────────
    MuiAlert: {
      styleOverrides: {
        root: ({ ownerState }: { ownerState: any }) => ({
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          borderRadius: 0,
          ...(ownerState.severity === 'warning' && ownerState.variant === 'standard' && {
            backgroundColor: alpha(tokens.rust, 0.15),
            color: tokens.parchment,
            borderBottom: `1px solid ${alpha(tokens.rust, 0.4)}`,
            '& .MuiAlert-icon': { color: tokens.rust },
          }),
        }),
      },
    },

    // ── Paper ────────────────────────────────────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: tokens.ink2,
        },
      },
    },

    // ── Checkbox ─────────────────────────────────────────────────────────────
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: 'rgba(255,255,255,0.3)',
          '&.Mui-checked': { color: tokens.rust },
        },
      },
    },

    // ── FormControlLabel ─────────────────────────────────────────────────────
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: tokens.aged,
        },
      },
    },
  },
});

export default theme;

