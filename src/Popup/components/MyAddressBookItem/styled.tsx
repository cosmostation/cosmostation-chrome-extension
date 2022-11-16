import { styled } from '@mui/material/styles';

import Image from '~/Popup/components/common/Image';

type ContainerProps = {
  'data-is-onclick': number;
};

export const Container = styled('div')<ContainerProps>(({ theme, ...props }) => ({
  backgroundColor: theme.colors.base02,

  borderRadius: '0.8rem',

  padding: '1.2rem 0.8rem 1rem 1.6rem',

  cursor: props['data-is-onclick'] ? 'pointer' : 'default',
}));

export const LabelContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const LabelLeftContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  color: theme.colors.text01,
}));

export const StyledImage = styled(Image)({
  width: '2rem',
  height: '2rem',

  marginRight: '0.8rem',
});

export const AddressContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  wordBreak: 'break-all',

  marginTop: '1rem',
}));
