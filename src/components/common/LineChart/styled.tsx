import { styled } from '@mui/material/styles';

type LineStrokeEffectLayerProps = {
  'is-upward'?: boolean;
};

export const LineStrokeEffectLayer = styled('div')<LineStrokeEffectLayerProps>(({ theme, ...props }) => ({
  filter: props['is-upward'] ? `drop-shadow(0 0 0.5rem ${theme.palette.accentColor.green400})` : `drop-shadow(0 0 0.5rem ${theme.palette.accentColor.red400})`,
  width: '100%',
  height: '100%',
}));
