import {stringToUnique01} from "../Helpers/LogarithmicScaleHelper";

export class BaseEvent {
    id: string;
    label: string;
    constructor(id: string, label: string, colour?: string) {
        this.id = id;
        this.label = label;
    }
}