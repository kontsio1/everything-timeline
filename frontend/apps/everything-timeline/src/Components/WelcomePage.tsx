import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, LinearProgress, CircularProgress } from '@mui/material';
import { getDatasets } from '../api/api';
import { useDatasetContext } from '../context/DatasetContext';
import { LoadingMessages } from '../Constants/LoadingMessages';

const RETRY_INTERVAL = 5000; // 5 seconds
const MESSAGE_CYCLE_INTERVAL = 3000; // 3 seconds

export const WelcomePage: React.FC = () => {
    const navigate = useNavigate();
    const { setDatasets, setIsInitialized } = useDatasetContext();
    const [loadingStatus, setLoadingStatus] = useState<string>(LoadingMessages[0]);
    const [retryCount, setRetryCount] = useState<number>(0);
    const [isError, setIsError] = useState<boolean>(false);
    const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
    const messageTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);
    const messageIndexRef = useRef(0);

    // Cycle through loading messages when not in error state
    useEffect(() => {
        const cycleMessages = () => {
            if (!isError) {
                messageIndexRef.current = (messageIndexRef.current + 1) % LoadingMessages.length;
                setLoadingStatus(LoadingMessages[messageIndexRef.current]);
            }
        };

        messageTimerRef.current = setInterval(cycleMessages, MESSAGE_CYCLE_INTERVAL);

        return () => {
            if (messageTimerRef.current) {
                clearInterval(messageTimerRef.current);
            }
        };
    }, [isError]);

    useEffect(() => {
        isMountedRef.current = true;
        
        const fetchAndInitialize = async () => {
            try {
                setIsError(false);
                const fetchedDatasets = await getDatasets();
                
                if (!isMountedRef.current) return;
                
                if (fetchedDatasets && fetchedDatasets.length > 0) {
                    setDatasets(fetchedDatasets);
                    setIsInitialized(true);
                    sessionStorage.setItem('everythingTimeline_initialized', 'true');
                    navigate('/', { replace: true });
                } else {
                    // No data returned, retry
                    setIsError(true);
                    setLoadingStatus('Waiting for data...');
                    scheduleRetry();
                }
            } catch (error) {
                if (!isMountedRef.current) return;
                
                console.error('Failed to fetch datasets:', error);
                setIsError(true);
                setLoadingStatus('Connection failed. Retrying...');
                scheduleRetry();
            }
        };

        const scheduleRetry = () => {
            if (retryTimerRef.current) {
                clearTimeout(retryTimerRef.current);
            }
            retryTimerRef.current = setTimeout(() => {
                if (isMountedRef.current) {
                    setRetryCount(prev => prev + 1);
                    fetchAndInitialize();
                }
            }, RETRY_INTERVAL);
        };

        fetchAndInitialize();

        return () => {
            isMountedRef.current = false;
            if (retryTimerRef.current) {
                clearTimeout(retryTimerRef.current);
            }
        };
    }, [navigate, setDatasets, setIsInitialized]);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundColor: 'background.default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 3,
            }}
        >
            {/* Timeline Icon */}
            <Box
                component="img"
                src="/android-chrome-192x192.png"
                alt="Everything Timeline"
                sx={{
                    width: '120px',
                    height: '120px',
                    marginBottom: 3,
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                        '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                        '50%': { opacity: 0.7, transform: 'scale(0.95)' },
                    },
                }}
            />

            {/* Welcome Title */}
            <Typography
                variant="h3"
                component="h1"
                sx={{
                    color: 'text.primary',
                    fontWeight: 'bold',
                    marginBottom: 2,
                    textAlign: 'center',
                    fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
                }}
            >
                Welcome to Everything Timeline!
            </Typography>

            {/* App Description */}
            <Typography
                variant="h6"
                sx={{
                    color: 'text.secondary',
                    marginBottom: 4,
                    textAlign: 'center',
                    fontStyle: 'italic',
                    maxWidth: '600px',
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                }}
            >
                "Explore history through an interactive timeline spanning the ages."
            </Typography>

            {/* Loading Bar */}
            <Box sx={{ width: '100%', maxWidth: '400px', marginBottom: 2 }}>
                <LinearProgress />
            </Box>

            {/* Loading Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                    {loadingStatus}
                </Typography>
            </Box>

            {/* Retry Count */}
            {retryCount > 0 && (
                <Typography variant="body2" sx={{ color: 'text.disabled', marginTop: 2, textAlign: 'center' }}>
                    Retry attempt: {retryCount}
                </Typography>
            )}
        </Box>
    );
};

