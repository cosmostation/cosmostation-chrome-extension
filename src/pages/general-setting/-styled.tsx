import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '2.4rem',
  width: '100%',
});

export const SectionContainer = styled('div')({});

export const SectionTitleContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  columnGap: '0.2rem',
  marginBottom: '0.8rem',
  padding: '1.2rem 1.6rem 0',
});

export const OptionButtonContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
});

export const OptionButtonIconContainer = styled('div')(({ theme }) => ({
  width: '3.2rem',
  height: '3.2rem',

  padding: '0.2rem',
  borderRadius: '0.6rem',
  backgroundColor: theme.palette.color.base100,
}));
