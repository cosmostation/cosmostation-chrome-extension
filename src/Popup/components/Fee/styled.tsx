import { styled } from '@mui/material/styles';

export const Container = styled('div')(({ theme }) => ({
  padding: '1.6rem',
  border: `0.1rem solid ${theme.colors.base03}`,

  borderRadius: '0.8rem',
}));

export const FeeInfoContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
});

export const LeftContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const RightContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
});

export const RightColumnContainer = styled('div')({});

export const RightAmountContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',

  color: theme.colors.text01,
}));

export const RightValueContainer = styled('div')(({ theme }) => ({
  marginTop: '0.2rem',

  display: 'flex',
  justifyContent: 'flex-end',

  color: theme.colors.text02,
}));

export const EditContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',

  marginTop: '1.2rem',
});

export const EditLeftContainer = styled('div')({ display: 'flex', justifyContent: 'flex-start' });

export const EditRightContainer = styled('div')({ display: 'flex', justifyContent: 'flex-end' });

export const GasButton = styled('button')(({ theme }) => ({
  border: 0,
  padding: 0,

  borderBottom: `0.1rem solid ${theme.accentColors.purple01}`,
  backgroundColor: 'transparent',
  color: theme.accentColors.purple01,

  cursor: 'pointer',

  '&:hover': {
    opacity: 0.8,
  },
}));
export const FeeSettingButton = styled('button')(({ theme }) => ({
  border: 0,
  padding: 0,
  backgroundColor: 'transparent',
  color: theme.colors.text01,

  cursor: 'pointer',

  display: 'flex',
  columnGap: '0.2rem',

  '& > svg': {
    fill: theme.colors.base06,
  },

  '&:hover': {
    opacity: 0.8,
  },
}));

export const FeeButtonContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  columnGap: '0.6rem',
});

type FeeButtonProps = {
  'data-is-active'?: number;
};

export const FeeButton = styled('button')<FeeButtonProps>(({ theme, ...props }) => ({
  border: 0,
  padding: '0.4rem 0',

  borderRadius: '5rem',

  minWidth: '5.6rem',

  backgroundColor: props['data-is-active'] ? theme.accentColors.purple01 : theme.colors.base03,
  color: props['data-is-active'] ? theme.accentColors.white : theme.colors.text02,

  cursor: 'pointer',

  '&:hover': {
    opacity: 0.8,
  },
}));
