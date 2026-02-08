import * as d3 from "d3";
import React, {forwardRef, SyntheticEvent, useEffect, useImperativeHandle, useRef, useState} from "react";
import {seedEvents, seedPeriods} from "../Constants/SeedEvents";
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

const useStyles = makeStyles({
    timelineContainer: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignContent: 'space-around',
    },
});

interface TimelineComponentProps {
    handleInputChange: (event: SyntheticEvent, newValue: TimelineEvent[]) => void;
    handleSearch: () => void;
}

export interface TimelineComponentHandle {
    zoomToEvent: (date?: Date) => void;
}

export const TimelineComponent = forwardRef<TimelineComponentHandle, TimelineComponentProps>((props, ref) => {
    const classes = useStyles();
    const svgRef = useRef<SVGSVGElement>(null); // SVG ref for React-managed SVG
    const axisRef = useRef<SVGGElement>(null);
    const xScaleRef = useRef<d3.ScaleTime<number, number, never> | null>(null);

    const [visibleEvents, setVisibleEvents] = useState<TimelineEvent[]>([]);
    const [visiblePeriods, setVisiblePeriods] = useState<TimelinePeriod[]>([]);
    const [transform, setTransform] = useState<{ x: number, k: number }>({x: 0, k: 1}); //x axis panning & scale/zoom state

    const formatTicks = (domainValue: any) => {
        const date = domainValue instanceof Date ? domainValue : new Date(Number(domainValue));
        const year = date.getUTCFullYear();
        return getYearLabel(year)
    }

    // Create initial scale
    useEffect(() => {
        const x = d3.scaleTime()
            .domain(timelineInitialDomain)
            .range([100, timelineWidth - 50])
            .clamp(true);
        xScaleRef.current = x;
        setTransform({x: 0, k: 1});
        updatePeriods(x);
        updateEvents(x);
        if (!svgRef.current) return;
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([1, 1000])
            .translateExtent([[50, 0], [timelineWidth - 50, 0]])
            .extent([[50, 0], [timelineWidth - 50, timelineHeight]])
            .on("zoom", (event) => {
                setTransform({x: event.transform.x, k: event.transform.k});
                const newX = event.transform.rescaleX(xScaleRef.current!);
                updatePeriods(newX);
                updateEvents(newX);
                updateEvents(newX);
            });
        d3.select(svgRef.current).call(zoom);
    }, []);

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

    const events: TimelineEvent[] = seedEvents;
    const periods: TimelinePeriod[] = seedPeriods;
    computeRelativePeriodOverlaps(periods);

    const updateEvents = (newX: d3.ScaleTime<number, number, never>) => {
        const [domainStart, domainEnd] = newX.domain();
        events.forEach(p => p.resetStemHeight());
        const eventsInDomain = events.filter(p => p.date >= domainStart && p.date <= domainEnd);
        let filteredEvents = [...eventsInDomain];
        for (let i = 0; i < 2; i++) {
            computeEventsBBoxOverlaps(filteredEvents);
            computeEventsBBoxOverlaps(filteredEvents);
            filteredEvents = eventsInDomain.filter(e => e.stemHeight < timelineHeight / 2 - 70);
        }
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

    const handleZoom = (_event: any, date?: Date) => {
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
                        multiple={true}
                        sx={{flex: 1}}
                        options={events.map((e) => e)}
                        renderInput={(params) => <TextField {...params} label="Search for an event"/>}
                        onChange={props.handleInputChange}
                    />
                    <Button variant="contained" sx={{flex: "0 0 auto"}}
                            onClick={(e) => handleZoom(e, new Date(1453, 0, 1))}>Search</Button>
                </div>
                <svg ref={svgRef} width={timelineWidth + 50} height={timelineHeight} style={{background: "#f0f0f0"}}>
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
                {/*<EventTooltip/>*/}
            </div>
        </>
    );
});
