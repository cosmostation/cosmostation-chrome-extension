import { styled } from '@mui/material/styles';

import IconButton from '../common/IconButton';

export const AdBannerContainer = styled('div')({});

type WrapperLinkProps = {
  'data-bg-image-src'?: string | null;
};

export const WrapperLink = styled('a')<WrapperLinkProps>(({ theme, ...props }) => ({
  display: 'block',
  width: '100%',
  aspectRatio: '338 / 80',
  minHeight: '8rem',

  border: `0.1rem solid ${theme.palette.color.base100}`,
  borderRadius: '0.4rem',
  background: `url(${props['data-bg-image-src']}) no-repeat center / cover`,
  textDecoration: 'none',

  '&[href]': {
    cursor: 'pointer',
    '&:hover': {
      opacity: '0.8',
    },
  },

  position: 'relative',
}));

export const CloseIconButton = styled(IconButton)({
  position: 'absolute',

  width: '1.2rem',
  height: '1.2rem',

  top: '0.8rem',
  right: '0.8rem',
});
