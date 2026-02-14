import {BaseEvent} from "./BaseEvent";
import {stringToUnique01} from "../Helpers/LogarithmicScaleHelper";

export class TimelineEvent extends BaseEvent {
    date: Date;
    opacity: number = 0.3
    colour: string
    stemHeight: number
    radius: number = 6
    defaultHeight: number = 50;
    boxWidth: number = 0;
    boxHeight: number = 0;
    //left edge of the box, used for tooltip positioning
    boxX: number = 0;
    info?: string;
    
    constructor(date: number[], label: string, info?: string, colour?: string) { 
        super(label, colour);
        this.date = new Date(0);
        this.date.setFullYear(date[0], date[1] ?? 0, date[2] ?? 0);
        this.stemHeight = this.defaultHeight;
        this.colour = colour || "#" + Math.floor(stringToUnique01(this.label, 2) * 16777215).toString(16).padStart(6, "0");
        this.info = info || undefined;
    }
    public resetStemHeight(): void {
        this.stemHeight = this.defaultHeight;
    }
}