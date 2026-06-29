// import * as d3 from "d3";
// import React, {forwardRef, ReactNode, SyntheticEvent, useEffect, useImperativeHandle, useRef} from "react";
// import {seedEvents, seedPeriods} from "../Constants/SeedEvents";
// import {ScaleTime} from "d3";
// import {
//     ticksNo,
//     timelineHeight,
//     timelineInitialDomain,
//     timelineWidth,
//     noOfVisiblePeriods
// } from "../Constants/GlobalConfigConstants";
// import {TimelinePeriodFactory} from "./TimelinePeriodFactory";
// import {TimelinePeriod} from "../Entities/TimelinePeriod";
// import {TimelineEvent} from "../Entities/TimelineEvent";
// import {
//     computeEventsBBoxOverlaps,
//     computePeriodsBBoxOverlaps,
//     computeRelativePeriodOverlaps,
//     correctEntitiesByAxisOffset,
//     getYearLabel, sanitizeId
// } from "../Helpers/GenericHelperFunctions";
// import {PeriodTooltip} from "./PeriodTooltip";
// import {EventFactory} from "./EventFactory";
// import {EventTooltip} from "./EventTooltip";
// import Autocomplete from '@mui/material/Autocomplete';
// import {Button, TextField} from "@mui/material";
// import {makeStyles} from "@mui/styles";
//
// const useStyles = makeStyles({
//     timelineContainer: {
//         display: 'flex',
//         flexDirection: 'column',
//         flexWrap: 'wrap',
//         alignContent: 'space-around',
//     },
// });
//
// interface TimelineComponentProps {
//     handleInputChange: (event: SyntheticEvent, newValue: TimelineEvent[]) => void;
//     handleSearch: () => void;
// }
// export interface TimelineComponentHandle {
//     zoomToEvent: (date: Date) => void;
// }
//
// export const TimelineComponent2 = forwardRef<TimelineComponentHandle, TimelineComponentProps>((props, ref) => {
//     const svgRef = useRef<HTMLDivElement>(null);
//     const currentXScaleRef = useRef<ScaleTime<number, number, never>>(null);
//     const svgSelectionRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined>>(null);
//
//     const classes = useStyles();
//
//     const events: TimelineEvent[] = seedEvents
//     const periods: TimelinePeriod[] = seedPeriods
//     computeRelativePeriodOverlaps(periods)
//
//     const formatTicks = (domainValue: any) => {
//         const date = domainValue instanceof Date ? domainValue : new Date(Number(domainValue));
//         const year = date.getUTCFullYear();
//         return getYearLabel(year)
//     }
//
//     const updateEvents = (newX: ScaleTime<number, number, never>, svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
//         const markerFactory = new EventFactory(svg);
//         const [domainStart, domainEnd] = newX.domain();
//
//         events.forEach(p => {
//             p.resetStemHeight()
//         })
//         const eventsInDomain = events.filter(p => p.date >= domainStart && p.date <= domainEnd)
//
//         //automagically clears issues if you call it twice - or more???
//         let visibleEvents = [...eventsInDomain]
//         for (let i = 0; i < 2; i++) {
//             computeEventsBBoxOverlaps(visibleEvents)
//             computeEventsBBoxOverlaps(visibleEvents)
//             visibleEvents = eventsInDomain.filter(e => e.stemHeight < timelineHeight / 2 - 70);
//         }
//
//         markerFactory.updateEvents("event-marker", visibleEvents, newX);
//     }
//
//     const updatePeriods = (newX: ScaleTime<number, number, never>, svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
//         const [domainStart, domainEnd] = newX.domain();
//         // Filter periods that overlap with the visible domain
//         const periodsInDomain = periods.filter(p => p.endDate >= domainStart && p.startDate <= domainEnd)
//         // Update periods priority based on new duration in domain
//         periodsInDomain.forEach(period => {
//             period.updateDuration([domainStart, domainEnd])
//             period.updateVisualAttributesBasedOnDuration()
//         })
//
//         const topPriorityPeriods = periodsInDomain.sort((a, b) => b.priority - a.priority)
//             .slice(0, noOfVisiblePeriods);
//
//         const periodsByStartDate = topPriorityPeriods.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
//
//         const periodLabelBBoxes = periodsByStartDate.map(p => {
//             const node = svg.select(`.period-label[id="${p.label}"]`).node() as SVGGraphicsElement | null;
//             return node ? node.getBBox() : null;
//         }).filter(bbox => bbox !== null) as DOMRect[];
//
//         const calcLabelCorrections = computePeriodsBBoxOverlaps(periodLabelBBoxes, periodsByStartDate)
//
//         calcLabelCorrections.map((overlap, i) => {
//             periodsByStartDate[i].labelYoffset = overlap
//             periodsByStartDate[i].updateLabelY();
//         })
//
//         const periodByHeight = periodsByStartDate.sort((a, b) => b.height - a.height);
//
//         // Update period labels
//         const periodFactory = new TimelinePeriodFactory(svg);
//         periodFactory.updatePeriods(periodByHeight, newX)
//     }
//
//     const handleZoom = (event: any, baseDate?: Date) => {
//         let xScale: ScaleTime<number, number, never>;
//
//         if(baseDate){
//             let timelineCustomDomain = [
//                 new Date(baseDate.getFullYear() - 100, baseDate.getMonth(), baseDate.getDate()),
//                 new Date(baseDate.getFullYear() + 100, baseDate.getMonth(), baseDate.getDate())
//             ];
//             xScale = d3.scaleTime()
//                 .domain(timelineCustomDomain)
//                 .range([100, timelineWidth - 50])
//                 .clamp(true);
//         } else {
//             xScale = currentXScaleRef.current || d3.scaleTime()
//                 .domain(timelineInitialDomain)
//                 .range([100, timelineWidth - 50])
//                 .clamp(true);
//         }
//
//         const newX: ScaleTime<number, number, never> = event.transform.rescaleX(xScale);
//         currentXScaleRef.current = newX;
//
//         if (svgSelectionRef.current) {
//             const xAxisGroup = svgSelectionRef.current.select("g");
//             xAxisGroup.call(
//                 d3.axisBottom(newX)
//                     .ticks(ticksNo)
//                     .tickFormat(formatTicks)
//             );
//             updatePeriods(newX, svgSelectionRef.current)
//             updateEvents(newX, svgSelectionRef.current)
//             xAxisGroup.raise();
//         }
//     }
//
//     const zoomToDate = (date: Date) => {
//         if (!svgSelectionRef.current) return;
//
//         const timelineCustomDomain = [
//             new Date(date.getFullYear() - 100, date.getMonth(), date.getDate()),
//             new Date(date.getFullYear() + 100, date.getMonth(), date.getDate())
//         ];
//
//         const newXScale = d3.scaleTime()
//             .domain(timelineCustomDomain)
//             .range([100, timelineWidth - 50])
//             .clamp(true);
//
//         currentXScaleRef.current = newXScale;
//
//         const xAxisGroup = svgSelectionRef.current.select("g");
//         xAxisGroup.call(
//             d3.axisBottom(newXScale)
//                 .ticks(ticksNo)
//                 .tickFormat(formatTicks)
//         );
//
//         updatePeriods(newXScale, svgSelectionRef.current);
//         updateEvents(newXScale, svgSelectionRef.current);
//         xAxisGroup.raise();
//
//         // Update the zoom behavior
//         const zoom = d3.zoom<SVGSVGElement, unknown>()
//             .scaleExtent([1, 1000])
//             .translateExtent([[50, 0], [timelineWidth - 50, 0]])
//             .extent([[50, 0], [timelineWidth - 50, timelineHeight]])
//             .on("zoom", (zoomEvent) => handleZoom(zoomEvent, date));
//
//         svgSelectionRef.current.call(zoom);
//     }
//
//     const handleZoomOnElement = (event: SyntheticEvent, newValue: TimelineEvent[]) => {
//         props.handleInputChange(event, newValue);
//
//         if (newValue && newValue.length > 0) {
//             const firstSelectedEvent = newValue[0];
//             zoomToDate(firstSelectedEvent.date);
//         }
//     };
//
//     // Expose zoomToEvent through imperative handle
//     useImperativeHandle(ref, () => ({
//         zoomToEvent: (date: Date) => {
//             zoomToDate(date);
//         }
//     }));
//
//     useEffect(() => {
//         const x = d3.scaleTime()
//             .domain(timelineInitialDomain)
//             .range([100, timelineWidth - 50])
//             .clamp(true);
//
//         currentXScaleRef.current = x;
//         d3.select(svgRef.current).selectAll("*").remove();
//
//         const svg = d3.select(svgRef.current)
//             .append("svg")
//             .attr("width", timelineWidth + 50)
//             .attr("height", timelineHeight)
//             .style("background", "#f0f0f0") as d3.Selection<SVGSVGElement, unknown, null, undefined>;
//
//         svgSelectionRef.current = svg;
//
//         const xAxis = d3.axisBottom(x)
//             .ticks(ticksNo)
//             .tickFormat(formatTicks)
//
//         const xAxisGroup = svg.append("g")
//             .attr("transform", `translate(0,${timelineHeight - timelineHeight / 2})`)
//             .style("cursor", "default")
//             .call(xAxis)
//             .style("font-size", "13px");
//
//         const markerFactory = new EventFactory(svg);
//         markerFactory.updateEvents("event-marker", events, x);
//
//         updatePeriods(x, svg)
//         updateEvents(x, svg)
//
//         xAxisGroup.raise()
//
//         const zoom = d3.zoom<SVGSVGElement, unknown>()
//             .scaleExtent([1, 1000])
//             .translateExtent([[50, 0], [timelineWidth - 50, 0]])
//             .extent([[50, 0], [timelineWidth - 50, timelineHeight]])
//             .on("zoom", handleZoom);
//
//         svg.call(zoom);
//     }, []);
//
//     return (
//         <>
//             <h1>Timeline of Everything</h1>
//             <div className={classes.timelineContainer}>
//                 <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
//                     <Autocomplete
//                         multiple={true}
//                         sx={{ flex: 1 }}
//                         options={events.map((e) => e)}
//                         renderInput={(params) => <TextField {...params} label="Search for an event" />}
//                         onChange={handleZoomOnElement}
//                     />
//                     <Button variant="contained" sx={{ flex: "0 0 auto" }} onClick={props.handleSearch}>Search</Button>
//                 </div>
//                 <div ref={svgRef}/>
//                 <PeriodTooltip/>
//                 <EventTooltip/>
//             </div>
//         </>
//     );
// });
export const testComponent = () => {
    return <div>Test Component</div>;
}