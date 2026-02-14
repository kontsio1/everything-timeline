import React, { useState } from "react";
import Popover from '@mui/material/Popover';
import { TimelineEvent } from "../Entities/TimelineEvent";
import { timelineHeight } from "../Constants/GlobalConfigConstants";
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

  return (
    <>
      <svg
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      >
        <circle
          cx={timelineX}
          cy={baseY}
          r={event.radius}
          fill={event.colour}
          opacity={event.opacity}
          stroke="black"
          z={100}
        />
        <line
          x1={timelineX}
          y1={stem.top}
          x2={timelineX}
          y2={stem.bottom}
          opacity={event.opacity}
          strokeWidth={0.4}
          stroke="black"
        />
        <rect
          width={rectWidth}
          height={rectHeight}
          x={rectX}
          y={rectY}
          fill={event.colour}
          opacity={event.opacity}
          stroke="black"
          rx={8}
          ry={8}
        />
        <text
          x={timelineX}
          y={textY}
          textAnchor="middle"
          fontSize={fontSize}
          alignmentBaseline="middle"
        >
          {event.label}
        </text>
      </svg>
      <EventTooltip event={event} open={open} anchorEl={anchorEl} onClose={handleClose}/>
    </>
  );
};

export default EventMarker;
