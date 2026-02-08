import {TimelineComponent, TimelineComponentHandle} from "./TimelineComponent";
import React, {useRef} from "react";
import {TimelineEvent} from "../Entities/TimelineEvent";

export const TimelinePage = () => {
    const [inputValue, setInputValue] = React.useState<TimelineEvent[]>([]);
    const timelineRef = useRef<TimelineComponentHandle>(null);
    
    const handleInputChange = (event: React.SyntheticEvent, newValue: TimelineEvent[]) => {
        setInputValue(newValue);
    };
    
    const handleSearch = () => {
        timelineRef.current?.zoomToEvent(inputValue[0]?.date);
    }
    
    return (
        <div>
            <TimelineComponent handleInputChange={handleInputChange} handleSearch={handleSearch} />
        </div>
    );
}