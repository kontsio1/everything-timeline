import React, { useEffect, useRef, useState } from 'react';
import { useIsAuthenticated } from '@azure/msal-react';
import { TimelineEvent } from '../Entities/TimelineEvent';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import { alpha } from '@mui/material/styles';
import { tokens } from '../theme/theme';
import { formatYear } from '../Helpers/DateHelperFunctions';
import SaveIcon from '@mui/icons-material/Save';

interface EventDetailsPanelProps {
  event: TimelineEvent | null;
  onClose: () => void;
  scrollOnOpen: boolean;
  onSave: (updatedInfo: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

export const EventDetailsPanel: React.FC<EventDetailsPanelProps> = ({
  event,
  onClose,
  scrollOnOpen,
  onSave,
  onDelete,
}) => {
  const isVisible = event !== null;
  const isAuthenticated = useIsAuthenticated();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const editFieldRef = useRef<HTMLTextAreaElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsEditing(false);
    setEditedInfo(event?.info ?? '');
  }, [event]);

  useEffect(() => {
    if (scrollOnOpen && event && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [event, scrollOnOpen]);

  const handleEditToggle = () => {
    if (!isEditing) setEditedInfo(event?.info ?? '');
    setIsEditing((prev) => !prev);
    // Focus without scrolling after state update
    if (!isEditing) {
      setTimeout(() => editFieldRef.current?.focus({ preventScroll: true }), 0);
    }
  };

  const handleCancel = () => {
    setEditedInfo(event?.info ?? '');
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editedInfo);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${event?.label}"? This action cannot be undone.`,
      )
    )
      return;
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box
      ref={panelRef}
      sx={{
        position: 'relative',
        width: '90vw',
        maxWidth: '90vw',
        mx: 'auto',
        mt: 0,
        mb: 2.5,
        p: 3,
        border: '2px solid',
        borderColor: 'primary.main',
        borderRadius: 2,
        color: 'text.primary',

        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-10px)',
        visibility: isVisible ? 'visible' : 'hidden',
        transition:
          'opacity 0.3s ease-in-out, transform 0.3s ease-in-out, visibility 0.3s ease-in-out',
        boxSizing: 'border-box',
        scrollbarColor: `${tokens.rust} transparent`,
        '&::-webkit-scrollbar': { width: 8 },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': {
          background: 'primary.main',
          borderRadius: 4,
        },
      }}
    >
      <Stack
        direction="row"
        spacing={0.5}
        sx={{ position: 'absolute', top: 10, right: 10 }}
      >
        <Tooltip
          title={
            !isAuthenticated
              ? 'Sign in to edit'
              : isEditing
                ? 'Cancel editing'
                : 'Edit'
          }
        >
          <span>
            <IconButton
              size="small"
              onClick={handleEditToggle}
              disabled={!isAuthenticated || isSaving || isDeleting}
              aria-label={isEditing ? 'Cancel editing' : 'Edit event info'}
              sx={{
                border: '1px solid',
                borderColor: 'primary.main',
                borderRadius: '50%',
                width: 32,
                height: 32,
                '&:hover': { bgcolor: alpha(tokens.rust, 0.15) },
              }}
            >
              {isEditing ? (
                <CancelIcon fontSize="small" />
              ) : (
                <EditIcon fontSize="small" />
              )}
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={!isAuthenticated ? 'Sign in to edit' : 'Save'}>
          <span>
            <IconButton
              size="small"
              onClick={handleSave}
              disabled={
                !isAuthenticated || isSaving || isDeleting || !isEditing
              }
              aria-label={'Save event info'}
              sx={{
                border: '1px solid',
                borderColor: 'primary.main',
                borderRadius: '50%',
                width: 32,
                height: 32,
                '&:hover': { bgcolor: alpha(tokens.rust, 0.15) },
              }}
            >
              {isSaving ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <SaveIcon fontSize="small" />
              )}
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip
          title={!isAuthenticated ? 'Sign in to delete' : 'Delete event'}
        >
          <span>
            <IconButton
              size="small"
              onClick={handleDelete}
              disabled={!isAuthenticated || isSaving || isDeleting}
              aria-label="Delete event"
              sx={{
                border: '1px solid',
                borderColor: 'primary.main',
                borderRadius: '50%',
                width: 32,
                height: 32,
                '&:hover': {
                  bgcolor: alpha(tokens.crimson, 0.2),
                  borderColor: 'error.main',
                },
              }}
            >
              {isDeleting ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <DeleteOutlineIcon fontSize="small" />
              )}
            </IconButton>
          </span>
        </Tooltip>
        <IconButton
          size="small"
          onClick={onClose}
          aria-label="Close event details"
          sx={{
            border: '1px solid',
            borderColor: 'primary.main',
            borderRadius: '50%',
            width: 32,
            height: 32,
            '&:hover': { bgcolor: 'primary.main', color: tokens.ink },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>

      {/* Content */}
      <Box sx={{ pt: 0, px: '50px' }}>
        {event && (
          <>
            <Typography
              variant="h5"
              component="h2"
              sx={{ mb: 2, fontWeight: 600 }}
            >
              {event.label} - {formatYear(event.date.getFullYear())}
            </Typography>

            {isEditing ? (
              <>
                <TextField
                  inputRef={editFieldRef}
                  value={editedInfo}
                  onChange={(e) => setEditedInfo(e.target.value)}
                  multiline
                  minRows={3}
                  fullWidth
                  disabled={isSaving}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-input': {
                      fontSize: '1rem',
                      lineHeight: 2,
                      textAlign: 'justify',
                    },
                  }}
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSave}
                    disabled={isSaving}
                    startIcon={
                      isSaving ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : undefined
                    }
                  >
                    {isSaving ? 'Saving…' : 'Save'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </Stack>
              </>
            ) : (
              <TextField
                contentEditable={false}
                multiline
                minRows={3}
                fullWidth
                focused={false}
                value={
                  event.info ||
                  'No additional information available for this event.'
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.default',
                    cursor: 'default',
                  },
                  '& .MuiOutlinedInput-input': {
                    cursor: 'default',
                    fontSize: '1rem',
                    lineHeight: 2,
                    textAlign: 'justify',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                }}
              />
            )}
          </>
        )}
      </Box>
    </Box>
  );
};
