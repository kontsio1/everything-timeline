import {Box, FormControlLabel, Slider, Switch, Typography} from "@mui/material";
import {useControlsContext} from "../context/ControlsContext";

export const Controls = () => {
    const {controls, setHoverLineEnabled, setVisibleEventsLaneHeightPadding, setTicksNo} = useControlsContext();

    return (
        <Box className="controls-panel" sx={{display: "flex", alignItems: "center", gap: 1}}>
            <FormControlLabel
                className="hover-line-toggle"
                control={(
                    <Switch
                        size="small"
                        checked={controls.hoverLineEnabled}
                        onChange={(event) => setHoverLineEnabled(event.target.checked)}
                    />
                )}
                label="Hover line"
                labelPlacement="bottom"
            />
            <Box className="visible-events-slider" sx={{width: 140, display: "flex", flexDirection: "column", alignItems: "center"}}>
                <Typography variant="caption">visible events</Typography>
                <Slider
                    size="small"
                    min={50}
                    max={100}
                    value={110 - controls.visibleEventsLaneHeightPadding}
                    onChange={(_, value) => {
                        if (Array.isArray(value)) return;
                        setVisibleEventsLaneHeightPadding(110 - value);
                    }}
                />
            </Box>
            <Box className="ticks-slider" sx={{width: 140, display: "flex", flexDirection: "column", alignItems: "center"}}>
                <Typography variant="caption">number of ticks</Typography>
                <Slider
                    size="small"
                    min={2}
                    max={20}
                    value={controls.ticksNo}
                    onChange={(_, value) => {
                        if (Array.isArray(value)) return;
                        setTicksNo(value);
                    }}
                />
            </Box>
        </Box>
    );
};
