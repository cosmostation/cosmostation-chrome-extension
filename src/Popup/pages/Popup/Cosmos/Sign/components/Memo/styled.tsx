import { styled } from '@mui/material/styles';

import Input from '~/Popup/components/common/Input';

export const NoEditContainer = styled('div')(({ theme }) => ({
  padding: '1.6rem',
  border: `0.1rem solid ${theme.colors.base03}`,
  borderRadius: '0.8rem',

  maxHeight: '6.4rem',

  overflow: 'auto',
}));

export const NoEditTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const NoEditContentContainer = styled('div')(({ theme }) => ({
  marginTop: '0.4rem',
  color: theme.colors.text01,

  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
}));

export const StyledInput = styled(Input)({
  '&.MuiOutlinedInput-root': {
    padding: '1.6rem 1.2rem',

    '& .MuiOutlinedInput-input': {
      height: '3.2rem !important',
      overflow: 'auto !important',
    },
  },
});

export const EditContainer = styled('div')({});
