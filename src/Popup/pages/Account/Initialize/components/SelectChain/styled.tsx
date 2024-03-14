import { styled } from '@mui/material/styles';

import Input from '~/Popup/components/common/Input';

import Search20Icon from '~/images/icons/Search20.svg';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: 0,

  overflow: 'auto',
});

export const StyledInput = styled(Input)({
  height: '4rem',
});

export const ChainContainer = styled('div')({
  marginTop: '1.2rem',
  height: 'calc(100% - 4rem - 1.2rem)',
});

export const ListContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  columnGap: '2rem',

  overflow: 'auto',
});

export const ItemContainer = styled('div')({
  width: '100%',
  height: '4rem',

  padding: 0,

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const ItemLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const ItemLeftImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  '& > img': {
    width: '2.8rem',
    height: '2.8rem',
  },
});

export const ItemLeftTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  marginLeft: '0.4rem',
}));

export const ItemRightContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
});

export const StyledSearch20Icon = styled(Search20Icon)(({ theme }) => ({
  fill: theme.colors.base05,
}));
export const DividerContainer = styled('div')({
  margin: '1.2rem 0',
});
