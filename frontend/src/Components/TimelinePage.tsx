import {TimelineComponent, TimelineComponentHandle} from "./TimelineComponent";
import React, {useEffect, useMemo, useRef} from "react";
import {TimelineEvent} from "../Entities/TimelineEvent";
import {seedPeriods} from "../Seed/DefaultEvents";
import {getEvents, addEvents, getDatasets} from "../api/api";
import {Header} from "./Header";
import {IApiDataset, IApiEvent} from "../api/Interfaces";
import {useDatasetContext} from "../context/DatasetContext";
import {EventDetailsPanel} from "./EventDetailsPanel";
import {pulseEventDuration, zoomToEventDuration} from "../Constants/GlobalConfigConstants";

export const TimelinePage = () => {
    const timelineRef = useRef<TimelineComponentHandle>(null);
    const [highlightedEvent, setHighlightedEvent] = React.useState<TimelineEvent | null>(null);
    const [detailsEvent, setDetailsEvent] = React.useState<TimelineEvent | null>(null);
    const [pulseEventKey, setPulseEventKey] = React.useState<string | null>(null);
    const [scrollDetailsOnOpen, setScrollDetailsOnOpen] = React.useState(false);
    const [events, setEvents] = React.useState<TimelineEvent[]>([]);
    const [selectedDataset, setSelectedDataset] = React.useState<IApiDataset | null>(null);
    const [loading, setLoading] = React.useState(false);
    const periods = seedPeriods;
    
    const { datasets, setDatasets, isInitialized, setIsInitialized } = useDatasetContext();

    const getEventKey = (event: TimelineEvent) => `${event.label}-${event.date.toISOString()}`;

    useMemo(() => {
        // Only fetch datasets if not already initialized via welcome page
        if (isInitialized && datasets.length > 0) {
            return;
        }
        
        setLoading(true);
        const fetchDatasets = async () => {
            var fetchedDatasets = await getDatasets();
            setDatasets(fetchedDatasets);
            setIsInitialized(true);
            sessionStorage.setItem('everythingTimeline_initialized', 'true');
        };
        fetchDatasets().then(r => setLoading(false));
    }, [isInitialized, datasets.length, setDatasets, setIsInitialized])
    
    useEffect(() => {
        setLoading(true);
        const fetchEvents = async () => {
            const events = await getEvents(selectedDataset?.Id);
            const timelineEvents = events.map(e => new TimelineEvent([e.Date, 0, 0], e.Name, e.Info))
            setEvents(timelineEvents);
        };
        fetchEvents().then(r => setLoading(false));
    }, [selectedDataset]);
    
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            if (!target?.closest(".timeline-event")) {
                setHighlightedEvent(null);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    useEffect(() => {
        setHighlightedEvent(null);
        setDetailsEvent(null);
        setPulseEventKey(null);
        setScrollDetailsOnOpen(false);
    }, [selectedDataset]);

    const handleEventSearch = (event: React.SyntheticEvent, searchedEvent: TimelineEvent | null) => {
        if (!searchedEvent) return;
        const eventKey = getEventKey(searchedEvent);
        setHighlightedEvent(searchedEvent);
        setDetailsEvent(searchedEvent);
        setScrollDetailsOnOpen(false);
        setPulseEventKey(eventKey);
        timelineRef.current?.zoomToEvent(searchedEvent);
        window.setTimeout(() => {
            setPulseEventKey(current => (current === eventKey ? null : current));
        }, zoomToEventDuration + pulseEventDuration);
    };


    const handleDatabaseChange = (e: React.SyntheticEvent, name: string | null) => {
        const selectedDataset = datasets.find(d => d.Name === name) || null;
        setSelectedDataset(selectedDataset);
    };
    
    const handleAddEvent = async (eventData: {
        name: string;
        year: number;
        info: string;
    }) => {
        const newEvent = { Date: eventData.year, Name: eventData.name, Info: eventData.info, DatasetId: selectedDataset?.Id} as IApiEvent;
        try {
            const result = await addEvents([newEvent]);
            // setEvents([...events, newEvent]);   
            // alert("AddEvents result: " + JSON.stringify(result));
        } catch (err) {
            alert("AddEvents error: " + err);
        }
        console.log("New event added:", eventData);
    };

    const handleEventSelect = (event: TimelineEvent) => {
        setHighlightedEvent(event);
        setDetailsEvent(event);
        setScrollDetailsOnOpen(true);
        setPulseEventKey(null);
    };

    const handleCloseDetails = () => {
        setHighlightedEvent(null);
        setDetailsEvent(null);
        setScrollDetailsOnOpen(false);
    };

    return (
        <>
            <Header
                databaseOptions={datasets.map(s => s.Name)}
                events={events}
                onDatabaseChange={handleDatabaseChange}
                onEventSearch={handleEventSearch}
                onSubmitEvent={handleAddEvent}
                selectedDatabase={selectedDataset?.Name ?? null}
                selectedEvent={detailsEvent}
                loading={loading}
            />
            <TimelineComponent
                ref={timelineRef}
                events={events}
                periods={periods}
                selectedDatabase={selectedDataset?.Name ?? null}
                highlightedEventKey={highlightedEvent ? getEventKey(highlightedEvent) : null}
                pulseEventKey={pulseEventKey}
                onDatabaseChange={handleDatabaseChange}
                onEventSearch={handleEventSearch}
                onEventSelect={handleEventSelect}
                loading={loading}
            />
            <EventDetailsPanel
                event={detailsEvent}
                onClose={handleCloseDetails}
                scrollOnOpen={scrollDetailsOnOpen}
            />
        </>
    );
}