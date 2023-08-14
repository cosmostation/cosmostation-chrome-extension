import { styled } from '@mui/material/styles';

import Input from '~/Popup/components/common/Input';

import Search20Icon from '~/images/icons/Search20.svg';

export const Container = styled('div')({
  width: '100%',
  height: '100%',
  padding: '0.9rem 1.6rem 0',
  position: 'relative',
});

export const ButtonContainer = styled('div')({
  position: 'absolute',
  width: 'calc(100% - 3.2rem)',
  bottom: '1.6rem',
});

export const ContentsContainer = styled('div')({
  height: 'calc(100% - 13.5rem)',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
});

export const NFTList = styled('div')({
  height: '100%',

  display: 'grid',
  alignContent: 'start',
  gridTemplateColumns: '1fr',
  rowGap: '0.4rem',
  overflow: 'auto',

  margin: '0 -1.6rem',
  padding: '0 1.6rem 0.1rem',
});

export const StyledSearch20Icon = styled(Search20Icon)(({ theme }) => ({
  fill: theme.colors.base05,
}));

export const StyledInput = styled(Input)({
  height: '4rem',
  marginBottom: '1.2rem',
});
