import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
});

export const FilterContaienr = styled('div')({
  width: '100%',
  marginBottom: '1.2rem',
});

export const CoinButtonWrapper = styled('div')({
  width: '100%',
});

type StickyContentsContainerProps = {
  'data-is-bottom-sheet'?: boolean;
};

export const StickyContentsContainer = styled('div')<StickyContentsContainerProps>(({ theme, ...props }) => ({
  width: '100%',
  height: 'fit-content',
  position: 'sticky',
  top: props['data-is-bottom-sheet'] ? '0' : '3rem',

  padding: '0.8rem 1.2rem',

  boxSizing: 'border-box',

  zIndex: 1,
  backgroundColor: theme.palette.color.base50,
}));

export const EmptyAssetContainer = styled('div')({
  flex: 1,

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 0',
});
