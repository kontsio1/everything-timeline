import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import TextField from '@mui/material/TextField';
import TodayIcon from '@mui/icons-material/Today';
import TuneIcon from '@mui/icons-material/Tune';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { TimelineEvent } from '../Entities/TimelineEvent';
import { AddEventModal } from './AddEventModal';
import { AddDatasetModal } from './AddDatasetModal';
import { addDataset, getDatasets } from '../api/api';
import { useDatasetContext } from '../context/DatasetContext';
import {
  Autocomplete,
  Button,
  ButtonGroup,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';

interface SearchEventHeroProps {
  events: TimelineEvent[];
  selectedEvent: TimelineEvent | null;
  selectedDatabase: string | null;
  loading: boolean;
  isFullyZoomedOut: boolean;
  addEventRequest: { year: number } | null;
  onEventSearch: (
    event: React.SyntheticEvent,
    value: TimelineEvent | null,
  ) => void;
  onSubmitEvent: (eventData: {
    name: string;
    year: number;
    info: string;
    wikiPageTitle?: string;
  }) => Promise<void>;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPanLeft: () => void;
  onPanRight: () => void;
  onToggleSettings: () => void;
}

export const SearchEventHero = ({
  events,
  selectedEvent,
  selectedDatabase,
  loading,
  isFullyZoomedOut,
  addEventRequest,
  onEventSearch,
  onSubmitEvent,
  onZoomIn,
  onZoomOut,
  onPanLeft,
  onPanRight,
  onToggleSettings,
}: SearchEventHeroProps) => {
  const [localSelectedEvent, setLocalSelectedEvent] =
    useState<TimelineEvent | null>(selectedEvent);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventPrefillYear, setEventPrefillYear] = useState<number | null>(null);
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);
  const { setDatasets, setSelectedDatasetId } = useDatasetContext();

  useEffect(() => {
    setLocalSelectedEvent(selectedEvent);
  }, [selectedEvent]);

  useEffect(() => {
    if (!addEventRequest) return;
    setEventPrefillYear(addEventRequest.year);
    setIsEventModalOpen(true);
  }, [addEventRequest]);

  const handleSelectEvent = (
    event: React.SyntheticEvent,
    newValue: TimelineEvent | null,
  ) => {
    setLocalSelectedEvent(newValue);
    onEventSearch(event, newValue);
  };

  const handleSubmitEvent = async (eventData: {
    name: string;
    year: number;
    info: string;
    wikiPageTitle?: string;
  }) => {
    await onSubmitEvent(eventData);
    setIsEventModalOpen(false);
    setEventPrefillYear(null);
  };

  const handleOpenAddEventModal = () => {
    setEventPrefillYear(null);
    setIsEventModalOpen(true);
  };

  const handleCloseAddEventModal = () => {
    setIsEventModalOpen(false);
    setEventPrefillYear(null);
  };

  const handleSubmitDataset = async (data: {
    name: string;
    description: string;
    domainStart: number;
    domainEnd: number | null;
    isPublic: boolean;
  }) => {
    const newDataset = await addDataset({
      Name: data.name,
      Description: data.description,
      DomainStart: data.domainStart,
      DomainEnd: data.domainEnd,
      IsPublic: data.isPublic,
    });
    const updatedDatasets = await getDatasets();
    setDatasets(updatedDatasets);
    if (newDataset?.Id) setSelectedDatasetId(newDataset.Id);
    setIsDatasetModalOpen(false);
  };

  const isDbSelected = !!selectedDatabase && selectedDatabase !== '';
  const areTimelineControlsDisabled = !isDbSelected || loading;

  const speedDialActions = [
    {
      icon: <TodayIcon />,
      name: 'New event',
      onClick: handleOpenAddEventModal,
      disabled: !isDbSelected || loading,
    },
    {
      icon: <DateRangeIcon />,
      name: 'New dataset',
      onClick: () => setIsDatasetModalOpen(true),
      disabled: false,
    },
    {
      icon: <TuneIcon />,
      name: 'Timeline settings',
      onClick: () => onToggleSettings(),
      disabled: false,
    },
  ];

  return (
    <>
      <Stack direction="column" sx={{ maxWidth: '60%', margin: '0 auto' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            px: { xs: 2, sm: 6 },
            py: 1.5,
          }}
        >
          <Box
            sx={{
              transform: 'translateX(+5%)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              width: '100%',
              maxWidth: 600,
              marginTop: 5,
            }}
          >
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Zoom in">
                <span>
                  <IconButton
                    size="small"
                    onClick={onZoomIn}
                    disabled={areTimelineControlsDisabled}
                    aria-label="Zoom in timeline"
                  >
                    <ZoomInIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Zoom out">
                <span>
                  <IconButton
                    size="small"
                    onClick={onZoomOut}
                    disabled={areTimelineControlsDisabled || isFullyZoomedOut}
                    aria-label="Zoom out timeline"
                  >
                    <ZoomOutIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Pan left">
                <span>
                  <IconButton
                    size="small"
                    onClick={onPanLeft}
                    disabled={areTimelineControlsDisabled || isFullyZoomedOut}
                    aria-label="Pan timeline left"
                  >
                    <KeyboardArrowLeftIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Pan right">
                <span>
                  <IconButton
                    size="small"
                    onClick={onPanRight}
                    disabled={areTimelineControlsDisabled || isFullyZoomedOut}
                    aria-label="Pan timeline right"
                  >
                    <KeyboardArrowRightIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>

            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                marginRight: 0,
              }}
            >
              <Autocomplete
                options={events}
                value={localSelectedEvent}
                onChange={handleSelectEvent}
                popupIcon={null}
                noOptionsText="Select a dataset to load events"
                sx={{ flex: 1 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search for an event"
                    size="small"
                  />
                )}
              />
            </Box>

            {/* Speed dial */}
            <SpeedDial
              ariaLabel="timeline actions"
              direction="right"
              icon={<SpeedDialIcon />}
              sx={{
                '& .MuiSpeedDial-fab': {
                  width: 36,
                  height: 36,
                  minHeight: 36,
                  bgcolor: 'primary.main',
                  color: '#fff',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: 'primary.light' },
                },
              }}
            >
              {speedDialActions.map((action) => (
                <SpeedDialAction
                  key={action.name}
                  icon={action.icon}
                  onClick={action.onClick}
                />
              ))}
            </SpeedDial>
          </Box>
        </Box>
        <ButtonGroup
          variant="text"
          aria-label="Basic button group"
          size="large"
          sx={{ justifyContent: 'center' }}
          fullWidth
        >
          <Button>Conflicts</Button>
          <Button>Discoveries</Button>
          <Button>Religion</Button>
          <Button>Politics</Button>
        </ButtonGroup>
      </Stack>

      <AddEventModal
        open={isEventModalOpen}
        onClose={handleCloseAddEventModal}
        selectedDatabase={selectedDatabase}
        prefillYear={eventPrefillYear}
        onSubmit={handleSubmitEvent}
      />
      <AddDatasetModal
        open={isDatasetModalOpen}
        onClose={() => setIsDatasetModalOpen(false)}
        onSubmit={handleSubmitDataset}
      />
    </>
  );
};
