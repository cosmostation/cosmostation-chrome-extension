import { Typography as BaseTypography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Image from '@/components/common/Image';
import { TabPanel } from '@/components/common/Tab';

export const Container = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  flex: '1',
});

export const HeaderRightContainer = styled('div')({
  width: '100%',

  display: 'flex',
  alignItems: 'center',

  columnGap: '0.8rem',
});

type StyledTabPanelProps = {
  'data-is-active': boolean;
};

export const StyledTabPanel = styled(TabPanel)<StyledTabPanelProps>(({ ...props }) => ({
  marginTop: '0',
  display: 'flex',
  flexDirection: 'column',
  flex: props['data-is-active'] ? '1' : '0',
  height: '100%',
}));

export const MarginTopTypography = styled(BaseTypography)(({ theme }) => ({
  marginTop: '0.4rem',

  color: theme.palette.color.base1300,
}));

export const MarginLeftTypography = styled(BaseTypography)(({ theme }) => ({
  marginLeft: '0.4rem',

  color: theme.palette.color.base1300,
}));

export const FilterContaienr = styled('div')({
  width: '100%',
  marginTop: '0.8rem',
});

export const AdCarouselContainer = styled('div')({
  margin: '0.8rem 0 1.1rem',

  overflow: 'hidden',
});

export const CarouselImg = styled(Image)(({ theme }) => ({
  width: '100%',
  height: '100%',

  border: `0.1rem solid ${theme.palette.color.base100}`,
  borderRadius: '0.4rem',

  '&:hover': {
    opacity: '0.8',
  },
}));

export const ManageCryptoContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  marginTop: '1.2rem',
});

export const CoinButtonWrapper = styled('div')({
  flex: '1',
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
  top: '7.9rem',

  padding: '0.8rem 1.2rem',

  boxSizing: 'border-box',

  zIndex: 1,
  backgroundColor: theme.palette.color.base50,
}));

export const EmptyAssetContainer = styled('div')({
  flex: 1,

  display: 'flex',
  height: '100%',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 0',
});
