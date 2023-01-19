import { styled } from '@mui/material/styles';

type ContentContainerProps = {
  'data-is-multiple': boolean;
};
export const ContentContainer = styled('div')<ContentContainerProps>(({ theme, ...props }) => ({
  color: theme.colors.text01,

  height: `${(props['data-is-multiple'] ? 15.7 : 18.7) - 6.87}rem`,

  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',

  paddingTop: '1.2rem',

  overflow: 'auto',
}));

export const AddressContainer = styled('div')({});

export const LabelContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const ValueContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
  marginTop: '0.4rem',
}));
