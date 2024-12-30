import { styled } from '@mui/material/styles';

export const WebsiteImageWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '4rem',
  height: '4rem',
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
