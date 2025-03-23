import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Image from '@/components/common/Image';

export const Container = styled('div')({});

export const TopContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  columnGap: '0.4rem',

  marginBottom: '0.8rem',
});

export const ChainImage = styled(Image)({
  width: '2.2rem',
  height: '2.2rem',
});

export const ButtonWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '0.8rem',
});

type OptionButtonProps = {
  isSelected: boolean;
};

export const OutlinedButton = styled('button')<OptionButtonProps>(({ theme, ...props }) => ({
  width: '100%',

  padding: '1.2rem',

  borderRadius: '0.6rem',

  backgroundColor: theme.palette.color.base100,

  border: props['isSelected'] ? `0.1rem solid ${theme.palette.accentColor.purple400}` : `0.1rem solid transparent`,

  boxSizing: 'border-box',

  '&:hover': {
    border: `0.1rem solid ${theme.palette.accentColor.purple400}`,
  },
}));

export const ButtonBodyContainer = styled('div')(({ theme }) => ({
  paddingBottom: '1rem',
  marginBottom: '1rem',

  borderBottom: `0.1rem solid ${theme.palette.color.base200}`,
}));

export const CoinTypeNameContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
});

export const CoinTypeNameTextContainer = styled('div')({
  display: 'flex',
});

export const DefaultText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1100,
}));

export const Badge = styled('div')(({ theme }) => ({
  borderRadius: '2rem',
  padding: '0.2rem 0.6rem',
  backgroundColor: theme.palette.accentColor.green100,
}));

export const AddressTextContainer = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  rowGap: '0.4rem',

  marginTop: '0.6rem',

  maxWidth: '100%',
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const AddressText = styled(Typography)(({ theme }) => ({
  width: '100%',
  color: theme.palette.color.base1000,

  textAlign: 'left',
}));

export const ButtonBottomContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
});

export const HdPathTextContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const HdPathText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1000,
}));

export const ValueContainer = styled('div')(({ theme }) => ({
  color: theme.palette.color.base1300,
}));
