import React from "react";
import * as d3 from "d3";
import {
    bgColor,
    horizontalPaddingOfTimeline,
    timelineHeight,
    timelineWidth
} from "../Constants/GlobalConfigConstants";
import {getYearLabel} from "../Helpers/GenericHelperFunctions";
import "./TimelineHoverLine.css";

interface TimelineHoverLineProps {
    xScale: d3.ScaleTime<number, number, never> | null;
    hoverX: number | null;
    hoverY: number | null;
    isActive: boolean;
}

const TimelineHoverLine: React.FC<TimelineHoverLineProps> = ({xScale, hoverX, hoverY, isActive}) => {
    if (!xScale || hoverX == null || hoverY == null || !isActive) return null;

    const clampedX = Math.max(
        horizontalPaddingOfTimeline,
        Math.min(timelineWidth - horizontalPaddingOfTimeline, hoverX)
    );

    const dateAtCursor = xScale.invert(clampedX);
    const labelText = getYearLabel(dateAtCursor.getUTCFullYear());

    const fontSize = 12;
    const paddingX = 8;
    const paddingY = 4;
    const labelWidth = labelText.length * fontSize * 0.6 + paddingX * 2;
    const labelHeight = fontSize + paddingY * 2;

    const labelOffsetY = 28;
    const labelY = Math.max(6, hoverY - labelOffsetY - labelHeight);
    const labelX = clampedX - labelWidth / 2;
    
    const topLineEnd = Math.max(0, labelY);
    const bottomLineStart = Math.min(timelineHeight, labelY + labelHeight);

    return (
        <g className="timeline-hover-line" pointerEvents="none" z={-101}>
            <line
                className="timeline-hover-line-stroke"
                x1={clampedX}
                y1={0}
                x2={clampedX}
                y2={topLineEnd}
            />
            <line
                className="timeline-hover-line-stroke"
                x1={clampedX}
                y1={bottomLineStart}
                x2={clampedX}
                y2={timelineHeight}
            />
            <rect
                className="timeline-hover-label"
                x={labelX}
                y={labelY}
                width={labelWidth}
                height={labelHeight}
                rx={6}
                ry={6}
            />
            <text
                className="timeline-hover-label-text"
                x={clampedX}
                y={labelY + labelHeight / 2 + 1}
                textAnchor="middle"
                alignmentBaseline="middle"
                fill={bgColor}
            >
                {labelText}
            </text>
        </g>
    );
};

export default TimelineHoverLine;
