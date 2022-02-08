import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
  width: '36rem',
  height: '4.8rem',
  backgroundColor: theme.colors.base01,
}));

export const StyledBottomNavigationAction = styled(BottomNavigationAction)(({ theme }) => ({
  padding: '0.8px 0',

  '& svg': {
    fill: theme.colors.base04,
  },

  '&.Mui-selected': {
    '& svg': {
      fill: theme.accentColors.purple01,
    },
  },
}));
