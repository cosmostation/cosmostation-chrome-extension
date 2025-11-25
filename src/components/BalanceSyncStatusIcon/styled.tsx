import { styled } from '@mui/material/styles';

import type { RequestStatus } from '@/types/account';

type IconContainerProps = {
  'data-sync-status'?: RequestStatus;
};

export const IconContainer = styled('div')<IconContainerProps>(({ theme, ...props }) => {
  const getColor = (val?: RequestStatus) => {
    if (val === 'error') return theme.palette.accentColor.red400;

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
