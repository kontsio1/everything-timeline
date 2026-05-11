import "./Header.css";
import Autocomplete from "@mui/material/Autocomplete";
import {Button, TextField, Menu, MenuItem, Divider} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {TimelineEvent} from "../Entities/TimelineEvent";
import React, {useState, useEffect} from "react";
import {AddEventModal} from "./AddEventModal";
import {Controls} from "./Controls";
import {useMsal} from "@azure/msal-react";
import {loginRequest} from "../api/authConfig";

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
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

    const {instance, accounts} = useMsal();
    const activeAccount = accounts[0] ?? instance.getActiveAccount();

    const displayName = activeAccount
        ? (activeAccount.name && activeAccount.name !== "unknown"
            ? activeAccount.name
            : (activeAccount.idTokenClaims as any)?.email ?? "User")
        : null;

    const handleOpenMenu = (event: React.MouseEvent<HTMLDivElement>) => {
        setMenuAnchor(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setMenuAnchor(null);
    };

    const handleRedirect = () => {
        instance
            .loginRedirect({
                ...loginRequest,
                prompt: 'select_account',
            })
            .catch((error) => {
                console.error('%c❌ loginRedirect() threw an error:', 'color: red; font-weight: bold;', error);
            });
        handleCloseMenu();
    };

    const handleLogout = () => {
        instance.logoutRedirect().catch((error) => {
            console.error('logoutRedirect error:', error);
        });
        handleCloseMenu();
    };

    useEffect(() => {
        if (accounts.length > 0 && !instance.getActiveAccount()) {
            instance.setActiveAccount(accounts[0]);
        }
    }, [accounts, instance]);

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
                    <div
                        onMouseEnter={handleOpenMenu}
                        onMouseLeave={handleCloseMenu}
                        style={{display: 'inline-flex'}}
                    >
                        <AccountCircleIcon
                            className="user-icon"
                            sx={{fontSize: 48}}
                        />
                        <Menu
                            anchorEl={menuAnchor}
                            open={Boolean(menuAnchor)}
                            onClose={handleCloseMenu}
                            slotProps={{paper: {className: "user-menu-paper", onMouseLeave: handleCloseMenu}}}
                            transformOrigin={{horizontal: 'right', vertical: 'top'}}
                            anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                            disableAutoFocus
                            disableEnforceFocus
                        >
                        {activeAccount ? [
                            <MenuItem key="name" disabled sx={{opacity: '1 !important', fontFamily: 'DM Sans, sans-serif', fontSize: 13}}>
                                {displayName}
                            </MenuItem>,
                            <Divider key="divider" sx={{borderColor: 'rgba(255,255,255,0.15)'}} />,
                            <MenuItem key="logout" onClick={handleLogout} sx={{fontFamily: 'DM Sans, sans-serif', fontSize: 13}}>
                                Log Out
                            </MenuItem>,
                        ] : [
                            <MenuItem key="login" onClick={handleRedirect} sx={{fontFamily: 'DM Sans, sans-serif', fontSize: 13}}>
                                Log In
                            </MenuItem>,
                        ]}
                        </Menu>
                    </div>
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
