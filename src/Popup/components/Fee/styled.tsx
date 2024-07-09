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

export const HeaderContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',

  paddingBottom: '1rem',

  borderBottom: `0.1rem solid ${theme.colors.base04}`,
}));

export const HeaderLeftContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  columnGap: '0.4rem',

  color: theme.colors.text01,
}));

export const HeaderLeftIconContainer = styled('div')(({ theme }) => ({
  '& > svg': {
    fill: theme.colors.base05,
  },

  '&:hover': {
    opacity: 0.8,
  },
}));

export const BodyContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  padding: '0.9rem 0 1.2rem',
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

  height: '2rem',

  borderRadius: '5rem',

  minWidth: '5.6rem',

  backgroundColor: props['data-is-active'] ? theme.accentColors.purple01 : theme.colors.base03,
  color: props['data-is-active'] ? theme.accentColors.white : theme.colors.text02,

  cursor: 'pointer',

  '&:hover': {
    opacity: 0.8,
  },
}));

export const FeeCoinButton = styled('button')(({ theme }) => ({
  height: '3rem',

  minWidth: '11.5rem',

  border: `0.1rem solid ${theme.colors.base03}`,

  borderRadius: '0.6rem',

  backgroundColor: theme.colors.base01,
  color: theme.accentColors.white,

  padding: '0',

  textAlign: 'left',

  '&:hover': {
    backgroundColor: theme.colors.base02,
  },

  cursor: 'pointer',
}));

export const FeeCoinContentContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  paddingLeft: '0.8rem',
});

export const FeeCoinContentLeftContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  columnGap: '0.4rem',
});

export const FeeCoinImageContainer = styled('div')({
  width: '1.6rem',
  height: '1.6rem',

  '& > img': {
    width: '1.6rem',
    height: '1.6rem',
  },
});

export const ArrowIconContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  paddingRight: '0.8rem',

  '& > svg': {
    width: '1.6rem',
    height: '1.6rem',

    fill: theme.colors.base05,
  },
}));

export const FeeCoinDenomContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
  maxWidth: '7rem',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));
