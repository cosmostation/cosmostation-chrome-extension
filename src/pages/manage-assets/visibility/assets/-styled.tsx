import { styled } from '@mui/material/styles';

import IconButton from '@/components/common/IconButton';
import OutlinedInput from '@/components/common/OutlinedInput';
import { TabPanel } from '@/components/common/Tab';

export const Container = styled('div')({
  width: '100%',
});

export const StyledTabPanel = styled(TabPanel)({
  marginTop: '0',
  display: 'flex',
  flexDirection: 'column',
});

export const FilterIconButton = styled(IconButton)(({ theme }) => ({
  position: 'relative',

  width: '3.2rem',
  height: '3.2rem',

  borderRadius: '0.4rem',

  border: `0.1rem solid ${theme.palette.color.base200}`,
  backgroundColor: theme.palette.color.base100,
}));

export const FilterContaienr = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  columnGap: '0.6rem',

  margin: '0.8rem 0 1rem',
});

export const StyledInput = styled(OutlinedInput)({
  height: '3.2rem',
});

export const CoinButtonWrapper = styled('div')({
  width: '100%',
});

export const StickyTabContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',
  position: 'sticky',
  top: '3rem',

  zIndex: 1,
  backgroundColor: theme.palette.color.base50,
}));

export const StickyTabPanelContentsContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',
  position: 'sticky',
  top: '7.8rem',

  padding: '0.8rem 1.2rem',

  boxSizing: 'border-box',

  zIndex: 1,
  backgroundColor: theme.palette.color.base50,
}));

export const RowContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const PurpleContainer = styled('div')(({ theme }) => ({
  '& > svg': {
    fill: theme.palette.accentColor.purple400,
    '& > path': {
      fill: theme.palette.accentColor.purple400,
    },
  },
}));

export const ImportTextContainer = styled('div')(({ theme }) => ({
  color: theme.palette.accentColor.purple400,
  marginLeft: '0.2rem',
}));
