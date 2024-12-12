import { styled } from '@mui/material/styles';

import OutlinedButton from '../common/OutlinedButton';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '3rem',
});

export const TopContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  marginBottom: '0.8rem',
});

export const FirstRow = styled('div')({});
export const SecondRow = styled('div')({});
export const ThirdRow = styled('div')({});

export const ButtonRow = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  columnGap: '0.6rem',
});

export const MnemonicButton = styled(OutlinedButton)({
  width: '100%',
  height: '3.2rem',
  padding: '1.2rem auto',
});
