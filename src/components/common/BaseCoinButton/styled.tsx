import { styled } from '@mui/material/styles';

type StyledButtonProps = {
  'data-is-active'?: boolean;
};

export const StyledButton = styled('button')<StyledButtonProps>(({ theme, ...props }) => ({
  width: '100%',

  border: 'none',

  backgroundColor: props['data-is-active'] ? theme.palette.color.base200 : 'transparent',

  padding: '1.3rem 1.6rem',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  cursor: 'pointer',

  '&:disabled': {
    cursor: 'default',

    '&:hover': {
      backgroundColor: theme.palette.color.base300,
    },
  },

  '&:hover': {
    backgroundColor: theme.palette.color.base300,
  },
}));

export const LeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  textAlign: 'left',
});

export const RightContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  textAlign: 'right',
});

export const RightTextContainer = styled('div')({
  display: 'grid',

  gridTemplateColumns: '1fr',

  rowGap: '0.2rem',
});

export const RightDisplayAmountContainer = styled('div')(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

export const RightValueContainer = styled('div')(({ theme }) => ({
  color: theme.palette.color.base1000,
}));
