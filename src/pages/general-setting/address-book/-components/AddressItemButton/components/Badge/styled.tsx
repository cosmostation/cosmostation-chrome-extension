import { styled } from '@mui/material/styles';

import Image from '@/components/common/Image';

type ContainerProps = {
  colorHex?: string;
};

export const Container = styled('div')<ContainerProps>(({ theme, ...props }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  columnGap: '0.1rem',
  backgroundColor: props['colorHex'] || theme.palette.color.base400,
  color: props['colorHex'] ? theme.palette.color.base1300 : theme.palette.color.base1200,
  fontSize: '0.9rem',
  fontFamily: theme.typography.b4_M.fontFamily,

  padding: '0.2rem 0.6rem',
  borderRadius: '2rem',
}));

export const StyledImage = styled(Image)({
  width: '1rem',
  height: '1rem',
});
