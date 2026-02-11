import {colourSeed, colourSeedStr, logScaleExponent} from "../Constants/GlobalConfigConstants";

export class LogarithmicScaleHelper {
    private minValue: number; // Default minimum value for logarithmic scale
    private maxValue: number;
    private minScaledValue: number;
    private maxScaledValue: number;
    private inverseScale: boolean = false;
    constructor(minValue: number, maxValue: number, minScaledValue: number = 0, maxScaledValue: number = 1, inverseScale: boolean = false) {
        this.minScaledValue = minScaledValue;
        this.maxScaledValue = maxScaledValue;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.inverseScale = inverseScale;
    }
    public logScale(originalValue: number) {
        const logValue = Math.log10(originalValue);
        const logMin = Math.log10(this.minValue);
        const logMax = Math.log10(this.maxValue);
        let normalized = (logValue - logMin) / (logMax - logMin);
        normalized = Math.max(0, Math.min(1, normalized)); // Clamp to [0,1]
        const exponent = logScaleExponent;
        if (this.inverseScale) {
            normalized = 1 - Math.pow(normalized, exponent);
        } else {
            normalized = Math.pow(normalized, exponent);
        }
        return this.minScaledValue + normalized * (this.maxScaledValue - this.minScaledValue);
    }
    public sqrtScale(originalValue: number) {
        const sqrtValue = Math.sqrt(originalValue);
        const sqrtMin = Math.sqrt(this.minValue);
        const sqrtMax = Math.sqrt(this.maxValue);
        let normalized = (sqrtValue - sqrtMin) / (sqrtMax - sqrtMin);
        normalized = Math.max(0, Math.min(1, normalized)); // Clamp to [0,1]
        return this.minScaledValue + normalized * (this.maxScaledValue - this.minScaledValue);
    }
}

export function  numberToUnique01(num: number) {
    // takes any number and returbns a pseudo-random number between 0 and 1
    return (Math.sin(num * colourSeed) + 1) / 2;
}
export function stringToUnique01(str: string, seedNo: number): number {
    // Simple hash function to convert string to a number
    str = str + colourSeedStr[seedNo-1]
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    // Use the same formula as numberToUnique01
    return (Math.sin(hash * colourSeed) + 1) / 2;
}