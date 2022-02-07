import Checkbox from '@mui/material/Checkbox';
import { styled } from '@mui/material/styles';

export const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
  color: '#C6CFDD',

  '&.Mui-checked': {
    color: theme.accentColors.purple01,
  },
}));
