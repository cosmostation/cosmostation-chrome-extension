import { keyframes, styled } from '@mui/material/styles';

import type { DataFreshnessType } from '@/types/dataFreshness';

type ContainerProps = {
  'data-variant'?: DataFreshnessType;
};

export const Container = styled('div')<ContainerProps>(({ theme, ...props }) => {
  const startColor = (() => {
    if (props['data-variant'] === 'warning') return '#FAB348';
    if (props['data-variant'] === 'stale') return '#D4465D';
    if (props['data-variant'] === 'fresh') return theme.palette.color.base400;
  })();

  const endColor = (() => {
    if (props['data-variant'] === 'warning') return '#F59219';
    if (props['data-variant'] === 'stale') return '#A62032';
    if (props['data-variant'] === 'fresh') return theme.palette.color.base400;
  })();

  return {
    width: '100%',

    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',

    padding: '0.7rem 1.2rem',
    boxSizing: 'border-box',

    background: `linear-gradient(90deg, ${startColor} 0%, ${endColor} 100%)`,
  };
});

export const TitleTextContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  columnGap: '0.4rem',
  textAlign: 'left',
});

const rotate360 = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

type StyledIconContainerProps = {
  'data-is-loading': boolean;
};

export const StyledIconContainer = styled('div')<StyledIconContainerProps>(({ theme, ...props }) => ({
  width: '1.4rem',
  height: '1.4rem',
  marginRight: '0.4rem',

  '& > svg': {
    width: '1.4rem',
    height: '1.4rem',
    animation: props['data-is-loading'] ? `${rotate360} 1.5s linear infinite` : 'none',
    '& > path': {
      fill: theme.palette.commonColor.commonBlack,
    },
    '& > circle': {
      fill: theme.palette.color.base1300,
    },
  },
}));
