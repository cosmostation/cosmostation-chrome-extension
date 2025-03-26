import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Divider = styled('div')(({ theme }) => ({
  width: '100%',
  borderBottom: `0.1rem solid ${theme.palette.color.base100}`,
}));

export const LineDivider = styled('div')(({ theme }) => ({
  width: '100%',
  borderBottom: `0.4rem solid ${theme.palette.color.base100}`,
}));

export const MsgTitleContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  padding: '1.6rem 1.2rem 1.2rem',
});

export const MsgTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.accentColor.purple400,
}));

export const TxBaseInfoContainer = styled('div')({
  padding: '1.1rem 1.6rem',
});

export const DividerContainer = styled('div')({
  padding: '0 1.6rem',
});

export const ContentsContainer = styled('div')({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

export const SticktFooterInnerBody = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',

  boxSizing: 'border-box',

  position: 'sticky',
  bottom: 0,
  zIndex: 1000,
  padding: '1.2rem 0',
  marginBottom: '-1.2rem',

  backgroundColor: theme.palette.color.base50,
}));
