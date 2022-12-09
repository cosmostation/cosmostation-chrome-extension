import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  padding: '2.1rem 1.6rem 1.6rem 1.6rem',
});

export const FeeCoinListContainer = styled('div')({});

export const FeeCoinContainerButton = styled('button')(({ theme }) => ({
  backgroundColor: theme.colors.base02,
  border: `0.1rem solid ${theme.colors.base03}`,

  borderRadius: '0.8rem',

  padding: '0.8rem 1.2rem 0.6rem 1.2rem',

  height: '4.8rem',
  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  cursor: 'pointer',
}));

export const FeeCoinLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const FeeCoinLeftImageContainer = styled('div')({
  '& > img': {
    width: '2.4rem',
    height: '2.4rem',
  },
});

export const FeeCoinLeftInfoContainer = styled('div')({
  marginLeft: '0.8rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

export const FeeCoinTitleContainer = styled('div')(({ theme }) => ({
  textAlign: 'left',
  color: theme.colors.text01,
}));

export const FeeCoinLeftHeaderTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));
