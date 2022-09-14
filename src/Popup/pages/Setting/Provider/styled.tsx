import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0.8rem 1.6rem 0',

  position: 'relative',
});

export const ListContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.8rem',

  width: '100%',
  maxHeight: '100%',

  overflow: 'auto',
});

export const BottomDescriptionContainer = styled('div')(({ theme }) => ({
  backgroundColor: theme.colors.base02,

  borderRadius: '0.8rem',

  padding: '1.2rem 1.2rem 1.2rem 1.6rem',

  display: 'flex',

  columnGap: '0.4rem',

  position: 'absolute',
  bottom: '1.6rem',
  left: '1.6rem',
  right: '1.6rem',
}));

export const BottomDescriptionInfoIconContainer = styled('div')(({ theme }) => ({
  '& > svg': {
    fill: theme.accentColors.purple01,
  },
}));

export const BottomDescriptionTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));
