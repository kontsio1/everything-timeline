import * as d3 from "d3";
import {TimelinePeriod} from "../Entities/TimelinePeriod";
import {TimelineEvent} from "../Entities/TimelineEvent";
import {
    defaultEventStemHeight,
    eventBoxMargin,
    timelineHeight,
    timelineTopEventsMargin, timelineWidth
} from "../Constants/GlobalConfigConstants";

export function moreYellow(colour: string) {
    const c = d3.color(colour);
    if (c && c instanceof d3.rgb) {
        // Increase red and green, clamp to 255
        c.r = Math.min(255, c.r + 30);
        c.g = Math.min(255, c.g + 30);
    }
    return c ? c.formatHex() : colour;
}

export function moreBlack(colour: string) {
    const c = d3.color(colour);
    if (c && c instanceof d3.hsl) {
        c.l = Math.max(0, c.l - 0.2);
    }
    return c ? c.formatHex() : colour;
}

export function moreWhite(colour: string) {
    const c = d3.color(colour);
    if (c && c instanceof d3.hsl) {
        c.l = Math.min(1, c.l + 0.2);
    }
    return c ? c.formatHex() : colour;
}

interface PeriodOverlap {
    label: string;
    overlap: number;
}

export function computeRelativePeriodOverlaps(periods: TimelinePeriod[]): PeriodOverlap[] {
    // Sort by startDate
    const sortedPeriods = periods.slice().sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    const overlaps: PeriodOverlap[] = sortedPeriods.map(p => ({label: p.label, overlap: 0}));
    const toYears = (1000 * 60 * 60 * 24) * 365

    for (let i = 0; i < sortedPeriods.length; i++) {
        const A = sortedPeriods[i];
        for (let j = i + 1; j < sortedPeriods.length; j++) {
            const B = sortedPeriods[j];
            if (B.startDate > A.endDate) break; // No overlap
            const A1 = A.startDate.getTime() / toYears;
            const A2 = A.endDate.getTime() / toYears;
            const B1 = B.startDate.getTime() / toYears;
            const B2 = B.endDate.getTime() / toYears;
            const overlapInMs = Math.min(A2, B2) - Math.max(A1, B1);
            const overlapPercentForA = overlapInMs / (A.duration / toYears) * 100
            const overlapPercentForB = overlapInMs / (B.duration / toYears) * 100
            overlaps[i].overlap += overlapPercentForA;
            overlaps[j].overlap += overlapPercentForB;
        }
    }
    overlaps.forEach((o, i) => {
        periods[i].overlap = o.overlap;
        // console.log(`${o.label}, Overlap: ${o.overlap.toFixed(0)}%`)
    });
    return overlaps; // Each index: total overlap percentage with others
}

export function computeEventPositionByLaneStrategy(events: TimelineEvent[]): void {
    const lane1start = defaultEventStemHeight;
    const topEventHeightLimit = timelineHeight / 2 - timelineTopEventsMargin;
    const laneHeight = 20 + eventBoxMargin; // height of event box + margin
    const noOfLanes =  Math.floor(Math.abs(lane1start - topEventHeightLimit)/laneHeight);
    const lanesHeights: number[] = [];
    events.forEach(e => e.stemHeight = -1);
    
    for (let i = 0; i < noOfLanes; i++) {
        lanesHeights.push(lane1start + i * laneHeight);
    }
    let timelineEnd = timelineWidth;
    
    lanesHeights.forEach((laneH) => {
        let cursorX = 0;
        var eventsInLane = events.filter(e => e.stemHeight == -1);
        console.log( "laneH:", laneH,"eventsInLane", eventsInLane);
        eventsInLane.forEach(e => {
            const boxStart = e.boxX;
            const boxEnd = e.boxX + e.boxWidth;
            if(boxStart > cursorX && boxEnd < timelineEnd) {
                console.log(`Placing ${e.label} at lane height: ${lanesHeights[0]}`);
                e.stemHeight = laneH;
                cursorX = boxEnd + eventBoxMargin;
            }
        });
    })
}

export function getYearLabel(year: number): string {
    if (year < 0) {
        return `${Math.abs(year)} BCE`;
    }
    if (year === 0) return "0";
    if (year > 0 && year < 1300) return `${year} AD`
    return `${year}`;
}