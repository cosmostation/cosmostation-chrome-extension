import { styled } from '@mui/material/styles';

export const Container = styled('div')(({ theme }) => ({
  padding: '1.6rem',

  backgroundColor: theme.palette.color.base100,

  color: theme.palette.commonColor.commonWhite,
  borderRadius: '0.8rem',

  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  boxSizing: 'border-box',
}));

export const TxDataContainer = styled('div')(({ theme }) => ({
  color: theme.palette.commonColor.commonWhite,

  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
}));

export const Header = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  marginBottom: '1.6rem',
  paddingBottom: '1.6rem',

  borderBottom: `0.1rem solid ${theme.palette.color.base200}`,

  flexShrink: 0,
}));

export const HeaderTitle = styled('div')(({ theme }) => ({
  display: 'flex',
  color: theme.palette.color.base1300,
  columnGap: '0.4rem',
  alignItems: 'center',
}));
