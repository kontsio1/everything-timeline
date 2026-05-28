export interface IEventAddRequest {
    Date: number;
    Name: string;
    Info: string;
    DatasetId: string;
}
export interface IEventResponse {
    Id: string;
    DatasetId: string;
    Name: string;
    Info: string;
    Date: number;
}

export interface IEventUpdateRequest {
    Event: {
        Id: string;
        Date: number;
        Name: string;
        Info: string;
        DatasetId: string;
    };
}

export interface IEventDeleteRequest {
    Event: {
        Id: string;
        Date: number;
        Name: string;
        Info: string;
        DatasetId: string;
    };
}

export interface IDatasetAddRequest {
    Name: string;
    Description: string;
}
export interface IDatasetResponse {
    Id: string;
    Name: string;
    Description: string;
    CreatedBy: string;
    CreatedAt: Date;
}

export interface IPeriodResponse {
    Id: string;
    DatasetId: string;
    Name: string;
    Info: string;
    StartYear: number;
    EndYear: number;
}

export interface IUserResponse {
    userId?: string;
    email?: string;
    name?: string;
}