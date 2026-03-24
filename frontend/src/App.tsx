import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { TimelinePage } from "./Components/TimelinePage";
import { WelcomePage } from "./Components/WelcomePage";
import { DatasetProvider, useDatasetContext } from "./context/DatasetContext";

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
    return (
        <DatasetProvider>
            <Router>
                <div className="App">
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
