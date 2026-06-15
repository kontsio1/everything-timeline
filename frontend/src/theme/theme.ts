import { createTheme, alpha } from '@mui/material/styles';

// ── Design tokens - Dark Theme ────────────────────────────────────────────────
export const tokensDark = {
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

// ── Design tokens - Light Theme ────────────────────────────────────────────────
export const tokensLight = {
  ink: '#faf8f3',
  ink2: '#f0ebe0',
  parchment: '#2a2622',
  aged: '#3d3a34',
  muted: '#8b8680',
  rust: '#d97f4d',
  rustLight: '#e8935c',
  rustDark: '#c46a3a',
  gold: '#a88c3a',
  slate: '#6b7a8c',
  mist: '#5a7a92',
  crimson: '#c42e2e',
} as const;

// ── Legacy exports (dark theme) for backward compatibility ────────────────────
export const tokens = tokensDark;
export let bgColor: string = tokensDark.ink;
export let txtColor: string = tokensDark.parchment;
export let txtColor2: string = tokensDark.aged;
export let btnColor: string = tokensDark.rust;
export let highlightColor: string = tokensDark.rust;

/**
 * Update legacy color exports based on theme mode
 * Called by createAppTheme when theme changes
 */
export const updateColorExports = (mode: 'light' | 'dark') => {
  const selectedTokens = mode === 'light' ? tokensLight : tokensDark;
  bgColor = selectedTokens.ink;
  txtColor = selectedTokens.parchment;
  txtColor2 = selectedTokens.aged;
  btnColor = selectedTokens.rust;
  highlightColor = selectedTokens.rust;
};

// ── Theme ──────────────────────────────────────────────────────────────────────
/**
 * Create theme for either light or dark mode
 */
export const createAppTheme = (mode: 'light' | 'dark' = 'dark') => {
  const selectedTokens = mode === 'light' ? tokensLight : tokensDark;
  const isDark = mode === 'dark';

  // Update legacy exports
  updateColorExports(mode);

  return createTheme({
    palette: {
      mode,
      primary: {
        main: selectedTokens.rust,
        light: selectedTokens.rustLight,
        dark: selectedTokens.rustDark,
        contrastText: selectedTokens.parchment,
      },
      secondary: {
        main: selectedTokens.gold,
        contrastText: selectedTokens.ink,
      },
      background: {
        default: selectedTokens.ink,
        paper: selectedTokens.ink2,
      },
      text: {
        primary: selectedTokens.parchment,
        secondary: selectedTokens.aged,
        disabled: selectedTokens.muted,
      },
      error: {
        main: selectedTokens.crimson,
      },
      divider: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
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
    caption: { fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: selectedTokens.aged },
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
          backgroundColor: selectedTokens.ink,
          color: selectedTokens.parchment,
          scrollbarColor: `${selectedTokens.rust} transparent`,
          '&::-webkit-scrollbar': { width: 8 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: selectedTokens.rust,
            borderRadius: 4,
            '&:hover': { background: selectedTokens.rustLight },
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
            backgroundColor: selectedTokens.rust,
            color: '#fff',
            '&:hover': { backgroundColor: selectedTokens.rustLight },
            '&.Mui-disabled': {
              backgroundColor: alpha(selectedTokens.rust, 0.3),
              color: 'rgba(255,255,255,0.3)',
            },
          },
          '&.MuiButton-outlinedPrimary': {
            borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            color: selectedTokens.parchment,
            '&:hover': {
              borderColor: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            },
          },
        },
      },
    },

    // ── IconButton ───────────────────────────────────────────────────────────
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: selectedTokens.parchment,
          '&:hover': { backgroundColor: alpha(selectedTokens.rust, 0.15) },
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
          color: selectedTokens.parchment,
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: selectedTokens.rust,
          },
          '&.Mui-disabled': {
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            },
          },
        },
        input: {
          '&.Mui-disabled': {
            color: alpha(selectedTokens.parchment, 0.5),
            WebkitTextFillColor: alpha(selectedTokens.parchment, 0.5),
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: "'DM Sans', sans-serif",
          color: selectedTokens.aged,
          '&.Mui-focused': { color: selectedTokens.aged },
          '&.Mui-disabled': { color: alpha(selectedTokens.aged, 0.5) },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: { color: selectedTokens.muted },
      },
    },

    // ── Autocomplete ─────────────────────────────────────────────────────────
    MuiAutocomplete: {
      styleOverrides: {
        clearIndicator: { color: selectedTokens.aged },
        popupIndicator: { display: 'none' },
        noOptions: {
          fontFamily: "'DM Sans', sans-serif",
          color: selectedTokens.aged,
        },
        option: {
          fontFamily: "'DM Sans', sans-serif",
          color: selectedTokens.aged,
          '&:hover': { backgroundColor: `${alpha(selectedTokens.rust, 0.2)} !important` },
          '&[aria-selected="true"]': {
            backgroundColor: `${alpha(selectedTokens.rust, 0.3)} !important`,
          },
        },
        paper: {
          backgroundColor: selectedTokens.ink2,
          color: selectedTokens.parchment,
          border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)',
        },
      },
    },

    // ── Switch ───────────────────────────────────────────────────────────────
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: selectedTokens.rust,
            '& + .MuiSwitch-track': { backgroundColor: selectedTokens.rust },
          },
        },
        track: { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' },
      },
    },

    // ── Slider ───────────────────────────────────────────────────────────
    MuiSlider: {
      styleOverrides: {
        root: { color: selectedTokens.rust },
        thumb: { '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 8px ${alpha(selectedTokens.rust, 0.16)}` } },
        track: { backgroundColor: selectedTokens.rust },
        rail: { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' },
      },
    },

    // ── Menu / MenuItem ──────────────────────────────────────────────────────
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'light' 
            ? alpha(selectedTokens.ink2, 0.95)
            : alpha(selectedTokens.ink2.replace('rgba(55, 31, 3, 0.9)', 'rgb(55,31,3)'), 0.95),
          color: selectedTokens.parchment,
          border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)',
          minWidth: 160,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: selectedTokens.parchment,
          '&:hover': { backgroundColor: alpha(selectedTokens.rust, 0.2) },
          '&.Mui-disabled': { opacity: 1, color: selectedTokens.parchment },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' },
      },
    },

    // ── LinearProgress ───────────────────────────────────────────────────────
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 6,
          borderRadius: 3,
          backgroundColor: alpha(selectedTokens.rust, 0.2),
        },
        bar: {
          backgroundColor: selectedTokens.rust,
          borderRadius: 3,
        },
      },
    },

    // ── CircularProgress ─────────────────────────────────────────────────────
    MuiCircularProgress: {
      defaultProps: { style: { color: selectedTokens.rust } },
    },

    // ── Alert (dev banner) ───────────────────────────────────────────────────
    MuiAlert: {
      styleOverrides: {
        root: ({ ownerState }: { ownerState: any }) => ({
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          borderRadius: 0,
          ...(ownerState.severity === 'warning' && ownerState.variant === 'standard' && {
            backgroundColor: alpha(selectedTokens.rust, 0.15),
            color: selectedTokens.parchment,
            borderBottom: `1px solid ${alpha(selectedTokens.rust, 0.4)}`,
            '& .MuiAlert-icon': { color: selectedTokens.rust },
          }),
        }),
      },
    },

    // ── Paper ────────────────────────────────────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: selectedTokens.ink2,
        },
      },
    },

    // ── Checkbox ─────────────────────────────────────────────────────────────
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
          '&.Mui-checked': { color: selectedTokens.rust },
        },
      },
    },

    // ── FormControlLabel ─────────────────────────────────────────────────────
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: selectedTokens.aged,
        },
      },
    },
  },
});
};

export default createAppTheme();

