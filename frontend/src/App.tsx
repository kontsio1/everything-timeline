import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { TimelinePage } from "./Components/TimelinePage";
import { WelcomePage } from "./Components/WelcomePage";
import { DatasetProvider, useDatasetContext } from "./context/DatasetContext";
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

// Component to handle the root route redirect logic
const RootRedirect: React.FC = () => {
    const { isInitialized } = useDatasetContext();
    const hasVisited = sessionStorage.getItem('everythingTimeline_initialized') === 'true';
    
    if (!isInitialized && !hasVisited) {
        return <Navigate to="/welcome" replace />;
    }
    return <TimelinePage />;
};

function App() {
    const [showDevBanner, setShowDevBanner] = useState(
        () => sessionStorage.getItem('everythingTimeline_devBannerDismissed') !== 'true'
    );

    const handleDismissBanner = () => {
        setShowDevBanner(false);
        sessionStorage.setItem('everythingTimeline_devBannerDismissed', 'true');
    };

    return (
        <DatasetProvider>
            <Router>
                <div className="App">
                    {showDevBanner && (
                        <Alert
                            severity="warning"
                            role="status"
                            aria-live="polite"
                            action={
                                <IconButton
                                    aria-label="Dismiss development notice"
                                    size="small"
                                    onClick={handleDismissBanner}
                                >
                                    <CloseIcon fontSize="inherit" />
                                </IconButton>
                            }
                        >
                            This application is still under development.
                        </Alert>
                    )}
                    <Routes>
                        <Route path="/welcome" element={<WelcomePage />} />
                        <Route path="/" element={<RootRedirect />} />
                    </Routes>
                </div>
            </Router>
        </DatasetProvider>
    );
}

export default App;
