import React from 'react';
import { TimelinePeriod } from '../Entities/TimelinePeriod';
import {
  timelineHeight,
  txtColor2,
} from '../Constants/GlobalConfigConstants';

interface TimelinePeriodMarkerProps {
  period: TimelinePeriod;
  x: (date: Date) => number;
  loading?: boolean;
  onClick?: (
    event: React.MouseEvent<SVGRectElement | SVGTextElement>,
    data: TimelinePeriod,
  ) => void;
}

const TimelinePeriodMarker: React.FC<TimelinePeriodMarkerProps> = ({
  period,
  x,
  loading = false,
  onClick,
}) => {
  const rectX = x(period.startDate);
  const rectWidth = x(period.endDate) - x(period.startDate);
  const rectHeight = period.height;
  const labelX = period.labelX || rectX + rectWidth / 2;
  const labelY = period.labelY;

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
        onMouseOver={() => undefined}
        onMouseMove={() => undefined}
        onMouseOut={() => undefined}
        onClick={(e) => onClick?.(e, period)}
      />
      {period.labelVisible && !loading && (
        <text
          className="period-label"
          x={labelX}
          y={labelY}
          id={period.label}
          z={100}
          textAnchor="middle"
          fontSize={period.labelHeight}
          fill={txtColor2}
          style={{ cursor: 'default' }}
          // onMouseOver={e => onMouseOver?.(e, period)}
          // onMouseMove={e => onMouseMove?.(e, period)}
          // onMouseOut={e => onMouseOut?.(e, period)}
        >
          {period.label}
        </text>
      )}
    </>
  );
};

export default TimelinePeriodMarker;
