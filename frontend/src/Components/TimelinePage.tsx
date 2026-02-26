import {TimelineComponent, TimelineComponentHandle} from "./TimelineComponent";
import React, {useEffect, useMemo, useRef} from "react";
import {TimelineEvent} from "../Entities/TimelineEvent";
import {DefaultEvents, seedPeriods} from "../Seed/DefaultEvents";
import {UkEvents} from "../Seed/UkEvents";
import {testFunction, getEvents, addEvents, getDatasets} from "../api/api";
import {Header} from "./Header";
import {IApiDataset} from "../api/Interfaces";

export const TimelinePage = () => {
    const timelineRef = useRef<TimelineComponentHandle>(null);
    const [selectedEvent, setSelectedEvent] = React.useState<TimelineEvent | null>(null);
    const [events, setEvents] = React.useState<TimelineEvent[]>([]);
    const [selectedDataset, setSelectedDataset] = React.useState<IApiDataset | null>(null);
    const [datasets, setDatasets] = React.useState<IApiDataset[]>([]);
    const periods = seedPeriods;

    useMemo(() => {
        const fetchDatasets = async () => {
            var datasets = await getDatasets();
            setDatasets(datasets);
        };
        fetchDatasets();
    }, [])
    useEffect(() => {
        const fetchEvents = async () => {
            const events = await getEvents(selectedDataset?.id);
            const timelineEvents = events.map(e => new TimelineEvent([e.date], e.name, e.info))
            setEvents(timelineEvents);
        };
        fetchEvents();
    }, [selectedDataset]);
    
    const handleEventSearch = (event: React.SyntheticEvent, newValue: TimelineEvent | null) => {
        setSelectedEvent(newValue);
        timelineRef.current?.zoomToEvent(newValue?.date);
    };


    const handleDatabaseChange = (e: React.SyntheticEvent, name: string | null) => {
        const selectedDataset = datasets.find(d => d.name === name) || null;
        setSelectedDataset(selectedDataset);
    };

    const handleAddEvent = () => {
        // Placeholder for add event functionality
    };

    // Test API call handlers
    const handleTestFunction = async () => {
        const result = await testFunction();
        console.log("TestFunction result: " + JSON.stringify(result));
    };
    const handleGetEvents = async () => {
        try {
            const result = await getEvents();
            alert("GetEvents result: " + JSON.stringify(result));
        } catch (err) {
            alert("GetEvents error: " + err);
        }
    };
    const handleAddEvents = async () => {
        try {
            // Example: send empty array or a sample event
            const result = await addEvents([]);
            alert("AddEvents result: " + JSON.stringify(result));
        } catch (err) {
            alert("AddEvents error: " + err);
        }
    };

    return (
        <>
            <Header
                databaseOptions={datasets.map(s => s.name)}
                events={events}
                onDatabaseChange={handleDatabaseChange}
                onEventSearch={handleEventSearch}
                onAddEvent={handleAddEvents}
                selectedDatabase={selectedDataset?.name ?? null}
                selectedEvent={selectedEvent}
            />
            <TimelineComponent
                ref={timelineRef}
                events={events}
                periods={periods}
                selectedDatabase={selectedDataset?.name ?? null}
                selectedEvent={selectedEvent}
                onDatabaseChange={handleDatabaseChange}
                onEventSearch={handleEventSearch}
                onAddEvent={handleAddEvent}
            />
        </>
    );
}