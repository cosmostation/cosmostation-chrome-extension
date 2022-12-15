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

type CoinButtonProps = {
  'data-is-active'?: number;
};

export const CoinButton = styled('button')<CoinButtonProps>(({ theme, ...props }) => ({
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

export const CoinLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const CoinLeftImageContainer = styled('div')({
  '& > img': {
    width: '2.4rem',
    height: '2.4rem',
  },
});

export const CoinLeftInfoContainer = styled('div')({
  marginLeft: '0.8rem',
});

export const CoinLeftDisplayDenomContainer = styled('div')(({ theme }) => ({
  textAlign: 'left',
  color: theme.colors.text01,
}));

export const CoinLeftAvailableContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const CoinRightContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  '& > svg > path': {
    fill: theme.colors.base06,
  },
}));
