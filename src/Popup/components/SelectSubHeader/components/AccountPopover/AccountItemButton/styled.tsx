import { styled } from '@mui/material/styles';

type StyledButtonProps = {
  'data-is-active'?: number;
};

export const StyledButton = styled('button')<StyledButtonProps>(({ theme, ...props }) => ({
  border: 'none',

  width: '100%',
  height: '4.8rem',

  borderRadius: '0.8rem',

  backgroundColor: props['data-is-active'] ? theme.colors.base02 : 'transparent',
  color: theme.colors.text01,

  padding: '0.8rem 1.2rem 0.7rem 1.2rem',

  '&:hover': {
    backgroundColor: theme.colors.base02,
  },

  cursor: 'pointer',

  position: 'relative',
}));

export const ContentContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  width: '100%',
});

export const ContentLeftContainer = styled('div')({
  display: 'flex',
  // alignItems: 'center',
  justifyContent: 'flex-start',
});

export const ContentLeftTextContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
});

export const ContentLeftTitleContainer = styled('div')({
  width: 'max-content',
  display: 'flex',
  alignItems: 'center',
});

export const ContentLeftTitleTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const ContentLeftTitleLedgerContainer = styled('div')(({ theme }) => ({
  marginLeft: '0.2rem',

  height: '1.4rem',
  width: '1.4rem',

  '& > svg > path': {
    fill: theme.colors.base06,
  },
}));

export const ContentLeftDescriptionContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
  marginTop: '0.1rem',
}));

export const ContentRightContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
});

export const ContentRightImageContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& > svg > path': {
    fill: theme.colors.base06,
  },
}));

export const ConnectContainer = styled('div')({
  display: 'grid',
  gridAutoColumns: '1fr',
  width: '1.2rem',
});

export const ConnectBadgeContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

type ConnectBadgeProps = {
  'data-is-connected': number;
};

export const ConnectBadge = styled('div')<ConnectBadgeProps>(({ theme, ...props }) => ({
  width: '0.6rem',
  height: '0.6rem',

  borderRadius: '50%',

  backgroundColor: props['data-is-connected'] ? theme.accentColors.green01 : theme.accentColors.red,
}));
