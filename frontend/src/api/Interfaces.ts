export interface IEventResponse {
    Id: string;
    DatasetId: string;
    Name: string;
    Info: string;
    Date: number;
}
export interface IPeriodResponse {
    Id: string;
    DatasetId: string;
    Name: string;
    Info: string;
    StartYear: number;
    EndYear: number;
}
export interface IDatasetResponse {
    Id: string;
    Name: string;
    CreatedBy: string;
    CreatedAt: Date;
    Value: number;
}