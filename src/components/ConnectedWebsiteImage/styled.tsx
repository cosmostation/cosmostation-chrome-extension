import { styled } from '@mui/material/styles';

export const WebsiteImageWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '4rem',
  height: '4rem',
  borderRadius: '50%',
  backgroundColor: '#181A1F',
  border: `0.24rem solid ${theme.palette.accentColor.green500}`,
}));

export const WebsiteImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '80%',
  height: '80%',
  borderRadius: '50%',
  '& > img': {
    width: '80%',
    height: '80%',
    borderRadius: '50%',
  },
});
