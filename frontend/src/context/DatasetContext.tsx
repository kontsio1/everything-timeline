import React, { createContext, useContext, useState, ReactNode } from 'react';
import { IDatasetResponse } from '../api/Interfaces';

const SELECTED_DATASET_KEY = 'everythingTimeline_selectedDatasetId';

interface DatasetContextType {
    datasets: IDatasetResponse[];
    setDatasets: (datasets: IDatasetResponse[]) => void;
    isInitialized: boolean;
    setIsInitialized: (initialized: boolean) => void;
    selectedDatasetId: string | null;
    setSelectedDatasetId: (id: string | null) => void;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

interface DatasetProviderProps {
    children: ReactNode;
}

export const DatasetProvider: React.FC<DatasetProviderProps> = ({ children }) => {
    const [datasets, setDatasets] = useState<IDatasetResponse[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [selectedDatasetId, setSelectedDatasetIdState] = useState<string | null>(
        () => sessionStorage.getItem(SELECTED_DATASET_KEY)
    );

    const setSelectedDatasetId = (id: string | null) => {
        setSelectedDatasetIdState(id);
        if (id === null) {
            sessionStorage.removeItem(SELECTED_DATASET_KEY);
        } else {
            sessionStorage.setItem(SELECTED_DATASET_KEY, id);
        }
    };

    return (
        <DatasetContext.Provider value={{ datasets, setDatasets, isInitialized, setIsInitialized, selectedDatasetId, setSelectedDatasetId }}>
            {children}
        </DatasetContext.Provider>
    );
};

export const useDatasetContext = (): DatasetContextType => {
    const context = useContext(DatasetContext);
    if (context === undefined) {
        throw new Error('useDatasetContext must be used within a DatasetProvider');
    }
    return context;
};

