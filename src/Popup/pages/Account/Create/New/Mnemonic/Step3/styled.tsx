import { styled } from '@mui/material/styles';

import Input from '~/Popup/components/common/Input';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0.8rem 1.6rem 0',

  position: 'relative',
});

export const StyledInput = styled(Input)(({ theme }) => ({
  height: '4rem',

  backgroundColor: theme.colors.base02,
}));

export const CheckWordContainer = styled('div')({
  marginTop: '1.2rem',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  columnGap: '0.6rem',
  rowGap: '1.9rem',
});

export const CheckWordItemContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const CheckWordItemNoContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  color: theme.accentColors.purple01,

  width: '2rem',
}));

export const CheckWordItemInputContainer = styled('div')({
  width: '12.8rem',

  marginLeft: '0.4rem',
});

export const BottomContainer = styled('div')({
  position: 'absolute',

  width: 'calc(100% - 3.2rem)',

  bottom: '1.6rem',
});
