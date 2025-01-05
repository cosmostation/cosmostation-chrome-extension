import { styled } from '@mui/material/styles';

import IconButton from '../common/IconButton';

export const ContentsContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  columnGap: '1rem',
  padding: '1rem 0 ',
});

export const WebsiteImageWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '3.5rem',
  height: '3.5rem',
  borderRadius: '50%',
  backgroundColor: '#181A1F',
  border: `0.18rem solid ${theme.palette.accentColor.green500}`,
}));

export const WebsiteImageContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '95%',
  height: '95%',
  borderRadius: '50%',
  backgroundColor: theme.palette.color.base1300,
  '& > img': {
    width: '3rem',
    height: '3rem',
    borderRadius: '50%',
  },
}));

export const ContentsInfoContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  rowGap: '0.4rem',
});

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
  width: '3.1rem',
  height: '3.1rem',
  borderRadius: '50%',
  border: `0.13rem solid ${theme.palette.color.base200}`,
}));
