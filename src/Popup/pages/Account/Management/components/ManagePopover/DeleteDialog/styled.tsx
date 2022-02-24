import { styled } from '@mui/material/styles';

import Button from '~/Popup/components/common/Button';
import Input from '~/Popup/components/common/Input';

export const Container = styled('div')({
  padding: '2.1rem 1.6rem 1.6rem 1.6rem',
});

export const DescriptionContainer = styled('div')({
  display: 'flex',

  marginBottom: '2.4rem',
});
export const DescriptionImageContainer = styled('div')(({ theme }) => ({
  '& > svg': {
    fill: theme.accentColors.red,
  },
}));
export const DescriptionTextContainer = styled('div')({
  marginLeft: '0.5rem',

  wordBreak: 'break-word',
});

export const StyledInput = styled(Input)({
  height: '4rem',
});

export const StyledButton = styled(Button)({
  marginTop: '3.2rem',
  height: '4rem',
});
