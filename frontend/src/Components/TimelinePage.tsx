import {TimelineComponent, TimelineComponentHandle} from "./TimelineComponent";
import React, {useRef} from "react";
import {TimelineEvent} from "../Entities/TimelineEvent";
import {computeRelativePeriodOverlaps} from "../Helpers/GenericHelperFunctions";
import * as d3 from "d3";
import {DefaultEvents, seedPeriods} from "../Seed/DefaultEvents";
import {TimelinePeriod} from "../Entities/TimelinePeriod";
import {UkEvents} from "../Seed/UkEvents";

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
    
    return (
        <div>
            <TimelineComponent handleInputChange={handleInputChange} handleSearch={handleSearch} inputValue={inputValue} events={events} periods={periods} handleDatabaseChange={handleDatabaseChange} databaseOptions={databaseOptions}/>
        </div>
    );
}