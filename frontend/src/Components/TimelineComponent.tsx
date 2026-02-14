import * as d3 from "d3";
import React, {forwardRef, SyntheticEvent, useEffect, useImperativeHandle, useRef, useState} from "react";
import {
    ticksNo,
    timelineHeight,
    timelineInitialDomain,
    timelineWidth,
    noOfVisiblePeriods
} from "../Constants/GlobalConfigConstants";
import {TimelinePeriod} from "../Entities/TimelinePeriod";
import {TimelineEvent} from "../Entities/TimelineEvent";
import {
    computeEventsBBoxOverlaps,
    computeRelativePeriodOverlaps,
    getYearLabel
} from "../Helpers/GenericHelperFunctions";
import {PeriodTooltip} from "./PeriodTooltip";
import {EventTooltip} from "./EventTooltip";
import Autocomplete from '@mui/material/Autocomplete';
import {Button, TextField} from "@mui/material";
import {makeStyles} from "@mui/styles";
import TimelinePeriodMarker from "./TimelinePeriodMarker";
import EventMarker from "./EventMarker";
import {svg} from "d3";

const useStyles = makeStyles({
    timelineContainer: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignContent: 'space-around',
    },
});

interface TimelineComponentProps {
    handleInputChange: (event: SyntheticEvent, newValue: TimelineEvent | null) => void;
    inputValue?: TimelineEvent;
    handleSearch: () => void;
    handleDatabaseChange: (event: SyntheticEvent, value: string | null) => void;
    events: TimelineEvent[];
    periods: TimelinePeriod[];
    databaseOptions: string[];
}

export interface TimelineComponentHandle {
    zoomToEvent: (date?: Date) => void;
}

