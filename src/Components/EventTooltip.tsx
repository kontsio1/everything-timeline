import React from "react";
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { getYearLabel } from "../Helpers/GenericHelperFunctions";
import { TimelineEvent } from "../Entities/TimelineEvent";

interface EventTooltipProps {
    event: TimelineEvent;
}

export const EventTooltip = ({ event }: EventTooltipProps) => {
    const year = getYearLabel(event.date.getUTCFullYear() + 1);
    return (
        <>
            <Typography variant="subtitle1" fontWeight="bold">{event.label}</Typography>
            <Typography variant="body2">{year}</Typography>
        </>
    );
};