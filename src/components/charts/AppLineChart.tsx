import { LineChart, type LineChartProps } from '@mui/x-charts/LineChart';
import { mergeChartSlotProps } from './chartStyles';

export type AppLineChartProps = LineChartProps & {
  disableDefaultLegend?: boolean;
};

const AppLineChart = ({
  slotProps,
  disableDefaultLegend = false,
  ...rest
}: AppLineChartProps) => {
  const mergedSlotProps = mergeChartSlotProps<LineChartProps['slotProps']>(slotProps, {
    includeLegend: !disableDefaultLegend,
  }) as LineChartProps['slotProps'];

  return <LineChart {...rest} slotProps={mergedSlotProps} />;
};

export default AppLineChart;
