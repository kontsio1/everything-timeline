import * as React from 'react';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Slide, { SlideProps } from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { Fade } from '@mui/material';
import Alert from '@mui/material/Alert';

export const EmitSnack = () => {
  const [state, setState] = React.useState<{
    open: boolean;
    Transition: React.ComponentType<
      TransitionProps & {
        children: React.ReactElement<any, any>;
      }
    >;
  }>({
    open: false,
    Transition: Fade,
  });

  function SlideTransition(props: SlideProps) {
    return <Slide {...props} direction="up" />;
  }

  const handleClick =
    (
      Transition: React.ComponentType<
        TransitionProps & {
          children: React.ReactElement<any, any>;
        }
      >,
    ) =>
    () => {
      setState({
        open: true,
        Transition,
      });
    };

  const handleClose = () => {
    setState({
      ...state,
      open: false,
    });
  };

  return (
    <div>
      <Button onClick={handleClick(SlideTransition)}>Snack</Button>
      <Snackbar
        open={state.open}
        onClose={handleClose}
        slots={{ transition: state.Transition }}
        message="I love snacks"
        key={state.Transition.name}
        // autoHideDuration={1500}
      >
        <Alert
          onClose={handleClose}
          severity="error"
          variant="filled"
          sx={{ width: '100%', opacity: '0.8', borderRadius: '10px' }}
        >
          This is a success Alert inside a Snackbar!
        </Alert>
      </Snackbar>
    </div>
  );
};
