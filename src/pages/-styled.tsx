import { Typography as BaseTypography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Image from '@/components/common/Image';
import OutlinedInput from '@/components/common/OutlinedInput';
import IconButton from '@/components/IconButton';
import { TabPanel } from '@/components/Tab';

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

export const SpacedTypography = styled(BaseTypography)(({ theme }) => ({
  marginTop: '0.4rem',

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
  margin: '1.6rem 0',
});

export const CarouselImg = styled(Image)(({ theme }) => ({
  width: '100%',
  height: '100%',

  border: `0.1rem solid ${theme.palette.color.base100}`,
  borderRadius: '0.4rem',
}));
