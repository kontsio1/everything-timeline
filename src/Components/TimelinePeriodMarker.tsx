import React from "react";
import { TimelinePeriod } from "../Entities/TimelinePeriod";
import { timelineHeight } from "../Constants/GlobalConfigConstants";

interface TimelinePeriodMarkerProps {
  period: TimelinePeriod;
  x: (date: Date) => number;
  onMouseOver?: (event: React.MouseEvent<SVGRectElement | SVGTextElement>, data: TimelinePeriod) => void;
  onMouseMove?: (event: React.MouseEvent<SVGRectElement | SVGTextElement>, data: TimelinePeriod) => void;
  onMouseOut?: (event: React.MouseEvent<SVGRectElement | SVGTextElement>, data: TimelinePeriod) => void;
  onClick?: (event: React.MouseEvent<SVGRectElement | SVGTextElement>, data: TimelinePeriod) => void;
}

const TimelinePeriodMarker: React.FC<TimelinePeriodMarkerProps> = ({ period, x, onMouseOver, onMouseMove, onMouseOut, onClick }) => {
  const rectX = x(period.startDate);
  const rectWidth = x(period.endDate) - x(period.startDate);
  const rectHeight = period.height;
  // labelX is the horizontal center of the period rectangle
  const labelX = rectX + rectWidth / 2;
  // labelY is calculated to keep the label vertically centered relative to the timeline axis
  const labelY = timelineHeight / 2 + (period.labelY - timelineHeight / 2); // keep label relative to center
    
  return (
    <>
      <rect
        className="period-marker"
        x={rectX}
        y={timelineHeight / 2}
        width={rectWidth}
        height={rectHeight}
        fill={period.colour}
        opacity={period.opacity}
        id={period.label}
        onMouseOver={e => onMouseOver?.(e, period)}
        onMouseMove={e => onMouseMove?.(e, period)}
        onMouseOut={e => onMouseOut?.(e, period)}
        onClick={e => onClick?.(e, period)}
      />
      <text
        className="period-label"
        x={labelX}
        y={labelY}
        id={period.label}
        textAnchor="middle"
        fontSize={12}
        fill="black"
        style={{ cursor: "default" }}
        onMouseOver={e => onMouseOver?.(e, period)}
        onMouseMove={e => onMouseMove?.(e, period)}
        onMouseOut={e => onMouseOut?.(e, period)}
      >
        {period.label}
      </text>
    </>
  );
};

export default TimelinePeriodMarker;
