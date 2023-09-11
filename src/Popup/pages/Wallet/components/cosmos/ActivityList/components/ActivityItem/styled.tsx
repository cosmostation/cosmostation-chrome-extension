import { styled } from '@mui/material/styles';

export const StyledButton = styled('button')(({ theme }) => ({
  width: '100%',

  backgroundColor: theme.colors.base02,
  border: `0.1rem solid ${theme.colors.base02}`,

  padding: '1rem 1.2rem',

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
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const LeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  textAlign: 'left',
});

type LeftIconContainerProps = {
  'data-is-contract': boolean;
};

export const LeftIconContainer = styled('div')<LeftIconContainerProps>(({ theme, ...props }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& svg': {
    '& > path': {
      fill: props['data-is-contract'] || theme.accentColors.purple01,
      stroke: !props['data-is-contract'] || theme.accentColors.purple01,
    },
  },
}));

export const LeftTextContainer = styled('div')({
  paddingLeft: '0.8rem',

  display: 'grid',

  gridTemplateColumns: '1fr',

  rowGap: '0.2rem',
});

export const LeftTextTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const LeftTextSubtitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const RightContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  textAlign: 'right',
});

export const RightTextContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',

  columnGap: '0.3rem',

  color: theme.colors.text01,
}));
