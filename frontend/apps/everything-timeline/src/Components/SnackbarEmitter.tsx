import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Slide, { SlideProps } from '@mui/material/Slide';
import { AlertColor } from '@mui/material';
import Alert from '@mui/material/Alert';

export interface Snack {
  message: string;
  severity: AlertColor;
}

const SNACK_EVENT = 'app:emitSnack';

export const emitSnack = (message: string, severity: AlertColor = 'info') => {
  window.dispatchEvent(
    new CustomEvent<Snack>(SNACK_EVENT, { detail: { message, severity } }),
  );
};

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

export const SnackbarEmitter: React.FC = () => {
  const [snack, setSnack] = React.useState<Snack & { open: boolean }>({
    open: false,
    message: '',
    severity: 'info',
  });

  React.useEffect(() => {
    const handler = (e: Event) => {
      const { message, severity } = (e as CustomEvent<Snack>).detail;
      setSnack({ open: true, message, severity });
    };
    window.addEventListener(SNACK_EVENT, handler);
    return () => window.removeEventListener(SNACK_EVENT, handler);
  }, []);

  const handleClose = () => setSnack((prev) => ({ ...prev, open: false }));

  return (
    <Snackbar
      open={snack.open}
      onClose={handleClose}
      slots={{ transition: SlideTransition }}
      // autoHideDuration={1500}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={handleClose}
        severity={snack.severity}
        variant="filled"
        sx={{ width: '100%', opacity: 0.8, borderRadius: '10px' }}
      >
        {snack.message}
      </Alert>
    </Snackbar>
  );
};
