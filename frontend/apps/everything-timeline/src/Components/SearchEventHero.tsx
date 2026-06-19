import React, { useState, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import TextField from '@mui/material/TextField';
import TodayIcon from '@mui/icons-material/Today';
import TuneIcon from '@mui/icons-material/Tune';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { TimelineEvent } from '../Entities/TimelineEvent';
import { AddEventModal } from './AddEventModal';
import { AddDatasetModal } from './AddDatasetModal';
import { addDataset, getDatasets } from '../api/api';
import { useDatasetContext } from '../context/DatasetContext';

interface SearchEventHeroProps {
  events: TimelineEvent[];
  selectedEvent: TimelineEvent | null;
  selectedDatabase: string | null;
  loading: boolean;
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
}

export const SearchEventHero = ({
  events,
  selectedEvent,
  selectedDatabase,
  loading,
  onEventSearch,
  onSubmitEvent,
}: SearchEventHeroProps) => {
  const [localSelectedEvent, setLocalSelectedEvent] =
    useState<TimelineEvent | null>(selectedEvent);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);
  const { setDatasets, setSelectedDatasetId } = useDatasetContext();

  useEffect(() => {
    setLocalSelectedEvent(selectedEvent);
  }, [selectedEvent]);

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

  const speedDialActions = [
    {
      icon: <TodayIcon />,
      name: 'New event',
      onClick: () => setIsEventModalOpen(true),
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
      onClick: () => {},
      disabled: false,
    },
  ];

  return (
    <>
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
            transform: 'translateX(+10%)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: '100%',
            maxWidth: 500,
            marginTop: 5,
          }}
        >
          {/* Search field */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
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

      <AddEventModal
        open={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        selectedDatabase={selectedDatabase}
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
