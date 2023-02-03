import { styled } from '@mui/material/styles';

type ContainerProps = {
  'data-is-onclick': number;
};

export const Container = styled('div')<ContainerProps>(({ theme, ...props }) => ({
  backgroundColor: theme.colors.base02,

  borderRadius: '0.8rem',

  padding: '1.2rem 0.8rem 1rem 1.6rem',

  cursor: props['data-is-onclick'] ? 'pointer' : 'default',
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

type AccountIconContainerProps = {
  'data-account-color'?: string;
};

export const AccountIconContainer = styled('div')<AccountIconContainerProps>(({ theme, ...props }) => ({
  height: '2rem',
  width: '2rem',

  borderRadius: '50%',

  backgroundColor: props['data-account-color'] ? `${props['data-account-color']}66` : theme.colors.base03,
  color: theme.accentColors.white,

  padding: 0,

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginRight: '0.8rem',

  '& > svg': {
    fill: theme.colors.base06,

    '& > path': {
      fill: theme.colors.base06,
    },

    '& > circle': {
      fill: theme.colors.base06,
    },
  },
}));

export const AddressContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  wordBreak: 'break-all',

  marginTop: '1rem',
}));
