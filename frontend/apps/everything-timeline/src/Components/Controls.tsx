import {
  Box,
  FormControlLabel,
  Slider,
  Switch,
  Typography,
} from '@mui/material';
import { useControlsContext } from '../context/ControlsContext';

export const Controls = () => {
  const {
    controls,
    setHoverLineEnabled,
    setVisibleEventsLaneHeightPadding,
    setTicksNo,
  } = useControlsContext();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={controls.hoverLineEnabled}
            onChange={(event) => setHoverLineEnabled(event.target.checked)}
          />
        }
        label={
          <Typography variant="caption" color="text.secondary">
            Hover line
          </Typography>
        }
        labelPlacement="bottom"
        sx={{ mx: 0 }}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          visible events
        </Typography>
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          number of ticks
        </Typography>
        <Slider
          size="small"
          min={2}
          max={17}
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
