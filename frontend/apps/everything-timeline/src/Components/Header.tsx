import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { TimelineEvent } from "../Entities/TimelineEvent";
import React, { useState, useEffect } from "react";
import { AddEventModal } from "./AddEventModal";
import { AddDatasetModal } from "./AddDatasetModal";
import { Controls } from "./Controls";
import { Login } from "./Login";
import { testFunction, addDataset, getDatasets } from "../api/api";
import { useDatasetContext } from "../context/DatasetContext";
import { useThemeContext } from "../context/ThemeContext";

interface HeaderProps {
    databaseOptions: string[];
    events: TimelineEvent[];
    onDatabaseChange: (event: React.SyntheticEvent, value: string | null) => void;
    onEventSearch: (event: React.SyntheticEvent, value: TimelineEvent | null) => void;
    onSubmitEvent?: (eventData: { name: string; year: number; info: string }) => Promise<void>;
    selectedDatabase: string | null;
    selectedEvent: TimelineEvent | null;
    children?: React.ReactNode;
    loading: boolean;
}

export const Header = ({
    databaseOptions,
    events,
    onDatabaseChange,
    onEventSearch,
    onSubmitEvent,
    selectedDatabase,
    selectedEvent,
    children,
    loading,
}: HeaderProps) => {
    const [localSelectedEvent, setLocalSelectedEvent] = useState<TimelineEvent | null>(selectedEvent);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);
    const { setDatasets, setSelectedDatasetId } = useDatasetContext();
    const { mode, toggleTheme } = useThemeContext();

    useEffect(() => { setLocalSelectedEvent(selectedEvent); }, [selectedEvent]);

    const handleSelectEvent = (event: React.SyntheticEvent, newValue: TimelineEvent | null) => {
        setLocalSelectedEvent(newValue);
        onEventSearch(event, newValue);
    };

    const handleSubmitDataset = async (data: {
        name: string; description: string; domainStart: number; domainEnd: number | null; isPublic: boolean;
    }) => {
        const newDataset = await addDataset({
            Name: data.name, Description: data.description,
            DomainStart: data.domainStart, DomainEnd: data.domainEnd, IsPublic: data.isPublic,
        });
        const updatedDatasets = await getDatasets();
        setDatasets(updatedDatasets);
        if (newDataset?.Id) setSelectedDatasetId(newDataset.Id);
        setIsDatasetModalOpen(false);
    };

    const handleSubmitEvent = async (eventData: { name: string; year: number; info: string }) => {
        if (onSubmitEvent) await onSubmitEvent(eventData);
        setIsEventModalOpen(false);
    };

    const handleDebugUser = async () => {
        const result = await testFunction();
        console.log('=== User Info ===', result);
    };

    const isDbSelected = !!selectedDatabase && selectedDatabase !== '';

    const autocompleteWrapperSx = {
        display: 'flex', alignItems: 'center', gap: 1,
        bgcolor: 'rgba(255,255,255,0.05)',
        border: '1px solid', borderColor: 'divider',
        borderRadius: 1, px: 1,
        minWidth: 200, maxWidth: 270,
    } as const;

    const addBtnSx = {
        bgcolor: 'primary.main', color: '#fff',
        '&:hover': { bgcolor: 'primary.light' },
        '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
        width: 32, height: 32,
    } as const;

    return (
        <>
            <Box
                component="header"
                sx={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    position: 'sticky', top: 0, zIndex: 100,
                    px: { xs: 1.5, sm: 6 }, py: { xs: 2, sm: 3.5 },
                }}
            >
                {/* Left: selectors */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={autocompleteWrapperSx}>
                        <Autocomplete
                            options={databaseOptions} value={selectedDatabase}
                            onChange={onDatabaseChange} popupIcon={null} sx={{ flex: 1 }}
                            renderInput={(params) => (
                                <TextField {...params} label="Select a dataset" size="small" />
                            )}
                        />
                        <Tooltip title="Create dataset"><span>
                            <IconButton size="small" disabled={!isDbSelected || loading}
                                onClick={() => setIsDatasetModalOpen(true)} sx={addBtnSx}>
                                <AddIcon fontSize="small" />
                            </IconButton>
                        </span></Tooltip>
                    </Box>
                    <Box sx={autocompleteWrapperSx}>
                        <Autocomplete
                            options={events} value={localSelectedEvent}
                            onChange={handleSelectEvent} popupIcon={null}
                            noOptionsText="Select a dataset to load events" sx={{ flex: 1 }}
                            renderInput={(params) => (
                                <TextField {...params} label="Search for an event" size="small" />
                            )}
                        />
                        <Tooltip title="Add event"><span>
                            <IconButton size="small" disabled={!isDbSelected || loading}
                                onClick={() => setIsEventModalOpen(true)} sx={addBtnSx}>
                                <AddIcon fontSize="small" />
                            </IconButton>
                        </span></Tooltip>
                    </Box>
                </Box>

                {/* Centre: Logo */}
                <Box sx={{
                    display: 'flex', alignItems: 'baseline', gap: 1.25,
                    position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                }}>
                    <Typography variant="subtitle1" color="text.primary">Kontsio's</Typography>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', mb: '3px' }} />
                    <Typography variant="subtitle2" color="text.primary">Timeline of Everything</Typography>
                </Box>

                {/* Right: user controls */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
                    <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
                        <IconButton size="small" onClick={toggleTheme}
                            sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.light' }, width: 36, height: 36 }}>
                            {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                    <Login />
                    <Tooltip title="Debug user info">
                        <IconButton size="small" onClick={handleDebugUser}
                            sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.light' }, width: 36, height: 36 }}>
                            <ManageSearchIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Controls />
                </Box>

                {children}
            </Box>

            <AddEventModal open={isEventModalOpen} onClose={() => setIsEventModalOpen(false)}
                selectedDatabase={selectedDatabase} onSubmit={handleSubmitEvent} />
            <AddDatasetModal open={isDatasetModalOpen} onClose={() => setIsDatasetModalOpen(false)}
                onSubmit={handleSubmitDataset} />
        </>
    );
};
