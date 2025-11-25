import { styled } from '@mui/material/styles';

import Button from '@/components/common/Button';
import Dialog from '@/components/common/Dialog';
import IconButton from '@/components/common/IconButton';

export const StyledDialog = styled(Dialog)({});

export const WrapperContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  maxWidth: '50rem',
  width: '30rem',
  height: '34rem',
});

type ContainerProps = {
  backgroundImage?: string;
};

export const Container = styled('div')<ContainerProps>(({ ...props }) => ({
  width: '100%',
  height: '30rem',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end',

  backgroundImage: `url(${props['backgroundImage']})`,
  backgroundSize: '30rem 30rem',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
}));

export const LaunchButtonContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',

  marginBottom: '6rem',
});

export const BottomContainer = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flex: 1,
  justifyContent: 'flex-start',
  alignItems: 'center',

  paddingLeft: '1.2rem',

  backgroundColor: theme.palette.color.base100,
}));

export const CloseButtonContainer = styled('div')({
  position: 'absolute',
  top: '2rem',
  right: '2rem',
});

export const StyledIconButton = styled(IconButton)({
  width: '2rem',
  height: '2rem',

  '& > svg': {
    width: '2rem',
    height: '2rem',
  },
});

type StyledButtonProps = {
  'data-bg-color': string;
  'data-bg-hover-color': string;
};

export const StyledButton = styled(Button)<StyledButtonProps>(({ ...props }) => ({
  width: '40%',
  height: '4rem',
  backgroundColor: props['data-bg-color'],
  '&:hover': {
    backgroundColor: props['data-bg-hover-color'],
  },
}));
