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
import "./AddDatasetModal.css";

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
  }) => Promise<void>;
}

export const AddDatasetModal: React.FC<AddDatasetModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [domainStart, setDomainStart] = useState<number>(-3200);
  const [domainEnd, setDomainEnd] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startYearOptions = generateYearOptions(DOMAIN_MIN_YEAR, DOMAIN_MAX_YEAR);
  // End year options: null ("Present") + years after domainStart
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
      });
      setName("");
      setDescription("");
      setDomainStart(-3200);
      setDomainEnd(null);
    } catch (error) {
      console.error("Error creating dataset:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    setDomainStart(-3200);
    setDomainEnd(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleCancel}>
      <Box className="modal-container">
        <h2 className="modal-title">Create a new Dataset</h2>

        <p className="modal-info-text">
          Datasets let you build your own custom timeline from scratch. Once
          created, you can populate it with your own events and periods — perfect
          for personal projects, research, or any topic you want to explore
          across time.
        </p>

        {/* Dataset Name */}
        <div className="modal-field">
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            className="modal-input"
            required
          />
        </div>

        {/* Dataset Description */}
        <div className="modal-field">
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            className="modal-input"
          />
        </div>

        {/* Domain Start + End on the same row */}
        <div className="modal-domain-row">
          <div className="modal-field modal-domain-field">
            <Autocomplete
              options={startYearOptions}
              value={domainStart}
              onChange={(_, newValue) => {
                if (newValue === null) return;
                setDomainStart(newValue);
                if (domainEnd !== null && domainEnd <= newValue) {
                  setDomainEnd(null);
                }
              }}
              getOptionLabel={(option) => formatYear(option)}
              isOptionEqualToValue={(o, v) => o === v}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Timeline Start Year"
                  className="modal-input"
                  required
                />
              )}
              slotProps={{ paper: { className: "modal-autocomplete-paper" } }}
            />
          </div>

          <div className="modal-field modal-domain-field">
            <Autocomplete<number | null>
              options={endYearOptions}
              value={domainEnd}
              onChange={(_, newValue) => setDomainEnd(newValue ?? null)}
              getOptionLabel={(option) => formatYear(option)}
              isOptionEqualToValue={(o, v) => o === v}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Timeline End Year"
                  className="modal-input"
                  helperText='Leave as empty to set to the "Present". It will always extend to today'
                  slotProps={{ formHelperText: { style: { color: "#c4bba8" } } }}
                />
              )}
              slotProps={{ paper: { className: "modal-autocomplete-paper" } }}
            />
          </div>
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
            disabled={!name.trim() || isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : "Create"}
          </Button>
        </div>
      </Box>
    </Modal>
  );
};
