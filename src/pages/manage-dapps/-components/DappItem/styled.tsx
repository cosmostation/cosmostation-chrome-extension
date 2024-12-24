import { styled } from '@mui/material/styles';

import IconButton from '@/components/common/IconButton';

export const Container = styled('div')({
  width: '100%',
  padding: '1.6rem',
  boxSizing: 'border-box',
});

export const ContentsContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const ContentsLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  columnGap: '1rem',
});

export const ContentsRightContainer = styled('div')({});

export const WebsiteImageContainer = styled('div')({
  width: '3.2rem',
  height: '3.2rem',
  borderRadius: '50%',
  '& > img': {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
  },
});

export const ContentsInfoContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  rowGap: '0.4rem',
});

export const TotalTxContainer = styled('div')({
  display: 'flex',
});

export const DeleteIconButton = styled(IconButton)(({ theme }) => ({
  '&: hover': {
    opacity: '1',
    '& > svg': {
      fill: theme.palette.accentColor.red100,
      '& > path': {
        fill: theme.palette.accentColor.red100,
      },
    },
  },
}));
