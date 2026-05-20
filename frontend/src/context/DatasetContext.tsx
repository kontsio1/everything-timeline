import React, { createContext, useContext, useState, ReactNode } from 'react';
import { IDatasetResponse } from '../api/Interfaces';

interface DatasetContextType {
    datasets: IDatasetResponse[];
    setDatasets: (datasets: IDatasetResponse[]) => void;
    isInitialized: boolean;
    setIsInitialized: (initialized: boolean) => void;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

interface DatasetProviderProps {
    children: ReactNode;
}

export const DatasetProvider: React.FC<DatasetProviderProps> = ({ children }) => {
    const [datasets, setDatasets] = useState<IDatasetResponse[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    return (
        <DatasetContext.Provider value={{ datasets, setDatasets, isInitialized, setIsInitialized }}>
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

