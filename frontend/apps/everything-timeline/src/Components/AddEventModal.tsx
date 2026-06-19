import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Autocomplete,
  CircularProgress,
  Stack,
  Switch,
  Tooltip,
  FormControlLabel,
} from '@mui/material';
import {
  formatYear,
  generateYearOptions,
} from '../Helpers/DateHelperFunctions';
import { useDatasetContext } from '../context/DatasetContext';
import { wikiSearchAutoComplete } from '../api/api';
import { IWikiSearchPage } from '../api/Interfaces';

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
  selectedDatabase: string | null;
  onSubmit: (eventData: {
    name: string;
    year: number;
    info: string;
    wikiPageTitle?: string;
  }) => Promise<void>;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  open,
  onClose,
  selectedDatabase,
  onSubmit,
}) => {
  const [eventName, setEventName] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [eventInfo, setEventInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wikiSearchEnabled, setWikiSearchEnabled] = useState(false);
  const [wikiOptions, setWikiOptions] = useState<IWikiSearchPage[]>([]);
  const [wikiLoading, setWikiLoading] = useState(false);
  const [selectedWikiTitle, setSelectedWikiTitle] =
    useState<IWikiSearchPage | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const DEBOUNCE_MS = 350;

  const { activeDomain } = useDatasetContext();
  const startYear = activeDomain[0].getFullYear();
  const endYear = activeDomain[1].getFullYear();
  const yearOptions = generateYearOptions(startYear, endYear);

  useEffect(() => {
    if (selectedWikiTitle && wikiSearchEnabled) {
      setEventInfo(selectedWikiTitle.description ?? '');
    } else {
      setWikiOptions([]);
      setWikiLoading(false);
      setSelectedWikiTitle(null);
      setEventInfo('');
    }
  }, [selectedWikiTitle, wikiSearchEnabled]);

  const handleSubmit = async () => {
    if (!eventName || selectedYear === null) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: eventName,
        year: selectedYear,
        info: eventInfo,
        wikiPageTitle: selectedWikiTitle?.title,
      });
      setEventName('');
      setSelectedYear(null);
      setEventInfo('');
    } catch (error) {
      console.error('Error submitting event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEventName('');
    setSelectedYear(null);
    setEventInfo('');
    setSelectedWikiTitle(null);
    setWikiOptions([]);
    onClose();
  };

  const handleWikiInputChange = (_: React.SyntheticEvent, value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setWikiOptions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setWikiLoading(true);
      try {
        const results = await wikiSearchAutoComplete(value);
        setWikiOptions(results.slice(0, 5));
      } catch {
        setWikiOptions([]);
      } finally {
        setWikiLoading(false);
      }
    }, DEBOUNCE_MS);
  };

  const handleWikiSelectionChange = (
    _: React.SyntheticEvent,
    value: IWikiSearchPage | null,
  ) => {
    setSelectedWikiTitle(value ?? null);
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          },
        },
      }}
    >
      <DialogTitle variant="h5" sx={{ textAlign: 'center', pb: 1 }}>
        Add new event to the timeline
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* Disabled dataset indicator */}
          <Autocomplete
            options={[]}
            value={selectedDatabase}
            disabled
            renderInput={(params) => <TextField {...params} label="Dataset" />}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Event Name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              fullWidth
              required
            />
            <Autocomplete
              sx={{ minWidth: 150 }}
              options={yearOptions}
              value={selectedYear}
              onChange={(_, newValue) => setSelectedYear(newValue)}
              getOptionLabel={(option) => formatYear(option)}
              renderInput={(params) => (
                <TextField {...params} label="Year" required />
              )}
            />
            <Tooltip
              title="Use wikipedia to import event info automatically"
              placement="top"
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={wikiSearchEnabled}
                    onChange={() => setWikiSearchEnabled(!wikiSearchEnabled)}
                  />
                }
                label="Wiki"
              />
            </Tooltip>
          </Stack>

          {wikiSearchEnabled && (
            <Autocomplete
              options={wikiOptions}
              getOptionLabel={(option) => option.title}
              getOptionKey={(option) => option.id}
              loading={wikiLoading}
              onChange={handleWikiSelectionChange}
              onInputChange={handleWikiInputChange}
              renderInput={(params) => (
                <TextField {...params} label="Search for a wikipedia article" />
              )}
            />
          )}

          <TextField
            label={wikiSearchEnabled ? 'Description extract' : 'Event Info'}
            value={eventInfo}
            onChange={(e) => setEventInfo(e.target.value)}
            disabled={wikiSearchEnabled}
            fullWidth
            multiline
            rows={4}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={handleCancel}
          variant="outlined"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!eventName || selectedYear === null || isSubmitting}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
        >
          {isSubmitting ? 'Submitting…' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
