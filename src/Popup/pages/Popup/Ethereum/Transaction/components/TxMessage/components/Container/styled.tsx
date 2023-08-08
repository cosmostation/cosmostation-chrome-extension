import { styled } from '@mui/material/styles';

import Divider from '~/Popup/components/common/Divider';

export const StyledContainer = styled('div')(({ theme }) => ({
  padding: '1.6rem',

  backgroundColor: theme.colors.base02,
  borderRadius: '0.8rem',

  height: '18.7rem',

  display: 'flex',
  flexDirection: 'column',
}));

export const TitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const StyledDivider = styled(Divider)({
  marginTop: '1.6rem',
});
