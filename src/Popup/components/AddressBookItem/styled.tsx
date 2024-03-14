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

export const LabelLeftImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginRight: '0.4rem',

  width: '2.8rem',
  height: '2.8rem',
  position: 'relative',
});

type LabelLeftAbsoluteImageContainerProps = {
  'data-is-custom'?: boolean;
};

export const LabelLeftAbsoluteImageContainer = styled('div')<LabelLeftAbsoluteImageContainerProps>(({ ...props }) => ({
  position: 'absolute',

  width: '2.8rem',
  height: '2.8rem',

  '& > img': {
    width: props['data-is-custom'] ? '2.4rem' : '2.8rem',
    height: props['data-is-custom'] ? '2.4rem' : '2.8rem',

    margin: props['data-is-custom'] ? '0.2rem' : '0',
  },
}));

export const LabelRightContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
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
