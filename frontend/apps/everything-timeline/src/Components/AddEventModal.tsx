import React, { useState } from "react";
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
} from "@mui/material";
import { formatYear, generateYearOptions } from "../Helpers/DateHelperFunctions";
import { useDatasetContext } from "../context/DatasetContext";

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
  selectedDatabase: string | null;
  onSubmit: (eventData: { name: string; year: number; info: string }) => Promise<void>;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  open,
  onClose,
  selectedDatabase,
  onSubmit,
}) => {
  const [eventName, setEventName] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [eventInfo, setEventInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { activeDomain } = useDatasetContext();
  const startYear = activeDomain[0].getFullYear();
  const endYear = activeDomain[1].getFullYear();
  const yearOptions = generateYearOptions(startYear, endYear);

  const handleSubmit = async () => {
    if (!eventName || selectedYear === null) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ name: eventName, year: selectedYear, info: eventInfo });
      setEventName(""); setSelectedYear(null); setEventInfo("");
    } catch (error) {
      console.error("Error submitting event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEventName(""); setSelectedYear(null); setEventInfo("");
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

          <TextField
            label="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            fullWidth
            required
          />

          <Autocomplete
            options={yearOptions}
            value={selectedYear}
            onChange={(_, newValue) => setSelectedYear(newValue)}
            getOptionLabel={(option) => formatYear(option)}
            renderInput={(params) => <TextField {...params} label="Year" required />}
          />

          <TextField
            label="Event Info"
            value={eventInfo}
            onChange={(e) => setEventInfo(e.target.value)}
            fullWidth
            multiline
            rows={4}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={handleCancel} variant="outlined" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!eventName || selectedYear === null || isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {isSubmitting ? "Submitting…" : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
