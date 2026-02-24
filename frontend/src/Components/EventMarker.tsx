import React, { useState } from "react";
import Popover from '@mui/material/Popover';
import { TimelineEvent } from "../Entities/TimelineEvent";
import {bgColor, timelineHeight, txtColor, txtColor2} from "../Constants/GlobalConfigConstants";
import { EventTooltip } from "./EventTooltip";

interface EventMarkerProps {
  event: TimelineEvent;
  x: (date: Date) => number;
}

const EventMarker: React.FC<EventMarkerProps> = ({ event, x }) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<SVGSVGElement | null>(null);
  
  const timelineX = x(event.date);
  const baseY = timelineHeight / 2;

  const stem = {"top": baseY - event.stemHeight, "bottom": baseY - event.radius}; //minus goes up
    
  const textY = baseY - event.stemHeight - 8;
  const padding = 4;
  const fontSize = 12; //also eq to text height
  // Estimate text width (for simplicity, use label length * font size * factor)
  const textWidth = event.label.length * fontSize * 0.6;
  
  const rectWidth = textWidth + padding * 2;
  const rectHeight = fontSize + padding * 2;
  const rectX = timelineX - textWidth / 2 - padding;
  const rectY = textY - padding * 3;
  
  event.boxWidth = rectWidth;
  event.boxHeight = rectHeight;
  //left edge of the box, used for tooltip positioning
  event.boxX = rectX;
  
  const handleClick = (clickEvent: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    console.log("EventMarker clicked", event.boxX)
    setAnchorEl(clickEvent.currentTarget);
    setOpen(prev => !prev);
  }
  
  const handleClose = () => {
    setOpen(false);
  }
  const gradientId = `event-stem-gradient-${event.date.getTime()}`;
  const stemHeight = Math.abs(stem.bottom - stem.top);

  return (
    <>
      <svg
        onClick={handleClick}
        style={{ cursor: "pointer", background: '#222' }}
        width={window.innerWidth * 0.9}
        height={window.innerHeight * 0.7}
        viewBox={`0 0 ${window.innerWidth * 0.9} ${window.innerHeight * 0.7}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor={txtColor2} />
          </linearGradient>
        </defs>
        //actually draw the stem as a thin rectangle with the gradient fill, instead of a line, to allow for the gradient effect
        <rect x={timelineX + 0.25 } y={stem.top} height={stemHeight} width="0.5" fill={`url(#${gradientId})`} z={-10}/>
        <circle
          cx={timelineX}
          cy={baseY}
          r={event.radius}
          fill={event.colour}
          fillOpacity={0.2}
          stroke={txtColor2}
          strokeOpacity={event.opacity}
          z={100}
        />
        <line
          x1={timelineX}
          y1={stem.top}
          x2={timelineX}
          y2={stem.bottom}
          opacity={0}
          strokeWidth={0}
        />
        <rect
          width={rectWidth}
          height={rectHeight}
          x={rectX}
          y={rectY}
          fill={bgColor}
          strokeOpacity={event.opacity}
          stroke={event.colour}
          strokeWidth={1}
          rx={8}
          ry={8}
        />
        <text
          x={timelineX}
          y={textY}
          textAnchor="middle"
          fontSize={fontSize}
          alignmentBaseline="middle"
          fill={txtColor2}
        >
          {event.label}
        </text>
      </svg>
      <EventTooltip event={event} open={open} anchorEl={anchorEl} onClose={handleClose}/>
    </>
  );
};

export default EventMarker;
