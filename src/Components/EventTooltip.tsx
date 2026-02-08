import React, {useEffect} from "react";
import Typography from '@mui/material/Typography';
import {getYearLabel} from "../Helpers/GenericHelperFunctions";
import {TimelineEvent} from "../Entities/TimelineEvent";
import {Box, Fade, Popper, PopperPlacementType} from "@mui/material";

interface EventTooltipProps {
    event: TimelineEvent;
    open: boolean;
    anchorEl: SVGSVGElement | null;
}

export const EventTooltip = ({event, open, anchorEl}: EventTooltipProps) => {
    const year = getYearLabel(event.date.getUTCFullYear() + 1);
    
    return (
        <>
            <Popper open={open} anchorEl={anchorEl} transition placement="top">
                {({TransitionProps}) => (
                    <Fade {...TransitionProps}>
                        <Box sx={{border: 1, p: 1, bgcolor: 'background.paper', marginBottom: 1}}>
                            <Typography variant="subtitle1" fontWeight="bold">{event.label}</Typography>
                            <Typography variant="body2">{year}</Typography>
                        </Box>
                    </Fade>
                )}
            </Popper>
        </>
    );
};