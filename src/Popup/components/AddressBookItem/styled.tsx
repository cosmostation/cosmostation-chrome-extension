import { styled } from '@mui/material/styles';

import Image from '~/Popup/components/common/Image';

export const Container = styled('div')(({ theme }) => ({
  backgroundColor: theme.colors.base02,

  borderRadius: '0.8rem',

  padding: '1.2rem 0.8rem 1rem 1.6rem',
}));

export const LabelContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const LabelLeftContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  color: theme.colors.text01,
}));

export const LabelRightContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
});

export const StyledImage = styled(Image)({
  width: '2rem',
  height: '2rem',

  marginRight: '0.8rem',
});

type StyledButtonProps = {
  'data-is-active'?: number;
};

export const StyledButton = styled('button')<StyledButtonProps>(({ theme, ...props }) => ({
  backgroundColor: 'transparent',

  border: 0,
  padding: 0,

  cursor: 'pointer',

  '& > svg': {
    fill: props['data-is-active'] ? theme.colors.base06 : theme.colors.base05,
  },

  '&:hover': {
    '& > svg': {
      fill: theme.colors.base06,
    },
  },
}));

export const AddressContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  wordBreak: 'break-all',

  marginTop: '1rem',
}));
export const MemoContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,

  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',

  marginTop: '0.4rem',
}));
