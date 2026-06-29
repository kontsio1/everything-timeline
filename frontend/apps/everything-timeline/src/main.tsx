import React from 'react';
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import './index.css';
import App from './app/App';
import { ThemeProvider as AppThemeProvider, useThemeContext } from './context/ThemeContext';
import { ControlsProvider } from './context/ControlsContext';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { MsalProvider } from '@azure/msal-react';
import { EventType } from '@azure/msal-browser';
import { msalInstance, msalReady } from './api/msalInstance';
import { createAppTheme } from './theme/theme';

const AppWithTheme: React.FC = () => {
  const { mode } = useThemeContext();
  const muiTheme = createAppTheme(mode);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <MsalProvider instance={msalInstance}>
        <ControlsProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ControlsProvider>
      </MsalProvider>
    </ThemeProvider>
  );
};

// Wait for the single msalReady promise (initialized in msalInstance.ts)
msalReady.then(() => {
  msalInstance.addEventCallback((event: any) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event?.payload?.account) {
      msalInstance.setActiveAccount(event.payload.account);
    }
  });

  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement,
  );

  root.render(
    <StrictMode>
      <AppThemeProvider>
        <AppWithTheme />
      </AppThemeProvider>
    </StrictMode>,
  );
});
