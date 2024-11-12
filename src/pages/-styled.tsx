import { Typography as BaseTypography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Image from '@/components/common/Image';
import OutlinedInput from '@/components/common/OutlinedInput';
import IconButton from '@/components/common/IconButton';
import { TabPanel } from '@/components/common/Tab';

export const Container = styled('div')({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
});

export const HeaderRightContainer = styled('div')({
  width: '100%',

  display: 'flex',
  alignItems: 'center',

  columnGap: '0.8rem',
});

export const BodyContainer = styled('div')({
  padding: '0.8rem 1.2rem',
});

export const StyledTabPanel = styled(TabPanel)({
  marginTop: '0',
  display: 'flex',
  flexDirection: 'column',

  overflow: 'hidden',
});

export const FilterIconButton = styled(IconButton)(({ theme }) => ({
  position: 'relative',

  width: '3.2rem',
  height: '3.2rem',

  borderRadius: '0.4rem',

  border: `0.1rem solid ${theme.palette.color.base200}`,
  backgroundColor: theme.palette.color.base100,
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
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  columnGap: '0.6rem',
});

export const StyledInput = styled(OutlinedInput)({
  height: '3.2rem',
});

export const AdCarouselContainer = styled('div')({
  margin: '0.8rem 0 1.1rem',
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

  marginBottom: '1.1rem',
});
