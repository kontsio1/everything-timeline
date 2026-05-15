import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {ControlsProvider} from "./context/ControlsContext";
import { EventType } from '@azure/msal-browser';
import {MsalProvider} from "@azure/msal-react";
import { msalInstance } from "./api/msalInstance";

// Initialize MSAL before using the instance
msalInstance.initialize().then(() => {
    // Default to using the first account if no account is active on page load
    if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
        // Account selection logic is app dependent. Adjust as needed for different use cases.
        msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
    }

    // Listen for sign-in event and set active account
    msalInstance.addEventCallback((event: any) => {
        if (event.eventType === EventType.LOGIN_SUCCESS && event?.payload?.account) {
            const account = event.payload.account;
            msalInstance.setActiveAccount(account);
        }
    });

    const root = ReactDOM.createRoot(
        document.getElementById('root') as HTMLElement
    );
    root.render(
        <React.StrictMode>
            <MsalProvider instance={msalInstance}>
                <ControlsProvider>
                    <App/>
                </ControlsProvider>
            </MsalProvider>
        </React.StrictMode>
    );
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
