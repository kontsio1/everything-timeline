import React, { useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { formatYear, generateYearOptions } from "../Helpers/DateHelperFunctions";
import { useDatasetContext } from "../context/DatasetContext";
import "./AddEventModal.css";

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
  selectedDatabase: string | null;
  onSubmit: (eventData: {
    name: string;
    year: number;
    info: string;
  }) => Promise<void>;
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

  // Generate year options from the active dataset's domain
  const startYear = activeDomain[0].getFullYear();
  const endYear = activeDomain[1].getFullYear();
  const yearOptions = generateYearOptions(startYear, endYear);

  const handleSubmit = async () => {
    if (!eventName || selectedYear === null) {
      // Basic validation
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: eventName,
        year: selectedYear,
        info: eventInfo,
      });

      // Reset form
      setEventName("");
      setSelectedYear(null);
      setEventInfo("");
    } catch (error) {
      console.error("Error submitting event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setEventName("");
    setSelectedYear(null);
    setEventInfo("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleCancel}>
      <Box className="modal-container">
        <h2 className="modal-title">Add new event to the timeline</h2>

        {/* Disabled Database Dropdown */}
        <div className="modal-field">
          <Autocomplete
            options={[]}
            value={selectedDatabase}
            disabled
            renderInput={(params) => (
              <TextField
                {...params}
                label="Database"
                className="modal-input"
              />
            )}
            slotProps={{
              paper: {
                className: "modal-autocomplete-paper",
              },
            }}
          />
        </div>

        {/* Event Name Input */}
        <div className="modal-field">
          <TextField
            label="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            fullWidth
            className="modal-input"
            required
          />
        </div>

        {/* Year Picker */}
        <div className="modal-field">
          <Autocomplete
            options={yearOptions}
            value={selectedYear}
            onChange={(_, newValue) => setSelectedYear(newValue)}
            getOptionLabel={(option) => formatYear(option)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Year"
                className="modal-input"
                required
              />
            )}
            slotProps={{
              paper: {
                className: "modal-autocomplete-paper",
              },
            }}
          />
        </div>

        {/* Event Info Multi-line Text Field */}
        <div className="modal-field">
          <TextField
            label="Event Info"
            value={eventInfo}
            onChange={(e) => setEventInfo(e.target.value)}
            fullWidth
            multiline
            rows={4}
            className="modal-input"
          />
        </div>

        {/* Action Buttons */}
        <div className="modal-actions">
          <Button
            onClick={handleCancel}
            className="modal-btn modal-btn-cancel"
            variant="outlined"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="modal-btn modal-btn-submit"
            variant="contained"
            disabled={!eventName || selectedYear === null || isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : "Submit"}
          </Button>
        </div>
      </Box>
    </Modal>
  );
};
