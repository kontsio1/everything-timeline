export interface IApiEvent {
    Id: string;
    DatasetId: string;
    Name: string;
    Info: string;
    Date: number;
}
export interface IApiPeriod {
    Id: string;
    DatasetId: string;
    Name: string;
    Info: string;
    StartYear: number;
    EndYear: number;
}
export interface IApiDataset {
    Id: string;
    Name: string;
    CreatedBy: string;
    CreatedAt: Date;
    Value: number;
}