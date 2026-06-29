import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { IDatasetResponse } from '../api/Interfaces';
import { timelineInitialDomain } from '../Constants/GlobalConfigConstants';

const SELECTED_DATASET_KEY = 'everythingTimeline_selectedDatasetId';

interface DatasetContextType {
    datasets: IDatasetResponse[];
    setDatasets: (datasets: IDatasetResponse[]) => void;
    isInitialized: boolean;
    setIsInitialized: (initialized: boolean) => void;
    selectedDatasetId: string | null;
    setSelectedDatasetId: (id: string | null) => void;
    activeDomain: [Date, Date];
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

    const activeDomain = useMemo<[Date, Date]>(() => {
        const dataset = selectedDatasetId ? datasets.find(d => d.Id === selectedDatasetId) : null;
        if (!dataset) return timelineInitialDomain as [Date, Date];
        // Use setFullYear() instead of new Date(year, ...) to correctly handle years 0–99.
        // The Date(year, month, day) constructor treats 0–99 as 1900+year (e.g. year 1 → 1901).
        const makeYear = (year: number): Date => {
            const d = new Date(0);
            d.setFullYear(year, 0, 1);
            return d;
        };
        return [makeYear(dataset.DomainStart), makeYear(dataset.DomainEnd + 1)];
    }, [selectedDatasetId, datasets]);

    return (
        <DatasetContext.Provider value={{ datasets, setDatasets, isInitialized, setIsInitialized, selectedDatasetId, setSelectedDatasetId, activeDomain }}>
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

