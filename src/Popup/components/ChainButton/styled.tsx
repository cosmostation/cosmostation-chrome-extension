import { styled } from '@mui/material/styles';

export const StyledButton = styled('button')(({ theme }) => ({
  border: 'none',

  height: '2.8rem',

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
});

export const ContentLeftImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  padding: '0 0.4rem 0 0.8rem',

  '& > img': {
    width: '1.6rem',
    height: '1.6rem',
  },
});

type ContentCenterTextContainerProps = {
  'data-is-with-network'?: number;
};

export const ContentCenterTextContainer = styled('div')<ContentCenterTextContainerProps>(({ theme, ...props }) => ({
  color: theme.colors.text01,
  maxWidth: props['data-is-with-network'] ? '3.5rem' : '10rem',

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
