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
                                    className="db-select-input"
                                />
                            )}
                            slotProps={{
                                paper: {
                                    className: 'autocomplete-paper',
                                },
                            }}
                        />
                        <Button
                            className="add-btn"
                            variant="contained"
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
                                    className="search-input"
                                />
                            )}
                            slotProps={{
                                paper: {
                                    className: 'autocomplete-paper',
                                },
                            }}
                        />
                        <Button
                            className="search-icon"
                            variant="contained"
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