import {TimelineComponent, TimelineComponentHandle} from "./TimelineComponent";
import React, {useRef} from "react";
import {TimelineEvent} from "../Entities/TimelineEvent";
import {computeRelativePeriodOverlaps} from "../Helpers/GenericHelperFunctions";
import * as d3 from "d3";
import {DefaultEvents, seedPeriods} from "../Seed/DefaultEvents";
import {TimelinePeriod} from "../Entities/TimelinePeriod";
import {UkEvents} from "../Seed/UkEvents";
import { testFunction, getEvents, addEvents } from "../api/api";

export const TimelinePage = () => {
    const timelineRef = useRef<TimelineComponentHandle>(null);
    const [inputValue, setInputValue] = React.useState<TimelineEvent>();
    const [events, setEvents] = React.useState<TimelineEvent[]>([]);
    const periods = seedPeriods

    const handleInputChange = (event: React.SyntheticEvent, newValue: TimelineEvent | null) => {
        setInputValue(newValue ?? undefined);
    };
    
    const handleSearch = () => {
        timelineRef.current?.zoomToEvent(inputValue?.date);
    }

    const databases = [DefaultEvents, UkEvents]
    const databaseOptions: string[] = databases.map(s => s.Name)

    const handleDatabaseChange = (e: React.SyntheticEvent, name: string | null) => {
        const events: TimelineEvent[] = databases.flatMap(d =>
            d.Name === name ? d.Events : []
        )
        setEvents(events)
    }
    
    // Test API call handlers
    const handleTestFunction = async () => {
        try {
            const result = await testFunction();
            alert("TestFunction result: " + JSON.stringify(result));
        } catch (err) {
            alert("TestFunction error: " + err);
        }
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
        <div>
            {/* Test API Buttons */}
            <div style={{ marginBottom: 16 }}>
                <button onClick={handleTestFunction}>TestFunction</button>
                <button onClick={handleGetEvents}>GetEvents</button>
                <button onClick={handleAddEvents}>AddEvents</button>
            </div>
            <TimelineComponent handleInputChange={handleInputChange} handleSearch={handleSearch} inputValue={inputValue} events={events} periods={periods} handleDatabaseChange={handleDatabaseChange} databaseOptions={databaseOptions}/>
        </div>
    );
}