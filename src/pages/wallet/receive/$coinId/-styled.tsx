import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';
import BaseCoinImage from '@/components/common/BaseCoinImage';
import IconButton from '@/components/common/IconButton';

export const Container = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const FilledTabContainer = styled('div')({
  width: '100%',
  height: 'fit-content',
});

export const CoinContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',

  marginTop: '1.4rem',
});

export const CoinImage = styled(BaseCoinImage)({
  width: '5.4rem !important',
  height: '5.4rem !important',

  position: 'absolute',

  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});

export const CoinSymbolText = styled(Base1300Text)({
  marginTop: '0.8rem',
});

export const CoinDenomContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',

  marginTop: '0.4rem',

  color: `${theme.palette.color.base1000} !important`,

  '& *': {
    color: `${theme.palette.color.base1000} !important`,
  },
}));

export const QRBorderContainer = styled('div')(({ theme }) => ({
  padding: '1.6rem',
  borderRadius: '0.8rem',
  position: 'relative',

  border: `0.1px dashed ${theme.palette.color.base800}`,
  marginTop: '1.6rem',
}));

export const CornerIconContainer = styled('div')({
  width: '2.7rem',
  height: '2.7rem',

  '& > svg': {
    width: '2.7rem',
    height: '2.7rem',
  },
});

export const BottomLeftCornerContainer = styled('div')({
  position: 'absolute',
  bottom: '-0.3rem',
  left: '-0.3rem',
});

export const BottomRightCornerContainer = styled('div')({
  position: 'absolute',
  bottom: '-0.3rem',
  right: '-0.3rem',
  transform: 'rotate(-90deg)',
});

export const TopLeftCornerContainer = styled('div')({
  position: 'absolute',
  top: '-0.3rem',
  left: '-0.3rem',
  transform: 'rotate(90deg)',
});

export const TopRightCornerContainer = styled('div')({
  position: 'absolute',
  top: '-0.3rem',
  right: '-0.3rem',
  transform: 'rotate(180deg)',
});

export const QRContainer = styled('div')(({ theme }) => ({
  width: 'fit-content',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  padding: '0.8rem',

  borderRadius: '0.8rem',

  backgroundColor: theme.palette.color.base1300,
}));

export const AddressContainer = styled('div')(({ theme }) => ({
  width: '100%',
  padding: '1.2rem',
  borderRadius: '0.6rem',
  backgroundColor: theme.palette.color.base100,
  boxSizing: 'border-box',
  marginTop: '2.4rem',
}));

export const AddressTopContainer = styled('div')(({ theme }) => ({
  marginBottom: '1.2rem',
  borderBottom: `0.1rem solid ${theme.palette.color.base200}`,
}));

export const AddressTopTitleContainer = styled('div')({
  textAlign: 'left',
});

export const AddressBodyContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  margin: '0.4rem 0 1.2rem',
});

export const AddressText = styled(Base1300Text)({
  width: '90%',
  wordBreak: 'break-all',
});

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  width: '2rem',
  height: '2rem',
  '& > svg': {
    width: '2rem',
    height: '2rem',
    '& > path': {
      fill: theme.palette.accentColor.purple400,
    },
  },

  '&:hover': {
    opacity: '1',
    '& > svg > path': {
      fill: theme.palette.accentColor.purple500,
    },
  },
}));

export const AddressBottomContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '1.2rem',
});

export const InfoIconContainer = styled('div')(({ theme }) => ({
  width: '1.4rem',
  height: '1.4rem',
  marginRight: '0.2rem',
  '& > svg': {
    width: '1.4rem',
    height: '1.4rem',
    '& > path': {
      fill: theme.palette.color.base1000,
    },
  },
}));
