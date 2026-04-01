import {TimelineComponent, TimelineComponentHandle} from "./TimelineComponent";
import React, {useEffect, useMemo, useRef} from "react";
import {TimelineEvent} from "../Entities/TimelineEvent";
import {DefaultEvents, seedPeriods} from "../Seed/DefaultEvents";
import {UkEvents} from "../Seed/UkEvents";
import {testFunction, getEvents, addEvents, getDatasets} from "../api/api";
import {Header} from "./Header";
import {IApiDataset, IApiEvent} from "../api/Interfaces";
import {useDatasetContext} from "../context/DatasetContext";

export const TimelinePage = () => {
    const timelineRef = useRef<TimelineComponentHandle>(null);
    const [selectedEvent, setSelectedEvent] = React.useState<TimelineEvent | null>(null);
    const [events, setEvents] = React.useState<TimelineEvent[]>([]);
    const [selectedDataset, setSelectedDataset] = React.useState<IApiDataset | null>(null);
    const [loading, setLoading] = React.useState(false);
    const periods = seedPeriods;
    
    const { datasets, setDatasets, isInitialized, setIsInitialized } = useDatasetContext();

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
    
    const handleEventSearch = (event: React.SyntheticEvent, searchedEvent: TimelineEvent | null) => {
        if(searchedEvent) {
            searchedEvent.isHighlighted = true;
            setSelectedEvent(searchedEvent);
            timelineRef.current?.zoomToEvent(searchedEvent);
        }
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

    return (
        <>
            <Header
                databaseOptions={datasets.map(s => s.Name)}
                events={events}
                onDatabaseChange={handleDatabaseChange}
                onEventSearch={handleEventSearch}
                onSubmitEvent={handleAddEvent}
                selectedDatabase={selectedDataset?.Name ?? null}
                selectedEvent={selectedEvent}
                loading={loading}
            />
            <TimelineComponent
                ref={timelineRef}
                events={events}
                periods={periods}
                selectedDatabase={selectedDataset?.Name ?? null}
                selectedEvent={selectedEvent}
                onDatabaseChange={handleDatabaseChange}
                onEventSearch={handleEventSearch}
                loading={loading}
            />
        </>
    );
}