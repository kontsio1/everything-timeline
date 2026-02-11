import {stringToUnique01} from "../Helpers/LogarithmicScaleHelper";

export class BaseEvent {
    label: string;
    constructor(label: string, colour?: string) {
        this.label = label;
    }
}