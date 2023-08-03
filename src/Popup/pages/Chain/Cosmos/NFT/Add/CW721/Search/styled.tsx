import { styled } from '@mui/material/styles';

import Input from '~/Popup/components/common/Input';

import NoNFT40 from '~/images/icons/NoNFT40.svg';
import Search20Icon from '~/images/icons/Search20.svg';

export const Container = styled('div')({
  width: '100%',
  height: '100%',
  padding: '0.9rem 1.6rem 0',
  position: 'relative',
});

export const ImportCustomNFTButtonContainer = styled('div')({
  marginTop: '1.6rem',
});

export const ImportCustomNFTButton = styled('button')(({ theme }) => ({
  padding: 0,
  border: 0,
  marginBottom: '1.2rem',
  width: '100%',
  height: '4rem',
  borderRadius: '0.8rem',
  backgroundColor: theme.colors.base02,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '&:hover': {
    backgroundColor: theme.colors.base03,
    cursor: 'pointer',
  },
}));

export const ImportCustomNFTImage = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: '0.4rem',
  '& > svg': {
    '& > path': {
      fill: theme.accentColors.purple01,
    },
  },
}));

export const ImportCustomNFTText = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const ButtonContainer = styled('div')({
  position: 'absolute',
  width: 'calc(100% - 3.2rem)',
  bottom: '1.6rem',
});

export const ContentsContainer = styled('div')({
  height: '22.5rem',
  display: 'flex',
  justifyContent: 'center',
});

export const NFTIconBox = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

export const NoNFTIcon = styled(NoNFT40)({
  marginBottom: '0.8rem',
});

export const NFTIconText = styled('div')(({ theme }) => ({
  color: theme.colors.base05,
  textAlign: 'center',
}));

export const NFTList = styled('div')({
  display: 'grid',
  alignContent: 'start',
  gridTemplateColumns: '1fr',
  width: '32.8rem',
  rowGap: '0.4rem',
  overflow: 'auto',
});

export const StyledSearch20Icon = styled(Search20Icon)(({ theme }) => ({
  fill: theme.colors.base05,
}));

export const StyledInput = styled(Input)({
  height: '4rem',
  marginBottom: '1.2rem',
});
