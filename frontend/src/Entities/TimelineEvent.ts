import {BaseEvent} from "./BaseEvent";
import {stringToUnique01} from "../Helpers/LogarithmicScaleHelper";
import {defaultEventStemHeight} from "../Constants/GlobalConfigConstants";

export class TimelineEvent extends BaseEvent {
    date: Date;
    opacity: number = 0.3
    colour: string
    stemHeight: number
    radius: number = 6
    defaultHeight: number = defaultEventStemHeight;
    boxWidth: number = 0;
    boxHeight: number = 0;
    //left edge of the box, used for tooltip positioning
    boxX: number = 0;
    info?: string;
    padding: number = 4;
    
    constructor(date: number[], label: string, info?: string, colour?: string) { 
        super(label, colour);
        this.date = new Date(0);
        this.date.setFullYear(date[0], date[1] ?? 0, date[2] ?? 0);
        this.stemHeight = this.defaultHeight;
        this.colour = colour || "#" + Math.floor(stringToUnique01(this.label, 2) * 16777215).toString(16).padStart(6, "0");
        this.info = info || undefined;
        this.boxWidth = this.rectWidth();
    }
    public resetStemHeight(): void {
        this.stemHeight = this.defaultHeight;
    }
    public rectWidth(): number {
        const fontSize = 12; //also eq to text height
        // Estimate text width (for simplicity, use label length * font size * factor)
        const textWidth = this.label.length * fontSize * 0.6;
        return (textWidth + this.padding * 2);
    }
}