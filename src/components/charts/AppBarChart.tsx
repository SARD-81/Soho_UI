import { BarChart, type BarChartProps } from '@mui/x-charts/BarChart';
import { mergeChartSlotProps } from './chartStyles';

export type AppBarChartProps = BarChartProps & {
  disableDefaultLegend?: boolean;
};

const AppBarChart = ({
  slotProps,
  disableDefaultLegend = false,
  ...rest
}: AppBarChartProps) => {
  const mergedSlotProps = mergeChartSlotProps<BarChartProps['slotProps']>(slotProps, {
    includeLegend: !disableDefaultLegend,
  }) as BarChartProps['slotProps'];

  return <BarChart {...rest} slotProps={mergedSlotProps} />;
};

export default AppBarChart;
