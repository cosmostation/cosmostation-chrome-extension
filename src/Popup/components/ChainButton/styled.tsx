import { styled } from '@mui/material/styles';

export const StyledButton = styled('button')(({ theme }) => ({
  border: 'none',

  height: '3rem',

  borderRadius: '0.8rem',

  backgroundColor: theme.colors.base03,
  color: theme.accentColors.white,

  padding: '0',

  textAlign: 'left',

  '&:hover': {
    backgroundColor: theme.colors.base04,
  },

  cursor: 'pointer',
}));

export const ContentContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  paddingLeft: '0.8rem',
});

export const ContentLeftImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginRight: '0.4rem',

  width: '2.4rem',
  height: '2.4rem',
  position: 'relative',
});

type ContentLeftAbsoluteImageContainerProps = {
  'data-is-custom'?: boolean;
};

export const ContentLeftAbsoluteImageContainer = styled('div')<ContentLeftAbsoluteImageContainerProps>(({ ...props }) => ({
  position: 'absolute',

  width: '2.4rem',
  height: '2.4rem',

  '& > img': {
    width: props['data-is-custom'] ? '2rem' : '2.4rem',
    height: props['data-is-custom'] ? '2rem' : '2.4rem',

    margin: props['data-is-custom'] ? '0.2rem' : '0',
  },
}));

export const ContentCenterTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
  maxWidth: '10rem',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export const ContentRightImageContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  padding: '0 0.4rem',

  '& > svg': {
    width: '1.6rem',
    height: '1.6rem',

    fill: theme.colors.base05,
  },
}));
