import { styled } from '@mui/material/styles';

type LineStrokeEffectLayerProps = {
  'is-upward'?: boolean;
};

export const LineStrokeEffectLayer = styled('div')<LineStrokeEffectLayerProps>(({ ...props }) => ({
  filter: props['is-upward'] ? 'drop-shadow(0 0 5px #00ff00)' : 'drop-shadow(0 0 5px #ff0000)',
  width: '100%',
  height: '100%',
}));
