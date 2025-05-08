import { styled } from '@mui/material/styles';

import BottomSheet from '@/components/common/BottomSheet';
import ValidatorImage from '@/components/common/ValidatorImage';

export const Container = styled('div')({
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
});

export const Header = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  padding: '1.6rem',

  borderBottom: `0.1rem solid ${theme.palette.color.base200}`,

  flexShrink: 0,
}));

export const HeaderTitle = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.6rem',
});

export const StyledValidatorImage = styled(ValidatorImage)({
  width: '2.8rem',
  height: '2.8rem',

  '& > img': {
    width: '100%',
    height: '100%',
  },
});

export const Body = styled('div')({
  width: '100%',
});

export const StyledBottomSheet = styled(BottomSheet)({
  '& .MuiPaper-root': {
    minHeight: '35rem',
  },
});

export const StyledButton = styled('button')(({ theme }) => ({
  backgroundColor: 'transparent',
  padding: 0,
  margin: 0,
  border: 0,

  height: '2.4rem',

  cursor: 'pointer',

  '& > svg': {
    fill: theme.palette.color.base400,
  },
}));
