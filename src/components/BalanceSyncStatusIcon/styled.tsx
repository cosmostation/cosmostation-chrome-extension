import { styled } from '@mui/material/styles';

type IconContainerProps = {
  'data-sync-status'?: 'warning' | 'stale' | 'fresh';
};

export const IconContainer = styled('div')<IconContainerProps>(({ theme, ...props }) => {
  const getColor = (val?: string) => {
    if (val === 'warning') return theme.palette.accentColor.yellow400;
    if (val === 'stale') return theme.palette.accentColor.red400;

    return theme.palette.color.base1300;
  };

  return {
    '& > svg': {
      width: '100%',
      height: '100%',

      fill: getColor(props['data-sync-status']),

      '& > path': {
        fill: getColor(props['data-sync-status']),
      },
    },
  };
});
