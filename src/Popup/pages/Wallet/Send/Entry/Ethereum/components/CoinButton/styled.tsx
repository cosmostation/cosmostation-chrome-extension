import { styled } from '@mui/material/styles';

export const Button = styled('button')(({ theme }) => ({
  backgroundColor: theme.colors.base02,
  border: `0.1rem solid ${theme.colors.base03}`,

  borderRadius: '0.8rem',

  padding: '0.8rem 1.2rem 0.6rem 1.2rem',

  height: '4.8rem',
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
  width: '2.8rem',
  height: '2.8rem',

  '& > img': {
    width: '2.8rem',
    height: '2.8rem',
  },
});

export const LeftInfoContainer = styled('div')({
  marginLeft: '0.6rem',
});

export const LeftDisplayDenomContainer = styled('div')(({ theme }) => ({
  textAlign: 'left',
  color: theme.colors.text01,
}));

export const LeftAvailableContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

type RightContainerProps = {
  'data-is-active'?: number;
};

export const RightContainer = styled('div')<RightContainerProps>(({ theme, ...props }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  '& > svg': {
    transform: props['data-is-active'] ? 'rotate(180deg)' : 'none',
    '& > path': {
      stroke: theme.colors.base06,
    },
  },
}));
