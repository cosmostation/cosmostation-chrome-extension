import { styled } from '@mui/material/styles';

import type { PriceTrendType } from '@/types/price';

type LineStrokeEffectLayerProps = {
  'is-upward'?: boolean;
  'data-price-trend-color': PriceTrendType;
};

export const LineStrokeEffectLayer = styled('div')<LineStrokeEffectLayerProps>(({ theme, ...props }) => {
  const upColor = props['data-price-trend-color'] === 'green-up' ? theme.palette.accentColor.green400 : theme.palette.accentColor.red400;
  const downColor = props['data-price-trend-color'] === 'green-up' ? theme.palette.accentColor.red400 : theme.palette.accentColor.green400;
  return {
    filter: props['is-upward'] ? `drop-shadow(0 0 0.5rem ${upColor})` : `drop-shadow(0 0 0.5rem ${downColor})`,
    width: '100%',
    height: '100%',
  };
});
