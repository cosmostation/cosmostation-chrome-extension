import { styled } from '@mui/material/styles';

import BaseChainImage from '@/components/common/BaseChainImage';

export const Divider = styled('div')(({ theme }) => ({
  width: '100%',
  borderBottom: `0.1rem solid ${theme.palette.color.base100}`,
}));

export const LineDivider = styled('div')(({ theme }) => ({
  width: '100%',
  borderBottom: `0.4rem solid ${theme.palette.color.base100}`,
}));

export const TxBaseInfoContainer = styled('div')({
  padding: '1.1rem 1.6rem',
});

export const DividerContainer = styled('div')({
  padding: '0 1.6rem',
});

export const ContentsContainer = styled('div')({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 3rem',
});

export const SwitchNetworkContainer = styled('div')({
  width: '80%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const NetworkContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const NetworkImage = styled(BaseChainImage)({
  width: '4.2rem',
  height: '4.2rem',
});

export const RightArrowIconContainer = styled('div')(({ theme }) => ({
  width: '2.4rem',
  height: '2.4rem',
  '& > svg': {
    width: '100%',
    height: '100%',
    fill: theme.palette.color.base800,

    '& > path': {
      fill: theme.palette.color.base800,
    },
  },
}));

export const InformationContainer = styled('div')({
  marginBottom: '1.6rem',
});
