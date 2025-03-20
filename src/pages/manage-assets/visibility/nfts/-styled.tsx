import { styled } from '@mui/material/styles';

import BaseChainImage from '@/components/common/BaseChainImage';
import BaseNFTImage from '@/components/common/BaseNFTImage';

export const Container = styled('div')({
  width: '100%',
});

export const StickyContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',
  position: 'sticky',
  top: '3rem',

  zIndex: 1,
  padding: '0.8rem 1.2rem',

  backgroundColor: theme.palette.color.base50,
  boxSizing: 'border-box',
}));

export const RowContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  marginTop: '1rem',
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

export const NetworkCountContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.2rem',
});

export const ButtonWrapper = styled('div')({
  width: '100%',
});

export const ChainImage = styled(BaseChainImage)({
  width: '3.6rem',
  height: '3.6rem',
});

export const IconContainer = styled('div')({
  marginLeft: '0.6rem',
});

export const InfoIconContainer = styled('div')(({ theme }) => ({
  width: '1.6rem',
  height: '1.6rem',
  '& > svg': {
    width: '100%',
    height: '100%',
    fill: theme.palette.color.base1300,
    '& > path': {
      fill: theme.palette.color.base1300,
    },
  },
}));

export const DeleteNFTContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

export const DeleteNFTImageContainer = styled('div')({
  width: '4.2rem',
  height: '4.2rem',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '0.8rem',

  '& > img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});

export const DeleteNFTImage = styled(BaseNFTImage)({});

export const TopContainer = styled('div')({});
export const BodyContainer = styled('div')({});
