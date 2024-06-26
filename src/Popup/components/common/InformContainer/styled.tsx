import { styled } from '@mui/material/styles';

import type { InformVarient } from '.';

type ContainerProps = {
  'data-varient': InformVarient;
};

export const Container = styled('div')<ContainerProps>(({ ...props }) => ({
  padding: '1.2rem 1.6rem',
  display: 'flex',
  backgroundColor: props['data-varient'] === 'info' ? 'rgba(39, 189, 105, 0.15)' : 'rgba(205, 26, 26, 0.15)',
  borderRadius: '0.8rem',
  wordBreak: 'break-word',
}));

type TextContainerProps = {
  'data-varient': InformVarient;
};

export const TextContainer = styled('div')<TextContainerProps>(({ theme, ...props }) => ({
  marginLeft: '0.4rem',
  color: props['data-varient'] === 'info' ? theme.colors.text01 : theme.accentColors.red,
}));

type IconContainerProps = {
  'data-varient': InformVarient;
};

export const IconContainer = styled('div')<IconContainerProps>(({ theme, ...props }) => ({
  '& > svg': {
    fill: props['data-varient'] === 'info' ? theme.accentColors.green01 : theme.accentColors.red,

    '& > path': {
      fill: props['data-varient'] === 'info' ? theme.accentColors.green01 : theme.accentColors.red,
    },
  },
}));
