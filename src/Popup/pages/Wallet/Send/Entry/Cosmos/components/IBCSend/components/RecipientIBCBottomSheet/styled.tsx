import { CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

import BottomSheet from '~/Popup/components/common/BottomSheet';
import Input from '~/Popup/components/common/Input';

import Search20Icon from '~/images/icons/Search20.svg';

export const Container = styled('div')({
  height: '100%',

  padding: '1.6rem 1.6rem 0',
  overflow: 'hidden',

  display: 'flex',
  flexDirection: 'column',
});

export const Header = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  flexShrink: 0,
});

export const HeaderTitle = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const StyledSearch20Icon = styled(Search20Icon)(({ theme }) => ({
  fill: theme.colors.base05,
}));

export const StyledInput = styled(Input)({
  height: '4rem',
  margin: '1.6rem 0',
});

export const AssetList = styled('div')({});

export const StyledBottomSheet = styled(BottomSheet)({
  '& .MuiPaper-root': {
    height: '54.8rem',

    width: '36rem',

    borderRadius: 0,
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
    fill: theme.colors.base05,
  },
}));

type ChainButtonProps = {
  'data-is-active'?: number;
};

export const ChainButton = styled('button')<ChainButtonProps>(({ theme, ...props }) => ({
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

export const ChainLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const ChainLeftImageContainer = styled('div')({
  '& > img': {
    width: '2.4rem',
    height: '2.4rem',
  },
});

export const ChainLeftInfoContainer = styled('div')({
  marginLeft: '0.8rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

export const ChainLeftChainNameContainer = styled('div')(({ theme }) => ({
  textAlign: 'left',
  color: theme.colors.text01,
}));

export const ChainLeftChannelIdContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const ChainRightContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  '& > svg > path': {
    fill: theme.colors.base06,
  },
}));

export const ContentContainer = styled('div')({
  height: '100%',

  margin: '0 -1.6rem',
  padding: '0 1.6rem',

  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.8rem',

  overflow: 'auto',

  paddingBottom: '0.8rem',
});

export const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  '&.MuiCircularProgress-root': {
    color: theme.accentColors.purple01,
  },
}));

export const StyledCircularProgressContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});
