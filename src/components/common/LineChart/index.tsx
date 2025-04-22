import { Line, LineChart as BaseLineChart, ResponsiveContainer, YAxis } from 'recharts';

import { PRICE_TREND_TYPE } from '@/constants/price';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { LineStrokeEffectLayer } from './styled';

const chartDataKey = 'pv';

type LineChartProps = {
  lineChartData: number[];
  trend?: 'upward' | 'downward' | 'unchanged';
};

export default function LineChart({ lineChartData, trend }: LineChartProps) {
  const userPriceTrendPreference = useExtensionStorageStore((state) => state.userPriceTrendPreference);

  const formattedData = lineChartData?.map((entry) => {
    return {
      [chartDataKey]: entry,
    };
  });

  const isTrendUpward = (() => {
    if (trend === 'upward') return true;
    if (trend === 'downward') return false;

    return formattedData?.[formattedData.length - 1]?.pv > formattedData?.[0]?.pv;
  })();

  const upColor = userPriceTrendPreference === PRICE_TREND_TYPE.GREEN_UP ? '#DFF6EA' : '#FFEFEF';
  const downColor = userPriceTrendPreference === PRICE_TREND_TYPE.GREEN_UP ? '#FFEFEF' : '#DFF6EA';

  return (
    <LineStrokeEffectLayer is-upward={isTrendUpward} data-price-trend-color={userPriceTrendPreference}>
      <ResponsiveContainer>
        <BaseLineChart data={formattedData}>
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Line type="monotone" dataKey={chartDataKey} stroke={isTrendUpward ? upColor : downColor} strokeWidth={1.2} dot={false} isAnimationActive={false} />
        </BaseLineChart>
      </ResponsiveContainer>
    </LineStrokeEffectLayer>
  );
}
