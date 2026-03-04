import {TimelineComponent, TimelineComponentHandle} from "./TimelineComponent";
import React, {useEffect, useMemo, useRef} from "react";
import {TimelineEvent} from "../Entities/TimelineEvent";
import {DefaultEvents, seedPeriods} from "../Seed/DefaultEvents";
import {UkEvents} from "../Seed/UkEvents";
import {testFunction, getEvents, addEvents, getDatasets} from "../api/api";
import {Header} from "./Header";
import {IApiDataset, IApiEvent} from "../api/Interfaces";
import {LinearProgress} from "@mui/material";
import {btnColor} from "../Constants/GlobalConfigConstants";

export const TimelinePage = () => {
    const timelineRef = useRef<TimelineComponentHandle>(null);
    const [selectedEvent, setSelectedEvent] = React.useState<TimelineEvent | null>(null);
    const [events, setEvents] = React.useState<TimelineEvent[]>([]);
    const [selectedDataset, setSelectedDataset] = React.useState<IApiDataset | null>(null);
    const [datasets, setDatasets] = React.useState<IApiDataset[]>([]);
    const [loading, setLoading] = React.useState(false);
    const periods = seedPeriods;

    useMemo(() => {
        setLoading(true);
        const fetchDatasets = async () => {
            var datasets = await getDatasets();
            setDatasets(datasets);
        };
        fetchDatasets().then(r => setLoading(false));
    }, [])
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
            setSelectedEvent(searchedEvent);
            searchedEvent.isHighlighted = true;
            timelineRef.current?.zoomToEvent(searchedEvent?.date);
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
            {loading && <LinearProgress sx={{ bgcolor: 'rgba(196, 92, 46, 0.2)', '& .MuiLinearProgress-bar': { bgcolor: btnColor } }} />}
            <TimelineComponent
                ref={timelineRef}
                events={events}
                periods={periods}
                selectedDatabase={selectedDataset?.Name ?? null}
                selectedEvent={selectedEvent}
                onDatabaseChange={handleDatabaseChange}
                onEventSearch={handleEventSearch}
            />
        </>
    );
}