import React from "react";
import Typography from '@mui/material/Typography';
import {getYearLabel} from "../Helpers/GenericHelperFunctions";
import {TimelineEvent} from "../Entities/TimelineEvent";
import {Box, Fade, Popper, IconButton} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

interface EventTooltipProps {
    event: TimelineEvent;
    open: boolean;
    anchorEl: SVGSVGElement | null;
    onClose: () => void;
}

export const EventTooltip = ({event, open, anchorEl, onClose}: EventTooltipProps) => {
    const year = getYearLabel(event.date.getUTCFullYear() + 1);
    
    return (
        <Popper open={open} anchorEl={anchorEl} transition placement="top">
            {({TransitionProps}) => (
                <Fade {...TransitionProps}>
                    <Box sx={{border: 1, p: 1, maxWidth: 350, bgcolor: 'background.paper', marginBottom: 1, position: 'relative'}}>
                        <IconButton
                            size="small"
                            onClick={onClose}
                            sx={{position: 'absolute', top: 1, right: 1, zIndex: 2, color: 'grey.500', padding: 0.5, background: 'transparent'}}
                            aria-label="close"
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                        {/* Sticky header for label and year */}
                        <Box sx={{position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1, marginRight: 2.5, marginLeft: 1}}>
                            <Typography variant="subtitle1" fontWeight="bold">{event.label}</Typography>
                            <Typography variant="body2">{year}</Typography>
                        </Box>
                        <Box sx={{maxHeight: 150, overflowY: 'auto', mt: 1}}>
                            <Typography variant="body2">{event.info}</Typography>
                        </Box>
                    </Box>
                </Fade>
            )}
        </Popper>
    );
};