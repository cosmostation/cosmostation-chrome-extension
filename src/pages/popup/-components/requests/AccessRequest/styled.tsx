import { styled } from '@mui/material/styles';

export const Divider = styled('div')(({ theme }) => ({
  width: '100%',
  borderBottom: `0.1rem solid ${theme.palette.color.base100}`,
}));

export const LineDivider = styled('div')(({ theme }) => ({
  width: '100%',
  borderBottom: `0.4rem solid ${theme.palette.color.base100}`,
}));

export const DividerContainer = styled('div')({
  padding: '0 1.6rem',
});

export const CheckListContainer = styled('div')({
  padding: '1.2rem 1.6rem',
});

export const CheckListTitleContainer = styled('div')({
  marginBottom: '1.2rem',
});

export const CheckListContentsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '1.6rem',
});

export const CheckListItemContainer = styled('div')({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  columnGap: '0.4rem',
});

export const InformationContainer = styled('div')({
  marginBottom: '1.6rem',
});
