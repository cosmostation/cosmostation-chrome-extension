import { styled } from '@mui/material/styles';

export const Button = styled('button')(({ theme }) => ({
  backgroundColor: theme.colors.base02,
  border: `0.1rem solid ${theme.colors.base03}`,

  borderRadius: '0.8rem',

  padding: '1.2rem',

  height: '8.96rem',
  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  cursor: 'pointer',
}));

export const LeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const LeftImageContainer = styled('div')({
  '& > img': {
    width: '6.4rem',
    height: '6.4rem',

    borderRadius: '0.4rem',
  },
});

export const LeftInfoContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',

  rowGap: '0.6rem',

  marginLeft: '1.4rem',
});

export const LeftInfoHeaderContainer = styled('div')(({ theme }) => ({
  textAlign: 'left',
  color: theme.colors.text01,

  maxWidth: '20rem',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export const LeftInfoBodyContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const LeftInfoFooterContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

type RightContainerProps = {
  'data-is-active'?: number;
};

export const RightContainer = styled('div')<RightContainerProps>(({ theme, ...props }) => ({
  height: '100%',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',

  '& > svg': {
    transform: props['data-is-active'] ? 'rotate(180deg)' : 'none',
    '& > path': {
      stroke: theme.colors.base06,
    },
  },
}));
