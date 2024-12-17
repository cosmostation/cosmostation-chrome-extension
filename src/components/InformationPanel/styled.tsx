import { styled } from '@mui/material/styles';

export const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',

  width: '100%',

  rowGap: '0.6rem',

  padding: '1.2rem',

  backgroundColor: theme.palette.color.base100,
  borderRadius: '0.8rem',
  boxSizing: 'border-box',
}));

type TopContainerProps = {
  variant?: 'caution' | 'info' | 'error';
};

export const TopContainer = styled('div')<TopContainerProps>(({ theme, ...props }) => {
  const { variant } = props;

  const color = (() => {
    if (variant === 'caution') {
      return theme.palette.accentColor.yellow400;
    }

    if (variant === 'error') {
      return theme.palette.accentColor.red400;
    }

    if (variant === 'info') {
      return theme.palette.accentColor.blue400;
    }

    return theme.palette.color.base1300;
  })();

  return {
    display: 'flex',
    alignItems: 'center',

    columnGap: '0.2rem',

    color: color,

    '& > svg': {
      fill: color,
      '& > path': {
        fill: color,
      },
    },
  };
});

export const BodyText = styled('div')(({ theme }) => ({
  wordBreak: 'break-word',
  color: theme.palette.color.base1000,

  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 3,
  overflow: 'hidden',
}));
