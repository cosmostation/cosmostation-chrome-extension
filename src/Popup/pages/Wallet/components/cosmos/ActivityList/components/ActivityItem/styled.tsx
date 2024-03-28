import { styled } from '@mui/material/styles';

export const StyledButton = styled('button')(({ theme }) => ({
  width: '100%',

  backgroundColor: theme.colors.base02,
  border: `0.1rem solid ${theme.colors.base02}`,

  padding: '1rem 2.2rem',

  borderRadius: '0.8rem',

  cursor: 'pointer',

  '&:disabled': {
    cursor: 'default',

    '&:hover': {
      backgroundColor: theme.colors.base02,
    },
  },

  '&:hover': {
    backgroundColor: theme.colors.base03,
  },
}));

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',

  rowGap: '1rem',
});

export const TopContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  width: '100%',
});

export const TopLeftContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  maxWidth: '16rem',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export const TopRightContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'flex-end',

  columnGap: '0.3rem',
});

export const TopRightTextContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',

  color: theme.colors.text02,
}));

type IndicatorIconProps = {
  'data-is-success': boolean;
};

export const IndicatorIconContainer = styled('div')<IndicatorIconProps>(({ theme, ...props }) => ({
  width: '1.6rem',
  height: '1.6rem',

  '& > svg': {
    '& > path': {
      fill: props['data-is-success'] ? theme.accentColors.green01 : theme.accentColors.red,
    },
  },
}));

export const BottomContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  width: '100%',
});

export const BottomLeftContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',

  color: theme.colors.text02,
}));

export const BottomRightContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',

  columnGap: '0.3rem',

  color: theme.colors.text01,
}));
