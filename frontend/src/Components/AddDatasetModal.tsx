import React, { useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import "./AddDatasetModal.css";

interface AddDatasetModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => Promise<void>;
}

export const AddDatasetModal: React.FC<AddDatasetModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() });
      setName("");
      setDescription("");
    } catch (error) {
      console.error("Error creating dataset:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
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
            disabled={!name.trim() || isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : "Create"}
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

