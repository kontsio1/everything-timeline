import './Header.css';
import Autocomplete from '@mui/material/Autocomplete';
import {Button, TextField} from "@mui/material";
import {TimelineEvent} from "../Entities/TimelineEvent";
import React, { useState, useEffect } from 'react';

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
    useEffect(() => { setLocalSelectedEvent(selectedEvent); }, [selectedEvent]);

    return (
        <>
            <header className="App-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                padding: '28px 48px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(15,14,11,0.92)',
                backdropFilter: 'blur(12px)',
            }}>
                <div className="logo" style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '10px',
                }}>
                    <span className="logo-word" style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '22px',
                        fontWeight: 700,
                        letterSpacing: '-0.5px',
                        color: '#f5f0e8',
                    }}>Kontsio's</span>

                    <div className="logo-dot" style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#c45c2e',
                        marginBottom: '3px',
                    }}></div>

                    <span className="logo-sub" style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: '10px',
                        color: '#9aa5b4',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                    }}>Timeline of Everything</span>
                </div>

                <div className="controls" style={{display: 'flex', alignItems: 'center', gap: '1vw', marginTop: 32, marginBottom: 4}}>
                    <div className="db-select" style={{position: 'relative'}}>
                        <Autocomplete
                            options={databaseOptions}
                            value={selectedDatabase}
                            onChange={onDatabaseChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select a database"
                                    className="db-select-dropdown"
                                    sx={{
                                        '& .MuiInputLabel-root': { color: '#9aa5b4' },
                                        '& .MuiInputBase-input': {
                                            fontFamily: 'DM Sans, sans-serif',
                                            fontSize: 13,
                                            padding: '9px 36px 9px 30px',
                                            borderRadius: 6,
                                            color: '#f5f0e8',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.12)',
                                        },
                                        '& .MuiInputBase-input::placeholder': {
                                            marginLeft: '16px',
                                        }
                                    }}
                                />
                            )}
                            sx={{width: '200px'}}
                        />
                    </div>

                    <div className="search-wrap" style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                        <Autocomplete
                            options={events}
                            value={localSelectedEvent}
                            onChange={(e, newValue) => setLocalSelectedEvent(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search for an event"
                                    sx={{
                                        '& .MuiInputLabel-root': { color: '#9aa5b4' },
                                        '& .MuiInputBase-input': {
                                            fontFamily: 'DM Sans, sans-serif',
                                            fontSize: 13,
                                            padding: '9px 40px 9px 30px',
                                            borderRadius: 6,
                                            color: '#f5f0e8',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.12)',
                                        },
                                        '& .MuiInputBase-input::placeholder': {
                                            marginLeft: '16px',
                                        }
                                    }}
                                />
                            )}
                            sx={{width: '320px'}}
                        />
                        <Button
                            className="search-icon"
                            variant="contained"
                            style={{position: 'absolute', right: 12, minWidth: 0, width: 36, height: 36, borderRadius: '50%', background: '#c45c2e', color: '#fff', fontSize: 14, boxShadow: 'none', transition: 'color 0.2s'}}
                            onClick={e => onEventSearch(e, localSelectedEvent)}
                        >
                            &#x2315;
                        </Button>
                    </div>

                    <Button
                        className="add-btn"
                        variant="contained"
                        style={{display: 'flex', alignItems: 'center', gap: 7, background: '#c45c2e', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '6px', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s, transform 0.1s', letterSpacing: '0.2px', boxShadow: 'none'}}
                        onClick={onAddEvent}
                    >
                        <span>＋</span> Add Event
                    </Button>
                </div>

                {children}
            </header>
        </>
    );
};