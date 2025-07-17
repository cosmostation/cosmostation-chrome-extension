import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';

export const StyledLinearProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: '0.8rem',
  borderRadius: '0.4rem',

  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.color.base400,
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: '0.4rem',
    backgroundColor: theme.palette.accentColor.purple300,
  },
}));
