import * as d3 from "d3";
import React, {forwardRef, SyntheticEvent, useEffect, useRef, useState, useImperativeHandle} from "react";
import {
    ticksNo,
    timelineHeight,
    timelineInitialDomain,
    timelineWidth,
    noOfVisiblePeriods, horizontalPaddingOfTimeline, bgColor, txtColor
} from "../Constants/GlobalConfigConstants";
import {TimelinePeriod} from "../Entities/TimelinePeriod";
import {TimelineEvent} from "../Entities/TimelineEvent";
import {
    computeEventPositionByLaneStrategy,
    computeRelativePeriodOverlaps,
    getYearLabel
} from "../Helpers/GenericHelperFunctions";
import {PeriodTooltip} from "./PeriodTooltip";
import {makeStyles} from "@mui/styles";
import TimelinePeriodMarker from "./TimelinePeriodMarker";
import EventMarker from "./EventMarker";
import {svg} from "d3";
import './Header.css';

const useStyles = makeStyles({
    timelineContainer: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignContent: 'space-around',
    },
});

interface TimelineComponentProps {
    events: TimelineEvent[];
    periods: TimelinePeriod[];
    selectedDatabase: string | null;
    selectedEvent: TimelineEvent | null;
    onDatabaseChange: (event: SyntheticEvent, value: string | null) => void;
    onEventSearch: (event: SyntheticEvent, newValue: TimelineEvent | null) => void;
    onAddEvent: () => void;
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
            d3.select(axisRef.current).selectAll(".domain")
                .attr("stroke", `url(#${axisGradientId})`)
                .attr("stroke-width", 3);
            d3.select(axisRef.current).selectAll(".tick text")
                .attr("fill", txtColor)
                .attr("dy", "1.71em");
            d3.select(axisRef.current).selectAll(".tick line")
                .attr("stroke", txtColor);
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
        recalculateEventBoxes(events, newX);
        const [domainStart, domainEnd] = newX.domain();
        const eventsInDomain = events.filter(p => p.date >= domainStart && p.date <= domainEnd);
        computeEventPositionByLaneStrategy(eventsInDomain);
        let filteredEvents = eventsInDomain.filter(e => e.stemHeight != -1);
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

    // Add gradient definition for tick stems and axis line
    const axisGradientId = "axis-bar-gradient";

    // Expose zoomToEvent via ref
    useImperativeHandle(ref, () => ({
        zoomToEvent(date?: Date) {
            if (!date || !xScaleRef.current || !svgRef.current) return;
            const xScale = xScaleRef.current;
            const targetX = xScale(date);
            const centerX = timelineWidth / 2;
            const zoomLevel = 7;
            const translateX = centerX - targetX * zoomLevel;
            const targetTransform = d3.zoomIdentity.translate(translateX, 0).scale(zoomLevel);
            const svgSelection = d3.select(svgRef.current);
            const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
                .scaleExtent([1, 1000])
                .translateExtent([[horizontalPaddingOfTimeline, 0], [timelineWidth - horizontalPaddingOfTimeline, 0]])
                .extent([[50, 0], [timelineWidth - 50, timelineHeight]])
                .on("zoom", (event) => {
                    setTransform({x: event.transform.x, k: event.transform.k});
                    const newX = event.transform.rescaleX(xScaleRef.current!);
                    updatePeriods(newX);
                    updateEvents(newX);
                });
            svgSelection.call(zoomBehavior);
            svgSelection.transition()
                .duration(1200)
                .call(zoomBehavior.transform, targetTransform);
        }
    }));

    return (
        <>
            <div className={classes.timelineContainer}>
                <svg ref={svgRef} width="90vw" height="70vh" style={{background: bgColor}}>
                    {/* Gradient definitions for tick stems and axis line */}
                    <defs>
                        <linearGradient id={axisGradientId} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="transparent" />
                            <stop offset="5%" stopColor={txtColor} stopOpacity="0.15" />
                            <stop offset="95%" stopColor={txtColor} stopOpacity="0.15" />
                            <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                    </defs>
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
