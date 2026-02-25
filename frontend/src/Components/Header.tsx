import './Header.css';
import Autocomplete from '@mui/material/Autocomplete';
import {Button, TextField} from "@mui/material";
import {TimelineEvent} from "../Entities/TimelineEvent";
import React, {useState, useEffect} from 'react';
import {btnColor, txtColor, txtColor2} from '../Constants/GlobalConfigConstants';

interface HeaderProps {
    databaseOptions: string[];
    events: TimelineEvent[];
    onDatabaseChange: (event: React.SyntheticEvent, value: string | null) => void;
    onEventSearch: (event: React.SyntheticEvent, value: TimelineEvent | null) => void;
    onAddEvent: () => void;
    selectedDatabase: string | null;
    selectedEvent: TimelineEvent | null;
    children?: React.ReactNode;
}

export const Header = ({
                           databaseOptions,
                           events,
                           onDatabaseChange,
                           onEventSearch,
                           onAddEvent,
                           selectedDatabase,
                           selectedEvent,
                           children
                       }: HeaderProps) => {
    // Local state for event selection
    const [localSelectedEvent, setLocalSelectedEvent] = useState<TimelineEvent | null>(selectedEvent);
    useEffect(() => {
        setLocalSelectedEvent(selectedEvent);
    }, [selectedEvent]);

    return (
        <>
            <header className="App-header">
                <div className="logo">
                    <span className="logo-word">Kontsio's</span>
                    <div className="logo-dot"></div>
                    <span className="logo-sub">Timeline of Everything</span>
                </div>

                <div className="controls">
                    <div className="db-select">
                        <Autocomplete
                            options={databaseOptions}
                            value={selectedDatabase}
                            onChange={onDatabaseChange}
                            popupIcon={null}
                            noOptionsText="Select a database to load events"
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select a database"
                                    sx={{
                                        '& .MuiInputLabel-root': {color: txtColor2},
                                        '& .MuiInputBase-input': {
                                            fontFamily: 'DM Sans, sans-serif',
                                            fontSize: 13,
                                            color: txtColor2,
                                            paddingRight: '44px', // leave space for icon
                                        },
                                        '& .MuiInputLabel-outlined.Mui-focused': {
                                            color: txtColor2,
                                            borderColor: txtColor2,
                                        },
                                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: btnColor,
                                        },
                                        '& .MuiAutocomplete-popupIndicator': {
                                            display: 'none'
                                        },
                                        '& .MuiAutocomplete-clearIndicator': {
                                            color: txtColor2,
                                        },
                                        '& .MuiAutocomplete-noOptions': {
                                            color: txtColor2,
                                        },
                                    }}
                                />
                            )}
                            slotProps={{
                                paper: {
                                    sx: {
                                        backgroundColor: 'rgba(55, 31, 3, 0.9)',
                                        color: txtColor2,
                                    },
                                },
                            }}
                        />
                        <Button
                            className="add-btn"
                            variant="contained"
                            sx={{
                                backgroundColor: '#c45c2e',
                                minWidth: 0,
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                position: 'absolute',
                                right: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                padding: 0,
                                boxShadow: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 22,
                                '&:hover': {
                                    backgroundColor: '#d4683a',
                                },
                            }}
                            onClick={onAddEvent}
                        >
                            +
                        </Button>
                    </div>
                    <div className="search-wrap-autocomplete">
                        <Autocomplete
                            options={events}
                            value={localSelectedEvent}
                            onChange={(e, newValue) => setLocalSelectedEvent(newValue)}
                            popupIcon={null}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search for an event"
                                    sx={{
                                        '& .MuiInputLabel-root': {color: txtColor2},
                                        '& .MuiInputBase-input': {
                                            fontFamily: 'DM Sans, sans-serif',
                                            fontSize: 13,
                                            color: txtColor2,
                                            paddingRight: '44px', // leave space for icon
                                        },
                                        '& .MuiInputLabel-outlined.Mui-focused': {
                                            color: txtColor2,
                                            borderColor: txtColor2,
                                        },
                                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: btnColor,
                                        },
                                        '& .MuiAutocomplete-popupIndicator': {
                                            display: 'none'
                                        },
                                        '& .MuiAutocomplete-clearIndicator': {
                                            color: txtColor2,
                                        },
                                        '& .MuiAutocomplete-noOptions': {
                                            color: txtColor2,
                                        },
                                    }}
                                />
                            )}
                            slotProps={{
                                paper: {sx: {backgroundColor: 'rgba(55, 31, 3, 0.9)', color: txtColor2},},
                            }}
                        />
                        <Button
                            className="search-icon"
                            variant="contained"
                            sx={{
                                backgroundColor: '#c45c2e',
                                minWidth: 0,
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                position: 'absolute',
                                right: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                padding: 0,
                                boxShadow: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&:hover': {
                                    backgroundColor: '#d4683a',
                                },
                            }}
                            onClick={e => onEventSearch(e, localSelectedEvent)}
                        >
                            &#x2315;
                        </Button>
                    </div>
                </div>

                {children}
            </header>
        </>
    );
};