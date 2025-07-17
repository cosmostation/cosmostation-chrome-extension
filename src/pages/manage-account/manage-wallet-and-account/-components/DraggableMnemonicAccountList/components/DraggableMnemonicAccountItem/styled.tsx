import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import OutlinedButton from '@/components/common/OutlinedButton';

type ContainerProps = {
  'data-is-dragging': boolean;
};

export const Container = styled('div')<ContainerProps>(({ theme, ...props }) => ({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',

  paddingBottom: '1.2rem',

  borderBottom: `0.06rem solid ${theme.palette.color.base200}`,
  opacity: props['data-is-dragging'] ? 0 : 0.999,
}));

export const TopButton = styled('button')(({ theme }) => ({
  width: '100%',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  height: '4.1rem',

  padding: '0 1.6rem',

  boxSizing: 'border-box',

  border: 'none',
  background: 'none',

  cursor: 'pointer',

  '&:hover': {
    backgroundColor: theme.palette.color.base200,
  },
}));

export const TopLeftContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  columnGap: '0.4rem',
});

export const NotBackedUpText = styled(Typography)(({ theme }) => ({
  marginLeft: '0.4rem',
  color: theme.palette.accentColor.red400,
}));

export const TopRightContainer = styled('div')({});

export const BodyContainer = styled('div')({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

export const AccountButton = styled('button')(({ theme }) => ({
  width: '100%',
  height: '6rem',

  display: 'flex',
  alignItems: 'center',

  border: 'none',
  background: 'none',

  cursor: 'pointer',

  padding: '0 1.6rem',

  '&:hover': {
    backgroundColor: theme.palette.color.base200,
  },
}));

export const AccountLeftContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  columnGap: '1rem',

  marginRight: 'auto',
});

export const AccountRightContainer = styled('div')({});

export const AccountInfoContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',

  rowGap: '0.3rem',
});

export const LastHdPathTextContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const LastHdPathText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1000,
}));

export const LastHdPathIndexText = styled('div')(({ theme }) => ({
  color: theme.palette.color.base1000,
}));

export const OutlinedButtonContainer = styled('div')({
  width: '100%',
  padding: '0.8rem 1.6rem 0',
  boxSizing: 'border-box',
});

export const StyledOutlinedButton = styled(OutlinedButton)({
  height: '3.2rem',
});

export const RightArrowIconContainer = styled('div')(({ theme }) => ({
  width: '1.2rem',
  height: '1.2rem',
  '& > svg': {
    width: '100%',
    height: '100%',
    fill: theme.palette.color.base800,
    '& > path': {
      fill: theme.palette.color.base800,
    },
  },
}));
