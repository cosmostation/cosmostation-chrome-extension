import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',

  width: '100%',

  rowGap: '0.6rem',

  padding: '1.2rem',

  backgroundColor: theme.palette.color.base100,
  borderRadius: '0.8rem',
  boxSizing: 'border-box',
}));

type TopContainerProps = {
  variant?: 'caution' | 'info';
};

export const TopContainer = styled('div')<TopContainerProps>(({ ...props }) => ({
  display: 'flex',
  alignItems: 'center',

  columnGap: '0.2rem',

  color: props.variant === 'caution' ? '#FFA000' : '#0078D4',

  '& > svg': {
    fill: props.variant === 'caution' ? '#FFA000' : '#0078D4',
    '& > path': {
      fill: props.variant === 'caution' ? '#FFA000' : '#0078D4',
    },
  },
}));

export const BodyText = styled(Typography)(({ theme }) => ({
  wordBreak: 'break-word',
  color: theme.palette.color.base1000,

  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 3,
  overflow: 'hidden',
}));