export const TimelineComponent = forwardRef<TimelineComponentHandle, TimelineComponentProps>((props, ref) => {
    const classes = useStyles();
    const {events, periods} = props;
    const svgRef = useRef<SVGSVGElement>(null); // SVG ref for React-managed SVG
    const axisRef = useRef<SVGGElement>(null);
    const xScaleRef = useRef<d3.ScaleTime<number, number, never> | null>(null);

    const [visibleEvents, setVisibleEvents] = useState<TimelineEvent[]>([]);
    const [visiblePeriods, setVisiblePeriods] = useState<TimelinePeriod[]>([]);
    const [transform, setTransform] = useState<{ x: number, k: number }>({x: 0, k: 1}); //x axis panning & scale/zoom state

    const horizontalPaddingOfTimeline = timelineWidth*0.05; // horizontal distance between the left edge of the timeline rectangle (SVG) and the start of the timeline, also applied to the right edge
    const formatTicks = (domainValue: any) => {
        const date = domainValue instanceof Date ? domainValue : new Date(Number(domainValue));
        const year = date.getUTCFullYear();
        return getYearLabel(year)
    }

    // Create initial scale
    useEffect(() => {
        const x = d3.scaleTime()
            .domain(timelineInitialDomain)
            //horizontal distance between the left edge of the timeline rectangle (SVG) and the start of the timeline
            .range([horizontalPaddingOfTimeline, timelineWidth - horizontalPaddingOfTimeline])
            .clamp(true);
        xScaleRef.current = x;
        setTransform({x: 0, k: 1});
        updatePeriods(x);
        updateEvents(x);
        if (!svgRef.current) return;
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([1, 1000])
            .translateExtent([[horizontalPaddingOfTimeline, 0], [timelineWidth - horizontalPaddingOfTimeline, 0]])
            .extent([[50, 0], [timelineWidth - 50, timelineHeight]])
            .on("zoom", (event) => {
                setTransform({x: event.transform.x, k: event.transform.k});
                const newX = event.transform.rescaleX(xScaleRef.current!);
                updatePeriods(newX);
                updateEvents(newX);
            });
        d3.select(svgRef.current).call(zoom);
    }, [events]);

    // Update axis ticks on transform/scale change
    useEffect(() => {
        const xScale = getTransformedXScale();
        if (axisRef.current && xScale) {
            d3.select(axisRef.current)
                .call(d3.axisBottom(xScale)
                    .ticks(ticksNo)
                    .tickFormat(formatTicks));
        }
    }, [transform, visibleEvents, visiblePeriods]);

    const getTransformedXScale = () => {
        const baseScale = xScaleRef.current;
        if (!baseScale) return null;
        const d3Transform = d3.zoomIdentity.translate(transform.x, 0).scale(transform.k);
        return d3Transform.rescaleX(baseScale);
    };

    computeRelativePeriodOverlaps(periods);

    // Helper to recalculate boxX/boxWidth for all events
    const recalculateEventBoxes = (events: TimelineEvent[], xScale: d3.ScaleTime<number, number, never>) => {
        const padding = 4;
        const fontSize = 12;
        events.forEach(event => {
            const timelineX = xScale(event.date);
            const textWidth = event.label.length * fontSize * 0.6;
            const rectWidth = textWidth + padding * 2;
            const rectHeight = fontSize + padding * 2;
            const rectX = timelineX - textWidth / 2 - padding;
            event.boxWidth = rectWidth;
            event.boxHeight = rectHeight;
            event.boxX = rectX;
        });
    };

    const updateEvents = (newX: d3.ScaleTime<number, number, never>) => {
        // Always recalculate boxX/boxWidth for all events
        recalculateEventBoxes(events, newX);
        const [domainStart, domainEnd] = newX.domain();
        events.forEach(p => p.resetStemHeight());
        const eventsInDomain = events.filter(p => p.date >= domainStart && p.date <= domainEnd);
        let filteredEvents = [...eventsInDomain];
        for (let i = 0; i < 2; i++) {
            computeEventsBBoxOverlaps(filteredEvents);
            computeEventsBBoxOverlaps(filteredEvents);
            filteredEvents = eventsInDomain.filter(e => e.stemHeight < timelineHeight / 2 - timelineHeight*0.1);
        }
        // const eventsWithBoxInsideTimeline = filteredEvents.filter(e => {
        //     // console.log(`Event: ${e.label}, boxX: ${e.boxX}, boxWidth: ${e.boxWidth}`);
        //     return e.boxX >= 0 && (e.boxX + e.boxWidth) <= timelineWidth;
        // });
        setVisibleEvents(filteredEvents);
    };
    const updatePeriods = (newX: d3.ScaleTime<number, number, never>) => {
        const [domainStart, domainEnd] = newX.domain();
        const periodsInDomain = periods.filter(p => p.endDate >= domainStart && p.startDate <= domainEnd);
        periodsInDomain.forEach(period => {
            period.updateDuration([domainStart, domainEnd]);
            period.updateVisualAttributesBasedOnDuration();
        });
        const topPriorityPeriods = periodsInDomain.sort((a, b) => b.priority - a.priority)
            .slice(0, noOfVisiblePeriods);
        const periodsByStartDate = topPriorityPeriods.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
        setVisiblePeriods(periodsByStartDate);
    };

    const searchAndZoom = () => {
        var date = props.inputValue?.date
        const xScale = xScaleRef.current;
        if (date && xScale && svgRef.current) {
            // Calculate the x position of the selected date
            const targetX = xScale(date);
            // Center of the axis in the SVG
            const centerX = (timelineWidth + 50) / 2;
            // Choose a zoom level (can be made configurable)
            const zoomLevel = 7;
            // Calculate translation so the date is centered after zoom
            const translateX = centerX - targetX * zoomLevel;
            // Create the target zoom transform
            const targetTransform = d3.zoomIdentity.translate(translateX, 0).scale(zoomLevel);
            // Use the already-attached zoom behavior
            const svgSelection = d3.select(svgRef.current);
            const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
                .scaleExtent([1, 1000])
                .translateExtent([[50, 0], [timelineWidth - 50, 0]])
                .extent([[50, 0], [timelineWidth - 50, timelineHeight]])
                .on("zoom", (event) => {
                    setTransform({x: event.transform.x, k: event.transform.k});
                    const newX = event.transform.rescaleX(xScaleRef.current!);
                    updatePeriods(newX);
                    updateEvents(newX);
                });
            svgSelection.call(zoomBehavior);
            // Animate the zoom using d3's transition and zoomBehavior.transform
            svgSelection.transition()
                .duration(1200)
                .call(zoomBehavior.transform, targetTransform);
        }
    };

    return (
        <>
            <h1>Timeline of Everything</h1>
            <div className={classes.timelineContainer}>
                <div style={{display: "flex", gap: 10, marginBottom: 10}}>
                    <Autocomplete
                        multiple={false}
                        sx={{flex: 0.5}}
                        options={props.databaseOptions}
                        renderInput={(params) => <TextField {...params} label="Select a database"/>}
                        onChange={props.handleDatabaseChange}
                    />
                    <Autocomplete
                        multiple={false}
                        sx={{flex: 1}}
                        options={events.map((e) => e)}
                        renderInput={(params) => <TextField {...params} label="Search for an event"/>}
                        onChange={props.handleInputChange}
                    />
                    <Button variant="contained" sx={{flex: "0 0 auto"}} onClick={searchAndZoom}>Search</Button>
                </div>
                <svg ref={svgRef} width="90vw" height="70vh" style={{background: "#f0f0f0"}}>
                    {/* Render markers/periods first, then axis to bring axis forward in z-order */}
                    {visiblePeriods.map(period => (
                        <TimelinePeriodMarker
                            key={period.label + period.startDate.toISOString()}
                            period={period}
                            x={getTransformedXScale() ?? (() => 0)}
                        />
                    ))}
                    {visibleEvents.map(event => (
                        <EventMarker
                            key={event.label + event.date.toISOString()}
                            event={event}
                            x={getTransformedXScale() ?? (() => 0)}
                        />
                    ))}
                    <g ref={axisRef} transform={`translate(0,${timelineHeight / 2})`}/>
                </svg>
                <PeriodTooltip/>
            </div>
        </>
    );
});
