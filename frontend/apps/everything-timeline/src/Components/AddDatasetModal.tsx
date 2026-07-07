import React, { useState } from 'react';
import { emitSnack } from './SnackbarEmitter';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Stack,
  Box,
  Typography,
} from '@mui/material';
import {
  formatYear,
  generateYearOptions,
} from '../Helpers/DateHelperFunctions';

const DOMAIN_MIN_YEAR = -10000;
const DOMAIN_MAX_YEAR = new Date().getFullYear() + 1;

interface AddDatasetModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    domainStart: number;
    domainEnd: number | null;
    isPublic: boolean;
  }) => Promise<void>;
}

export const AddDatasetModal: React.FC<AddDatasetModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [domainStart, setDomainStart] = useState<number>(-3200);
  const [domainEnd, setDomainEnd] = useState<number | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startYearOptions = generateYearOptions(
    DOMAIN_MIN_YEAR,
    DOMAIN_MAX_YEAR,
  );
  const endYearOptions: (number | null)[] = [
    null,
    ...generateYearOptions(domainStart + 1, DOMAIN_MAX_YEAR),
  ];

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        domainStart,
        domainEnd,
        isPublic,
      });
      setName('');
      setDescription('');
      setDomainStart(-3200);
      setDomainEnd(null);
      setIsPublic(false);
    } catch (error) {
      console.error('Error creating dataset:', error);
      emitSnack('Failed to create dataset. Please try again.', 'error');
    } finally {
      emitSnack('New dataset created succesfully', 'success');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    setDomainStart(-3200);
    setDomainEnd(null);
    setIsPublic(false);
    onClose();
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
        Create a new Dataset
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {/* Info callout */}
          <Box
            sx={{
              borderLeft: '3px solid',
              borderColor: 'primary.main',
              borderRadius: '0 4px 4px 0',
              bgcolor: 'rgba(255,255,255,0.04)',
              px: 1.75,
              py: 1.25,
            }}
          >
            <Typography
              variant="body2"
              color="text.disabled"
              sx={{ fontStyle: 'italic' }}
            >
              Datasets let you build your own custom timeline from scratch. Once
              created, you can populate it with your own events and periods —
              perfect for personal projects, research, or any topic you want to
              explore across time.
            </Typography>
          </Box>

          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />

          {/* Domain row */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            <Autocomplete
              options={startYearOptions}
              value={domainStart}
              onChange={(_, newValue) => {
                if (newValue === null) return;
                setDomainStart(newValue);
                if (domainEnd !== null && domainEnd <= newValue)
                  setDomainEnd(null);
              }}
              getOptionLabel={(option) => formatYear(option)}
              isOptionEqualToValue={(o, v) => o === v}
              sx={{ flex: 1 }}
              renderInput={(params) => (
                <TextField {...params} label="Timeline Start Year" required />
              )}
            />
            <Autocomplete<number | null>
              options={endYearOptions}
              value={domainEnd}
              onChange={(_, newValue) => setDomainEnd(newValue ?? null)}
              getOptionLabel={(option) => formatYear(option)}
              isOptionEqualToValue={(o, v) => o === v}
              sx={{ flex: 1 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Timeline End Year"
                  helperText='Leave empty to set to "Present" — always extends to today'
                />
              )}
            />
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
            }
            label="Make public"
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
          disabled={!name.trim() || isSubmitting}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
        >
          {isSubmitting ? 'Creating…' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
