import "./Header.css";
import Autocomplete from "@mui/material/Autocomplete";
import {Button, TextField} from "@mui/material";
import {TimelineEvent} from "../Entities/TimelineEvent";
import React, {useState, useEffect} from "react";
import {AddEventModal} from "./AddEventModal";
import {Controls} from "./Controls";
import {Login} from "./Login";
import {testFunction} from "../api/api";

interface HeaderProps {
    databaseOptions: string[];
    events: TimelineEvent[];
    onDatabaseChange: (event: React.SyntheticEvent, value: string | null) => void;
    onEventSearch: (
        event: React.SyntheticEvent,
        value: TimelineEvent | null,
    ) => void;
    onSubmitEvent?: (eventData: {
        name: string;
        year: number;
        info: string;
    }) => Promise<void>;
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
    const [localSelectedEvent, setLocalSelectedEvent] =
        useState<TimelineEvent | null>(selectedEvent);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        setLocalSelectedEvent(selectedEvent);
    }, [selectedEvent]);

    const handleSelectEvent = (event: React.SyntheticEvent, newValue: TimelineEvent | null) => {
        setLocalSelectedEvent(newValue)
        onEventSearch(event, newValue);
    }

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmitEvent = async (eventData: {
        name: string;
        year: number;
        info: string;
    }) => {
        if (onSubmitEvent) {
            await onSubmitEvent(eventData);
        }
        setIsModalOpen(false);
    };

    const handleDebugUser = async () => {
        const result = await testFunction();
        if (!result.isAuthenticated) {
            console.log('not logged in');
            return;
        }
        console.log('=== User Info ===');
        console.log('User ID (oid):', result.userId);
        console.log('Email:', result.email);
        console.log('Name:', result.name);
        console.log('Given name:', result.givenName);
        console.log('Family name:', result.familyName);
        console.log('Tenant ID:', result.tenantId);
        console.log('Scope:', result.scope);
        console.log('All claims:', result.allClaims);
    };

    return (
        <>
            <header className="App-header">
                {/*Maybe app bar?*/}
                <div className="controls">
                    {/*Consider changing to ListItemButton*/}
                    <div className="db-select">
                        <Autocomplete
                            options={databaseOptions}
                            value={selectedDatabase}
                            onChange={onDatabaseChange}
                            popupIcon={null}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select a database"
                                    className="db-select-input"
                                />
                            )}
                            slotProps={{
                                paper: {
                                    className: "autocomplete-paper",
                                },
                            }}
                        />
                        <Button
                            className="add-btn"
                            variant="contained"
                            disabled={selectedDatabase =="" || selectedDatabase === null || loading}
                            onClick={handleOpenModal}
                        >+{/*TODO: consider changing to FAB*/}
                        </Button>
                    </div>
                    <div className="search-wrap-autocomplete">
                        <Autocomplete
                            options={events}
                            value={localSelectedEvent}
                            onChange={handleSelectEvent}
                            popupIcon={null}
                            noOptionsText="Select a database to load events"
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search for an event"
                                    className="search-input"
                                />
                            )}
                            slotProps={{
                                paper: {
                                    className: "autocomplete-paper",
                                },
                            }}
                        />
                        <Button
                            className="search-icon"
                            variant="contained"
                            onClick={(e) => handleSelectEvent(e, localSelectedEvent)}
                        >
                            &#x2315;
                        </Button>
                    </div>
                </div>
                <div className="logo">
                    <span className="logo-word">Kontsio's</span>
                    <div className="logo-dot"></div>
                    <span className="logo-sub">Timeline of Everything</span>
                </div>
                <div className="user-controls">
                    <Login />
                    <Button
                        title="Debug user info"
                        variant="contained"
                        onClick={handleDebugUser}
                        sx={{
                            minWidth: 0,
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: '#c45c2e',
                            color: '#fff',
                            fontSize: 18,
                            padding: 0,
                            boxShadow: 'none',
                            '&:hover': { background: '#d4683a' },
                        }}
                    >
                        🔍
                    </Button>
                    <Controls />
                </div>
                {children}
            </header>

            <AddEventModal
                open={isModalOpen}
                onClose={handleCloseModal}
                selectedDatabase={selectedDatabase}
                onSubmit={handleSubmitEvent}
            />
        </>
    );
};
