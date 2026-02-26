export interface IApiEvent {
    id: string;
    datasetId: string;
    name: string;
    info: string;
    date: number;
}
export interface IApiPeriod {
    id: string;
    datasetId: string;
    name: string;
    info: string;
    startYear: number;
    endYear: number;
}
export interface IApiDataset {
    id: string;
    name: string;
    createdBy: string;
    createdAt: Date;
    value: number;
}