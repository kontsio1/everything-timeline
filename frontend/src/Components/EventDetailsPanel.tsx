import React, { useEffect, useRef } from 'react';
import { TimelineEvent } from '../Entities/TimelineEvent';
import './EventDetailsPanel.css';

interface EventDetailsPanelProps {
    event: TimelineEvent | null;
    onClose: () => void;
}

export const EventDetailsPanel: React.FC<EventDetailsPanelProps> = ({ event, onClose }) => {
    const isVisible = event !== null;
    const panelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (event && panelRef.current) {
            panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [event]);

    return (
        <div
            ref={panelRef}
            className={`event-details-panel ${isVisible ? 'visible' : ''}`}
        >
            <button 
                className="close-button"
                onClick={onClose}
                aria-label="Close event details"
            >
                ×
            </button>
            <div className="event-details-content">
                {event && (
                    <>
                        <h2 className="event-title">{event.label}</h2>
                        <p className="event-info">
                            {event.info || 'No additional information available for this event.'}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};
