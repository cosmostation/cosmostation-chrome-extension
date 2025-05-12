import { styled } from '@mui/material/styles';

import OutlinedChipButton from '@/components/OutlinedChipButton';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
});

export const TxResultContainer = styled('div')({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  rowGap: '0.6rem',
});

export const StyledOutlinedChipButton = styled(OutlinedChipButton)({
  position: 'absolute',
  bottom: '-4.2rem',
});

export const TxHashTextContainer = styled('div')({
  maxWidth: '33rem',
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
  textAlign: 'center',
});

export const ExplorerIconContainer = styled('div')(({ theme }) => ({
  width: '1.6rem',
  height: '1.6rem',
  marginRight: '0.4rem',
  '& > svg': {
    width: '100%',
    height: '100%',
    fill: theme.palette.color.base800,
    '& > path': {
      fill: theme.palette.color.base800,
    },
  },
}));

export const FooterContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  columnGap: '0.4rem',

  marginBottom: '2.8rem',
});
