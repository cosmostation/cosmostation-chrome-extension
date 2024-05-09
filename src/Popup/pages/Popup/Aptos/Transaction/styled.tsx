import { CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

import { TabPanel } from '~/Popup/components/common/Tab';

export const Container = styled('div')({
  position: 'relative',

  height: '100%',
});

export const ContentContainer = styled('div')({
  height: 'calc(100% - 17.2rem)',

  padding: '1.2rem 1.6rem 0',
});

export const StyledTabPanel = styled(TabPanel)({
  marginTop: '1.6rem',
  height: 'calc(100% - 4.8rem)',
});

export const FeeContainer = styled('div')(({ theme }) => ({
  marginTop: '0.8rem',
  padding: '1.6rem',
  border: `0.1rem solid ${theme.colors.base03}`,

  borderRadius: '0.8rem',
}));

export const FeeInfoContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
});

export const FeeLeftContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,

  display: 'flex',
}));

export const FeeRightContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
});

export const FeeRightColumnContainer = styled('div')({});

export const FeeRightAmountContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',

  color: theme.colors.text01,
}));

export const FeeRightValueContainer = styled('div')(({ theme }) => ({
  marginTop: '0.2rem',

  display: 'flex',
  justifyContent: 'flex-end',

  color: theme.colors.text02,
}));

export const FeeEditContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',

  marginTop: '1.2rem',
});

export const FeeEditLeftContainer = styled('div')({ display: 'flex', justifyContent: 'flex-start' });

export const FeeEditRightContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',

  '& > :nth-of-type(n + 1)': { marginLeft: '0.4rem' },
});

type FeeButtonProps = {
  'data-is-active'?: number;
};

export const FeeButton = styled('button')<FeeButtonProps>(({ theme, ...props }) => ({
  border: 0,
  padding: '0.4rem 0',

  borderRadius: '5rem',

  minWidth: '5rem',

  backgroundColor: props['data-is-active'] ? theme.accentColors.purple01 : theme.colors.base03,
  color: props['data-is-active'] ? theme.accentColors.white : theme.colors.text02,

  '& > svg': {
    fill: props['data-is-active'] ? theme.colors.text01 : theme.colors.text02,
    '& > path': {
      fill: props['data-is-active'] ? theme.colors.text01 : theme.colors.text02,
    },
  },

  cursor: 'pointer',

  '&:hover': {
    opacity: 0.8,
  },
}));

export const BottomContainer = styled('div')({
  position: 'absolute',

  bottom: '1.6rem',
  left: '1.6rem',

  width: 'calc(100% - 3.2rem)',
});

export const BottomButtonContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  columnGap: '0.8rem',
});

export const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  marginLeft: '0.4rem',
  '&.MuiCircularProgress-root': {
    color: theme.accentColors.green01,
  },
}));

export const WarningContainer = styled('div')({
  padding: '1.2rem 2.2rem 1.2rem 1.6rem',

  borderRadius: '0.8rem',

  backgroundColor: 'rgba(205, 26, 26, 0.15)',

  display: 'flex',

  marginBottom: '0.8rem',
});

export const WarningIconContainer = styled('div')(({ theme }) => ({
  '& > svg': {
    '& > path': {
      fill: theme.accentColors.red,
    },
  },
}));

export const WarningTextContainer = styled('div')(({ theme }) => ({
  marginLeft: '0.4rem',
  color: theme.accentColors.red,
}));
