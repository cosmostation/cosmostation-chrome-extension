import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
});

export const StickyContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',
  position: 'sticky',
  top: '3rem',

  padding: '0.8rem 1.2rem',

  boxSizing: 'border-box',

  zIndex: 1,
  backgroundColor: theme.palette.color.base50,
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

export const AddTextContainer = styled('div')(({ theme }) => ({
  color: theme.palette.accentColor.purple400,
  marginLeft: '0.2rem',
}));

export const Divider = styled('div')(({ theme }) => ({
  width: '100%',
  borderBottom: `0.1rem solid ${theme.palette.color.base100}`,
}));

export const ContentsContainer = styled('div')({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
});

export const AddressItemWrapper = styled('div')(({ theme }) => ({
  width: '100%',

  '& > *:last-child': {
    borderBottom: `0.1rem solid ${theme.palette.color.base200}`,
  },
}));

export const EmptyAssetContainer = styled('div')({
  flex: 1,

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 0',
});
