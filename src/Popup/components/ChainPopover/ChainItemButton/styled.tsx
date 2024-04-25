import { styled } from '@mui/material/styles';

type StyledButtonProps = {
  'data-is-active'?: number;
};

export const StyledButton = styled('button')<StyledButtonProps>(({ theme, ...props }) => ({
  border: 'none',

  width: '100%',
  height: '3rem',

  borderRadius: '0.8rem',

  backgroundColor: props['data-is-active'] ? theme.colors.base02 : 'transparent',
  color: theme.colors.text01,

  padding: '0',

  '&:hover': {
    backgroundColor: theme.colors.base02,

    '& > div': {
      '& > div:nth-of-type(3)': {
        backgroundColor: theme.colors.base02,
        display: 'flex',
      },
    },
  },

  cursor: 'pointer',

  position: 'relative',
}));

export const ContentContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  width: '100%',

  paddingLeft: '0.8rem',
});

export const ContentLeftContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
});

export const ContentLeftImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  padding: '0',
  marginRight: '0.4rem',

  position: 'relative',

  width: '2rem',
  height: '2rem',
});

type ContentLeftAbsoluteCustomImageContainerProps = {
  'data-is-custom'?: boolean;
};

export const ContentLeftAbsoluteImageContainer = styled('div')<ContentLeftAbsoluteCustomImageContainerProps>(({ ...props }) => ({
  position: 'absolute',

  width: '2rem',
  height: '2rem',

  '& > img': {
    width: props['data-is-custom'] ? '1.6rem' : '2rem',
    height: props['data-is-custom'] ? '1.6rem' : '2rem',

    margin: props['data-is-custom'] ? '0.2rem' : '0',
  },
}));

export const ContentLeftTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  maxWidth: '10rem',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export const ContentRightContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
});

type ContentRightImageContainerProps = {
  'data-is-background-active'?: number;
};

export const ContentRightImageContainer = styled('div')<ContentRightImageContainerProps>(({ theme, ...props }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  paddingRight: props['data-is-background-active'] ? '1.5rem' : '0.6rem',

  '& > svg > path': {
    fill: theme.colors.base06,
  },
}));

export const DeleteContainer = styled('div')(({ theme }) => ({
  display: 'none',
  justifyContent: 'center',
  alignItems: 'center',

  position: 'absolute',

  right: '0.6rem',

  '& > svg': {
    fill: theme.colors.base05,
  },
}));

export const BackgroundActive = styled('div')(({ theme }) => ({
  width: '0.6rem',
  height: '0.6rem',
  borderRadius: '50%',
  backgroundColor: theme.accentColors.green01,
}));
