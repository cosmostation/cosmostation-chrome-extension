import type { ToastContainerProps } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { styled } from '@mui/material/styles';

export const StyledToastContainer = styled(ToastContainer)<ToastContainerProps>(({ theme }) => ({
  '.Toastify__toast': {
    padding: '1.2rem',
    minHeight: '0',
    margin: '0 2rem 7rem',
    boxSizing: 'border-box',
    borderRadius: '0.6rem !important',
    backgroundColor: theme.palette.color.base300,
  },
  '.Toastify__toast-body': {
    padding: '0',
    margin: '0',
  },

  '.Toastify__toast--error': {
    backgroundColor: theme.palette.accentColor.red200,
  },
  '.Toastify__toast--success': {
    backgroundColor: theme.palette.accentColor.green200,
  },
}));
