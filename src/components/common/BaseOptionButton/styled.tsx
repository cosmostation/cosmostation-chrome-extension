import { styled } from '@mui/material/styles';

type StyledButtonProps = {
  isActive: boolean;
};

export const StyledButton = styled('button')<StyledButtonProps>(({ theme, ...props }) => ({
  width: '100%',

  display: 'flex',
  alignItems: 'center',

  padding: '1.2rem 1.6rem',

  position: 'relative',

  backgroundColor: props['isActive'] ? theme.palette.color.base200 : 'transparent',
  border: 'none',

  cursor: 'pointer',

  '&: disabled': {
    cursor: 'not-allowed',
  },
  '&: hover': {
    backgroundColor: theme.palette.color.base100,
  },
}));

export const ActiveLabel = styled('div')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  width: '0.4rem',
  height: '100%',
  backgroundColor: theme.palette.accentColor.purple400,
}));

export const LeftContainer = styled('div')({
  width: 'fit-content',

  marginRight: '1.2rem',
});

export const MiddleContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',

  rowGap: '0.4rem',
});

export const RightContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  columnGap: '0.6rem',

  marginLeft: 'auto',
});
