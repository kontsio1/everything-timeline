import * as d3 from "d3";
import React, {forwardRef, SyntheticEvent, useEffect, useRef, useState, useImperativeHandle} from "react";
import {
    ticksNo,
    timelineHeight,
    timelineInitialDomain,
    timelineWidth,
    noOfVisiblePeriods, horizontalPaddingOfTimeline, bgColor, txtColor, zoomToEventDuration
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
import EventComponent from "./EventComponent";
import TimelineHoverLine from "./TimelineHoverLine";
import './Header.css';

const useStyles = makeStyles({
    timelineContainer: {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignContent: 'space-around',
    },
});

export interface TimelineComponentProps {
    events: TimelineEvent[];
    periods: TimelinePeriod[];
    selectedDatabase: string | null;
    highlightedEventKey: string | null;
    pulseEventKey: string | null;
    onDatabaseChange: (event: SyntheticEvent, value: string | null) => void;
    onEventSearch: (event: SyntheticEvent, newValue: TimelineEvent | null) => void;
    onEventSelect?: (event: TimelineEvent) => void;
    loading: boolean;
    hoverLineEnabled: boolean;
}

export interface TimelineComponentHandle {
    zoomToEvent: (event?: TimelineEvent) => void;
}

export const TimelineComponent = forwardRef<TimelineComponentHandle, TimelineComponentProps>(function TimelineComponent(props, ref) {
    const classes = useStyles();
    const {events, periods, loading, onEventSelect} = props;
    const svgRef = useRef<SVGSVGElement>(null); // SVG ref for React-managed SVG
    const axisRef = useRef<SVGGElement>(null);
    const xScaleRef = useRef<d3.ScaleTime<number, number, never> | null>(null);

    const [visibleEvents, setVisibleEvents] = useState<TimelineEvent[]>([]);
    const [visiblePeriods, setVisiblePeriods] = useState<TimelinePeriod[]>([]);
    const [transform, setTransform] = useState<{ x: number, k: number }>({x: 0, k: 1}); //x axis panning & scale/zoom state
    const [renderEvents, setRenderEvents] = useState<{ event: TimelineEvent; fade: "enter" | "stable" }[]>([]);
    const [hoverX, setHoverX] = useState<number | null>(null);
    const [hoverY, setHoverY] = useState<number | null>(null);
    const [isHoveringTimeline, setIsHoveringTimeline] = useState(false);

    const getEventKey = (event: TimelineEvent) => `${event.label}-${event.date.toISOString()}`;

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
            const axisSelection = d3.select(axisRef.current)
                .call(d3.axisBottom(xScale)
                    .ticks(ticksNo) 
                    .tickFormat(formatTicks));

            axisSelection.selectAll(".domain")
                .attr("stroke", `url(#${axisGradientId})`)
                .attr("stroke-width", 3);

            // Keep tick styling consistent
            axisSelection.selectAll(".tick text")
                .attr("fill", txtColor)
                .attr("dy", "1.71em");
            axisSelection.selectAll(".tick line")
                .attr("stroke", txtColor);
        }
    }, [transform, visibleEvents, visiblePeriods, loading]);

    useEffect(() => {
        setRenderEvents(prev => {
            const prevByKey = new Map(prev.map(item => [getEventKey(item.event), item]));
            return visibleEvents.map(event => {
                const key = getEventKey(event);
                const previous = prevByKey.get(key);
                return {event, fade: previous ? "stable" : "enter"};
            });
        });
    }, [visibleEvents]);

    useEffect(() => {
        const hasEntering = renderEvents.some(item => item.fade === "enter");
        if (!hasEntering) return;
        const rafId = window.requestAnimationFrame(() => {
            setRenderEvents(prev => prev.map(item => item.fade === "enter" ? {...item, fade: "stable"} : item));
        });
        return () => window.cancelAnimationFrame(rafId);
    }, [renderEvents]);


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
        if (events == null) return;
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
    const periodMaskId = "period-edge-fade-mask";
    const periodMaskGradientId = "period-mask-gradient";

    const handleTimelineMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        setHoverX(event.clientX - rect.left);
        setHoverY(event.clientY - rect.top);
        setIsHoveringTimeline(true);
    };

    const handleTimelineMouseLeave = () => {
        setIsHoveringTimeline(false);
    };

    // Expose zoomToEvent via ref
    useImperativeHandle(ref, () => ({
        zoomToEvent(event?: TimelineEvent) {
            const date = event?.date;
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
                .duration(zoomToEventDuration)
                .call(zoomBehavior.transform, targetTransform);
        }
    }));

    return (
        <>
            <div className={classes.timelineContainer}>
                <svg
                    ref={svgRef}
                    width="90vw"
                    height="70vh"
                    style={{background: bgColor}}
                    onMouseMove={handleTimelineMouseMove}
                    onMouseLeave={handleTimelineMouseLeave}
                >
                    {/* Gradient definitions for tick stems and axis line */}
                    <defs>
                        <linearGradient id={axisGradientId} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="transparent" />
                            <stop offset="5%" stopColor={txtColor} stopOpacity="0.15" />
                            <stop offset="95%" stopColor={txtColor} stopOpacity="0.15" />
                            <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                        
                        {/* Gradient for axis loading animation - white line faded on edges */}
                        <linearGradient id="axis-loading-gradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="white" stopOpacity="0" />
                            <stop offset="20%" stopColor="white" stopOpacity="0.9" />
                            <stop offset="50%" stopColor="white" stopOpacity="1" />
                            <stop offset="80%" stopColor="white" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="white" stopOpacity="0" />
                        </linearGradient>
                        
                        {/* Gradient for period edge fade mask */}
                        <linearGradient id={periodMaskGradientId} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="white" stopOpacity="0" />
                            <stop offset="5%" stopColor="white" stopOpacity="1" />
                            <stop offset="95%" stopColor="white" stopOpacity="1" />
                            <stop offset="100%" stopColor="white" stopOpacity="0" />
                        </linearGradient>
                        
                        {/* Mask that applies edge fade to periods */}
                        <mask id={periodMaskId}>
                            <rect 
                                x={horizontalPaddingOfTimeline} 
                                y="0" 
                                width={timelineWidth - 2 * horizontalPaddingOfTimeline} 
                                height={timelineHeight} 
                                fill={`url(#${periodMaskGradientId})`}
                            />
                        </mask>
                    </defs>
                    {/* Render markers/periods first, then axis to bring axis forward in z-order */}
                    <g mask={`url(#${periodMaskId})`}>
                        {visiblePeriods.map(period => (
                            <TimelinePeriodMarker
                                key={period.label + period.startDate.toISOString()}
                                period={period}
                                x={getTransformedXScale() ?? (() => 0)}
                            />
                        ))}
                    </g>
                    <g mask={`url(#${periodMaskId})`}>
                        {renderEvents.map(item => (
                            <EventComponent
                                key={getEventKey(item.event)}
                                event={item.event}
                                x={getTransformedXScale() ?? (() => 0)}
                                onSelect={onEventSelect}
                                fadeState={item.fade}
                                isHighlighted={getEventKey(item.event) === props.highlightedEventKey}
                                shouldPulse={getEventKey(item.event) === props.pulseEventKey}
                            />
                        ))}
                    </g>
                    {props.hoverLineEnabled && (
                        <TimelineHoverLine
                            xScale={getTransformedXScale()}
                            hoverX={hoverX}
                            hoverY={hoverY}
                            isActive={isHoveringTimeline && !loading}
                        />
                    )}
                    <g ref={axisRef} transform={`translate(0,${timelineHeight / 2})`}/>
                    {/* Loading animation - white line moving across the axis */}
                    {loading && (
                        <rect
                            className="axis-loading-line"
                            x={horizontalPaddingOfTimeline}
                            y={timelineHeight / 2 - 2}
                            width={120}
                            height={4}
                            fill="url(#axis-loading-gradient)"
                        />
                    )}
                </svg>
                <PeriodTooltip/>
            </div>
        </>
    );
});
