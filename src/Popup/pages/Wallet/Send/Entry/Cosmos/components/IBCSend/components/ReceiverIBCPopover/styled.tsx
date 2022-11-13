import { styled } from '@mui/material/styles';

import Popover from '~/Popup/components/common/Popover';

export const StyledPopover = styled(Popover)({
  '& .MuiPaper-root': {
    marginTop: '0.8rem',

    '& > div': {
      width: '32.6rem',
      maxHeight: '25rem',
    },
  },
});

export const Container = styled('div')({
  padding: '1.6rem 1.2rem',

  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.8rem',
  overflow: 'auto',
});

type ChainButtonProps = {
  'data-is-active'?: number;
};

export const ChainButton = styled('button')<ChainButtonProps>(({ theme, ...props }) => ({
  backgroundColor: props['data-is-active'] ? theme.colors.base02 : 'transparent',
  border: 0,

  borderRadius: '0.8rem',

  padding: '0.8rem 1.2rem 0.6rem 1.2rem',

  height: '4.8rem',
  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  cursor: 'pointer',

  '&:hover': {
    backgroundColor: theme.colors.base03,
  },
}));

export const ChainLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const ChainLeftImageContainer = styled('div')({
  '& > img': {
    width: '2.4rem',
    height: '2.4rem',
  },
});

export const ChainLeftInfoContainer = styled('div')({
  marginLeft: '0.8rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

export const ChainLeftChainNameContainer = styled('div')(({ theme }) => ({
  textAlign: 'left',
  color: theme.colors.text01,
}));

export const ChainLeftChannelIdContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const ChainRightContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  '& > svg': {
    '& > path': {
      stroke: theme.colors.base06,
      fill: theme.colors.base06,
    },
  },
}));
