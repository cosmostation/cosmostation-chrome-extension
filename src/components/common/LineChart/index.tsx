import { Line, LineChart as BaseLineChart, ResponsiveContainer, YAxis } from 'recharts';

import { LineStrokeEffectLayer } from './styled';

const chartDataKey = 'pv';

type LineChartProps = {
  lineChartData: number[];
};

export default function LineChart({ lineChartData }: LineChartProps) {
  const formattedData = lineChartData?.map((entry) => {
    return {
      [chartDataKey]: entry,
    };
  });

  const isTrendUpward = formattedData?.[formattedData.length - 1]?.pv > formattedData?.[0]?.pv;

  return (
    <LineStrokeEffectLayer is-upward={isTrendUpward}>
      <ResponsiveContainer>
        <BaseLineChart data={formattedData}>
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Line type="monotone" dataKey={chartDataKey} stroke={isTrendUpward ? '#DFF6EA' : '#FFEFEF'} strokeWidth={1.2} dot={false} isAnimationActive={false} />
        </BaseLineChart>
      </ResponsiveContainer>
    </LineStrokeEffectLayer>
  );
}
