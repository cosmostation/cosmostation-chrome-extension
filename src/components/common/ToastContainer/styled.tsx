import type { ToastContainerProps } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { styled } from '@mui/material/styles';

export const StyledToastContainer = styled(ToastContainer)<ToastContainerProps>(({ theme }) => ({
  '.Toastify__toast': {
    padding: '1.2rem',
    minHeight: '0',
  },
  '.Toastify__toast-body': {
    padding: '0',
    margin: '0',
  },

  '.Toastify__toast--error': {
    // TODO : 테마 색상 적용
    backgroundColor: '#F53D50',
  },
}));
