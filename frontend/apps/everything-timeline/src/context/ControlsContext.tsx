import React, {createContext, useContext, useEffect, useMemo, useState} from "react";
import {deriveDefaultEventStemHeight, defaultLaneHeightPadding, ticksNo as defaultTicksNo} from "../Constants/GlobalConfigConstants";

const controlsStorageKey = "everythingTimeline_controls";

export interface ControlsState {
    hoverLineEnabled: boolean;
    visibleEventsLaneHeightPadding: number;
    defaultEventStemHeight: number;
    ticksNo: number;
}

interface ControlsContextType {
    controls: ControlsState;
    setControls: React.Dispatch<React.SetStateAction<ControlsState>>;
    setHoverLineEnabled: (enabled: boolean) => void;
    setVisibleEventsLaneHeightPadding: (padding: number) => void;
    setTicksNo: (ticks: number) => void;
}

const defaultControls: ControlsState = {
    hoverLineEnabled: true,
    visibleEventsLaneHeightPadding: defaultLaneHeightPadding,
    defaultEventStemHeight: deriveDefaultEventStemHeight(defaultLaneHeightPadding),
    ticksNo: defaultTicksNo,
};

const ControlsContext = createContext<ControlsContextType | undefined>(undefined);

interface ControlsProviderProps {
    children: React.ReactNode;
}

const readStoredControls = (): ControlsState => {
    if (typeof window === "undefined") {
        return defaultControls;
    }
    try {
        const stored = window.sessionStorage.getItem(controlsStorageKey);
        if (!stored) return defaultControls;
        const parsed = JSON.parse(stored) as Partial<ControlsState>;
        return {
            ...defaultControls,
            ...parsed,
        };
    } catch {
        return defaultControls;
    }
};

export const ControlsProvider: React.FC<ControlsProviderProps> = ({children}) => {
    const [controls, setControls] = useState<ControlsState>(() => readStoredControls());

    useEffect(() => {
        if (typeof window === "undefined") return;
        window.sessionStorage.setItem(controlsStorageKey, JSON.stringify(controls));
    }, [controls]);

    const setHoverLineEnabled = (enabled: boolean) => {
        setControls(prev => ({
            ...prev,
            hoverLineEnabled: enabled,
        }));
    };

    const setVisibleEventsLaneHeightPadding = (padding: number) => {
        const derivedStemHeight = deriveDefaultEventStemHeight(padding);
        setControls(prev => ({
            ...prev,
            visibleEventsLaneHeightPadding: padding,
            defaultEventStemHeight: derivedStemHeight,
        }));
    };

    const setTicksNo = (ticks: number) => {
        setControls(prev => ({
            ...prev,
            ticksNo: ticks,
        }));
    };

    const value = useMemo(() => ({
        controls,
        setControls,
        setHoverLineEnabled,
        setVisibleEventsLaneHeightPadding,
        setTicksNo,
    }), [controls]);

    return (
        <ControlsContext.Provider value={value}>
            {children}
        </ControlsContext.Provider>
    );
};

export const useControlsContext = (): ControlsContextType => {
    const context = useContext(ControlsContext);
    if (!context) {
        throw new Error("useControlsContext must be used within a ControlsProvider");
    }
    return context;
};
