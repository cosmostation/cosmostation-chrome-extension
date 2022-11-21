import { styled } from '@mui/material/styles';

export const Container = styled('div')({});

export const MaxButton = styled('button')(({ theme }) => ({
  padding: '0.4rem 0.8rem',
  border: 0,
  borderRadius: '5rem',

  marginLeft: '0.8rem',

  height: 'max-content',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  backgroundColor: theme.accentColors.purple01,
  color: theme.accentColors.white,

  cursor: 'pointer',

  '&:hover': {
    backgroundColor: theme.accentColors.purple02,
  },
}));

export const DropdownContainerButton = styled('button')(({ theme }) => ({
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

export const DropdownLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const DropdownLeftImageContainer = styled('div')({
  '& > img': {
    width: '2.4rem',
    height: '2.4rem',
  },
});

export const DropdownLeftInfoContainer = styled('div')({
  marginLeft: '0.8rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

export const DropdownTitleContainer = styled('div')(({ theme }) => ({
  textAlign: 'left',
  color: theme.colors.text01,
}));

export const DropdownLeftHeaderTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

type DropdownRightContainerProps = {
  'data-is-active'?: number;
};

export const DropdownRightContainer = styled('div')<DropdownRightContainerProps>(({ theme, ...props }) => ({
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
