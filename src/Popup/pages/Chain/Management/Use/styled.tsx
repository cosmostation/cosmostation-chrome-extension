import { styled } from '@mui/material/styles';

import Input from '~/Popup/components/common/Input';

import Search20Icon from '~/images/icons/Search20.svg';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0.8rem 1.6rem 0',

  overflow: 'auto',
});

export const StyledInput = styled(Input)({
  height: '4rem',
});

export const ListContainer = styled('div')({
  padding: '1.2rem 0',

  height: 'calc(100% - 4rem)',
});

export const StyledSearch20Icon = styled(Search20Icon)(({ theme }) => ({
  fill: theme.colors.base05,
}));

export const DividerContainer = styled('div')({
  margin: '1.2rem 0',
});
