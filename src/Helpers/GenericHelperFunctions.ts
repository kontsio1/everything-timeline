import * as d3 from "d3";
import {TimelinePeriod} from "../Entities/TimelinePeriod";
import {TimelineEvent} from "../Entities/TimelineEvent";
import {count} from "d3";
import {seedEvents} from "../Constants/SeedEvents";
import {eventBoxMargin} from "../Constants/GlobalConfigConstants";

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

export function computeRelativePeriodForEvent(event: TimelineEvent) {
    const events = seedEvents;
    let isOverlapping = false;

        let a = event;
        let i = events.findIndex(e => e.label === a.label);
        let j = 0;
        while(j<events.length) {
            if( i === j ) {
                j += 1;
                continue;
            }
            const b = events[j];
            const A1x = a.boxX - a.boxWidth/2;
            let A1y = a.stemHeight
            const A2x = a.boxX + a.boxWidth/2;
            let A2y = a.stemHeight + a.boxHeight
            const B1x = b.boxX - b.boxWidth/2;
            const B2x = b.boxX + b.boxWidth/2;
            let B1y = b.stemHeight
            let B2y = b.stemHeight + b.boxHeight;

            const isOverlappingX = (A1x < B2x && A2x > B1x);
            const isOverlappingY = (A1y < B2y && A2y > B1y);
            isOverlapping = isOverlappingX && isOverlappingY;
            if (isOverlapping) {
                // console.log(`${a.label} is overlapping with ${b.label}: x,y`, isOverlappingX, isOverlappingY);
                b.stemHeight += 10;
            } else {
                j += 1;
            }
        }
}
export function computeEventsBBoxOverlaps(events: TimelineEvent[]): void {
    let isOverlapping = false;

    events.map((a, i) => {
        let j = i+1
        while(j<events.length) {
            if( i === j ) {
                j += 1;
                continue;
            }
            const b = events[j];
            const A1x = a.boxX - a.boxWidth/2 - eventBoxMargin;
            let A1y = a.stemHeight - eventBoxMargin
            const A2x = a.boxX + a.boxWidth/2 + eventBoxMargin;
            let A2y = a.stemHeight + a.boxHeight + eventBoxMargin;
            const B1x = b.boxX - b.boxWidth/2 - eventBoxMargin;
            const B2x = b.boxX + b.boxWidth/2  + eventBoxMargin;
            let B1y = b.stemHeight - eventBoxMargin;
            let B2y = b.stemHeight + b.boxHeight + eventBoxMargin;

            const isOverlappingX = (A1x < B2x && A2x > B1x);
            const isOverlappingY = (A1y < B2y && A2y > B1y);

            isOverlapping = isOverlappingX && isOverlappingY;
            if (isOverlapping) {
                if(b.label == "Founding of Rome") {
                    // console.log("Rome height because of overlap with: ", a.label, b.stemHeight +10);
                }
                b.stemHeight += 10;
            } else {
                j += 1;
            }
        };
    });
    
}

export function computePeriodsBBoxOverlaps(bboxes: DOMRect[], periods: TimelinePeriod[]): number[] {
    let isOverlapping = false;
    const corrections: number[] = new Array(bboxes.length).fill(0);
    
    bboxes.map((a, i) => {
        let j = 0;
        let count = 0
        while(j<bboxes.length) {
            count += 1;
            const periodA = periods[i];
            const periodB = periods[j];
            if( i === j ) {
                j += 1;
                continue;
            }
            
            const b = bboxes[j];
            const A2x = a.x + a.width;
            const B1x = b.x;
            // if(A2x < B1x) break doesn't work as they are not order by label start instead they are by marking start
            //undo correction to force recalculation of new labelYoffser (aka correction)
            const A1x = a.x;
            let A1y = a.y + corrections[i] - periodA.labelYoffset + periodA.addDistanceIfTooCloseToAxis(corrections[i])
            
            let A2y = a.y + a.height - periodA.labelYoffset + periodA.addDistanceIfTooCloseToAxis(corrections[i])
            
            const B2x = b.x + b.width;
            let B1y = b.y + corrections[j] - periodB.labelYoffset + periodB.addDistanceIfTooCloseToAxis(corrections[j])
            
            let B2y = b.y + b.height - periodB.labelYoffset + periodB.addDistanceIfTooCloseToAxis(corrections[j])
            
            const isOverlappingX = (A1x < B2x && A2x > B1x);
            const isOverlappingY = (A1y < B2y && A2y > B1y);
            
            isOverlapping = isOverlappingX && isOverlappingY;
            if (isOverlapping) {
                if(count < 5){
                    if(A1y>B1y) corrections[j] -= 10; //A lower -> move B up
                    if(A1y<=B1y) corrections[j] += 10; // A higher -> move B down
                }
                else if(count >= 5) { // if move B up doesn't work, move A down
                    if(corrections[j] < 0) corrections[j] = 0;
                    corrections[i] += 10;
                }
            } else {
                j += 1;
                count = 0
            }
        };
    });
    // console.log(corrections);
    return corrections
}

export function getYearLabel(year: number): string {
    if (year < 0) {
        return `${Math.abs(year)} BCE`;
    }
    if (year === 0) return "0";
    if (year > 0 && year < 1300) return `${year} AD`
    return `${year}`;
}

export function correctEntitiesByAxisOffset(e: TimelinePeriod[] | TimelineEvent[]): (TimelinePeriod | TimelineEvent)[] {
    return e.map((d: TimelinePeriod | TimelineEvent) => {
        if (d instanceof TimelinePeriod) {
            const originalStartDate = d.startDate;
            const originalEndDate = d.endDate;
            const dates = [originalStartDate, originalEndDate];
            const correctedDates = dates.map(date => {
                if (date.getFullYear() < 0) {
                    date.setFullYear(date.getFullYear());
                } else if (date.getFullYear() > 0) {
                    date.setFullYear(date.getFullYear());
                }
                return date;
            });
            d.startDate = correctedDates[0];
            d.endDate = correctedDates[1];
        }
        if (d instanceof TimelineEvent) {
            if (d.date.getFullYear() < 0) {
                d.date.setFullYear(d.date.getFullYear());
            } else if (d.date.getFullYear() > 0) {
                d.date.setFullYear(d.date.getFullYear());
            }
        }
        return d;
    })
}

export function sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9\-_:.]/g, "_");
}