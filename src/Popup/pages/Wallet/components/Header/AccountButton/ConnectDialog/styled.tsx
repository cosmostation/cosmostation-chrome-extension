import { styled } from '@mui/material/styles';

import Button from '~/Popup/components/common/Button';

export const Container = styled('div')({ padding: '1.6rem' });

export const OriginContainer = styled('div')(({ theme }) => ({
  padding: '1.2rem',
  backgroundColor: theme.colors.base02,
  borderRadius: '0.8rem',

  textAlign: 'center',

  color: theme.colors.text01,
}));

export const DescriptionContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  textAlign: 'center',

  margin: '1.6rem 0 2rem',
}));

export const StyledButton = styled(Button)({
  height: '4rem',
});
