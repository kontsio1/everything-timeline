import React from "react";
import { TimelinePeriod } from "../Entities/TimelinePeriod";
import {timelineHeight, timelineWidth, txtColor2} from "../Constants/GlobalConfigConstants";

interface TimelinePeriodMarkerProps {
  period: TimelinePeriod;
  x: (date: Date) => number;
  onClick?: (event: React.MouseEvent<SVGRectElement | SVGTextElement>, data: TimelinePeriod) => void;
}

const TimelinePeriodMarker: React.FC<TimelinePeriodMarkerProps> = ({ period, x, onClick }) => {
  const rectX = x(period.startDate);
  const rectWidth = x(period.endDate) - x(period.startDate);
  const rectHeight = period.height;
  // labelX is the horizontal center of the period rectangle
  const labelX = rectX + rectWidth / 2;
  // labelY is calculated to keep the label vertically centered relative to the timeline axis
  const labelY = timelineHeight / 2 + rectHeight - 10 // keep label relative to center
    
  return (
    <>
      <rect
        className="period-marker"
        x={rectX}
        y={timelineHeight / 2}
        width={rectWidth}
        height={rectHeight}
        fill={period.colour}
        opacity={period.opacity * 0.3}
        id={period.label}
        onMouseOver={e => console.log("over")}
        onMouseMove={e =>  console.log("move")}
        onMouseOut={e => console.log("out")}
        onClick={e => onClick?.(e, period)}
      />
      <text
        className="period-label"
        x={labelX}
        y={labelY}
        id={period.label}
        z={100}
        textAnchor="middle"
        fontSize={(rectWidth > timelineWidth*0.03) ? 12 : 0}
        fill={txtColor2}
        style={{ cursor: "default" }}
        // onMouseOver={e => onMouseOver?.(e, period)}
        // onMouseMove={e => onMouseMove?.(e, period)}
        // onMouseOut={e => onMouseOut?.(e, period)}
      >
        {period.label}
      </text>
    </>
  );
};

export default TimelinePeriodMarker;
