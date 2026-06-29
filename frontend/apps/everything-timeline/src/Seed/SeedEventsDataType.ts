import {TimelineEvent} from "../Entities/TimelineEvent";

export interface SeedEventsData {
    Name: string,
    Value: SeedsEnum,
    Events: TimelineEvent[],
}

export enum SeedsEnum {
    DefaultEvents,
    UkEvents,
}