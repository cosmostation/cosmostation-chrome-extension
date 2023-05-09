import { styled } from '@mui/material/styles';

import Popover from '~/Popup/components/common/Popover';

export const StyledPopover = styled(Popover)({
  '& .MuiPaper-root': {
    marginTop: '0.8rem',

    '& > div': {
      width: '16rem',
      maxHeight: '25rem',
    },
  },
});

export const Container = styled('div')({
  padding: '0.4rem',

  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.2rem',
  overflow: 'auto',
});

type TypeButtonProps = {
  'data-is-active'?: number;
};

export const TypeButton = styled('button')<TypeButtonProps>(({ theme, ...props }) => ({
  backgroundColor: props['data-is-active'] ? theme.colors.base02 : 'transparent',
  border: 0,

  borderRadius: '0.8rem',

  padding: '0.65rem 0.8rem',

  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  cursor: 'pointer',

  '&:hover': {
    backgroundColor: theme.colors.base02,
  },
}));

export const TypeLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const TypeLeftTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const TypeLeftNumberContainer = styled('div')(({ theme }) => ({
  marginLeft: '0.4rem',
  color: theme.colors.text02,
}));

export const TypeRightContainer = styled('div')(({ theme }) => ({
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
