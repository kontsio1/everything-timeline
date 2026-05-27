import React, { useEffect, useRef, useState } from 'react';
import { useIsAuthenticated } from '@azure/msal-react';
import { TimelineEvent } from '../Entities/TimelineEvent';
import './EventDetailsPanel.css';

interface EventDetailsPanelProps {
    event: TimelineEvent | null;
    onClose: () => void;
    scrollOnOpen: boolean;
    onSave: (updatedInfo: string) => Promise<void>;
}

export const EventDetailsPanel: React.FC<EventDetailsPanelProps> = ({ event, onClose, scrollOnOpen, onSave }) => {
    const isVisible = event !== null;
    const isAuthenticated = useIsAuthenticated();
    const panelRef = useRef<HTMLDivElement | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedInfo, setEditedInfo] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Reset edit state when the selected event changes
    useEffect(() => {
        setIsEditing(false);
        setEditedInfo(event?.info ?? '');
    }, [event]);

    useEffect(() => {
        if (scrollOnOpen && event && panelRef.current) {
            panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [event, scrollOnOpen]);

    const handleEditToggle = () => {
        if (!isEditing) {
            setEditedInfo(event?.info ?? '');
        }
        setIsEditing(prev => !prev);
    };

    const handleCancel = () => {
        setEditedInfo(event?.info ?? '');
        setIsEditing(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(editedInfo);
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            ref={panelRef}
            className={`event-details-panel ${isVisible ? 'visible' : ''}`}
        >
            <div className="panel-top-actions">
                <button
                    className="edit-button"
                    onClick={handleEditToggle}
                    disabled={!isAuthenticated || isSaving}
                    aria-label={isEditing ? 'Cancel editing' : 'Edit event info'}
                    title={!isAuthenticated ? 'Sign in to edit' : isEditing ? 'Cancel' : 'Edit'}
                >
                    {isEditing ? '✕' : '✎'}
                </button>
                <button
                    className="close-button"
                    onClick={onClose}
                    aria-label="Close event details"
                >
                    ×
                </button>
            </div>
            <div className="event-details-content">
                {event && (
                    <>
                        <h2 className="event-title">{event.label}</h2>
                        {isEditing ? (
                            <>
                                <textarea
                                    className="event-info-textarea"
                                    value={editedInfo}
                                    onChange={e => setEditedInfo(e.target.value)}
                                    disabled={isSaving}
                                    rows={4}
                                    autoFocus
                                />
                                <div className="edit-actions">
                                    <button
                                        className="save-button"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Saving…' : 'Save'}
                                    </button>
                                    <button
                                        className="cancel-button"
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className="event-info">
                                {event.info || 'No additional information available for this event.'}
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
