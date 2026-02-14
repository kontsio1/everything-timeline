import {LogarithmicScaleHelper, numberToUnique01, stringToUnique01} from "../Helpers/LogarithmicScaleHelper";
import {priorityOverlapBonuses, timelineHeight, timelineInitialDomain} from "../Constants/GlobalConfigConstants";
import {BaseEvent} from "./BaseEvent";
export class TimelinePeriod extends BaseEvent {
    startDate: Date;
    endDate: Date;
    colour: string;
    duration: number; //ms
    labelY: number
    opacity: number;
    minDuration: number = (1000 * 60 * 60 * 24) * 365 /12; // 1 year in milliseconds
    maxDuration: number = timelineInitialDomain[1].getTime()-timelineInitialDomain[0].getTime()
    height: number
    priority: number
    labelYoffset: number = 0;
    private readonly forcedPriority: number;
    overlap: number = 0;

    constructor(start: number[], end: number[], label: string, forcedPriority: number = 0, colour?: string) {
        super(label, colour)
        this.startDate = new Date(start[0], start[1]??0, start[2]??0);
        this.endDate = new Date(end[0], end[1]??0, end[2]??0);
        this.label = label;
        this.colour = colour || "#" + Math.floor(stringToUnique01(this.label, 1) * 16777215).toString(16).padStart(6, "0");
        this.duration = this.endDate.getTime() - this.startDate.getTime();
        this.opacity = this.getOpacity()
        this.height = this.getHeight()
        this.priority = this.getPriority();
        this.labelY = this.getLabelY();
        this.forcedPriority = forcedPriority;
    }
    private getOpacity(): number {
        const minOpacity = 0.1, maxOpacity = 0.8;
        const normalizeForDuration = new LogarithmicScaleHelper(this.minDuration, this.maxDuration, minOpacity, maxOpacity, true);
        return normalizeForDuration.logScale(this.duration);
    }
    private getHeight(): number {
        const minHeight = timelineHeight*0.08, maxHeight = timelineHeight*0.4;
        const normalizeForDuration = new LogarithmicScaleHelper(this.minDuration, this.maxDuration, minHeight, maxHeight)
        return normalizeForDuration.logScale(this.duration);
    }
    private getLabelY(): number {
        let distFromAxis = this.height - 5 + this.labelYoffset
        return timelineHeight/2 + distFromAxis + this.addDistanceIfTooCloseToAxis();
    }
    public addDistanceIfTooCloseToAxis(correctionApplied: number = 0): number {
        let distFromAxis = this.height - 5 + this.labelYoffset + correctionApplied;
        if( distFromAxis < 40 ) return 20
        else return 0
    }
    private getPriority(): number {
        const minPriority = 1, maxPriority = 10;
        const normalizeForDuration = new LogarithmicScaleHelper(this.minDuration, this.maxDuration, minPriority, maxPriority)
        const priorityBaseOnDuration = Number(normalizeForDuration.sqrtScale(this.duration).toFixed(3));
        return priorityBaseOnDuration + priorityBasedOnOverlap(this.overlap) + this.getForcedPriority();
        function priorityBasedOnOverlap(overlap: number): number {
            if(overlap == 0) return priorityOverlapBonuses[0]
            else if(overlap > 0 && overlap <= 100) return priorityOverlapBonuses[1]
            else if(overlap > 100 && overlap <= 200) return priorityOverlapBonuses[2]
            else if(overlap > 200 && overlap <= 300) return priorityOverlapBonuses[3]
            else if(overlap > 300) return priorityOverlapBonuses[4]
            return 0
        }
    }
    getForcedPriority(): number {
        return this.forcedPriority;
    }
    updateDuration(domain: Date[]): void {
        const domainStartDate = domain[0].getTime(); 
        const domainEndDate = domain[1].getTime(); 
        const periodStart = this.startDate.getTime(); 
        const periodEnd = this.endDate.getTime();
        
        const startInDomain = Math.max(periodStart, domainStartDate);
        const endInDomain = Math.min(periodEnd, domainEndDate);
        const delta = endInDomain - startInDomain;
        if (delta<0){
            console.log("No domain overlap for period: ", this.label, " in domain: ", domain);
            this.resetDuration()
        } else {
            this.duration = delta
        }
        this.maxDuration = domainEndDate - domainStartDate
    }
    resetDuration(): void {
        this.duration = this.endDate.getTime() - this.startDate.getTime();
    }
    updateVisualAttributesBasedOnDuration(): void {
        this.opacity = this.getOpacity();
        this.height = this.getHeight();
        this.priority = this.getPriority();
        // this.labelY = this.getLabelY();
    }
    updateLabelY(): void {
        this.labelY = this.getLabelY();
    }
}