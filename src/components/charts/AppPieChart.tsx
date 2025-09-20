import { PieChart, type PieChartProps } from '@mui/x-charts/PieChart';
import { mergeChartSlotProps } from './chartStyles';

export type AppPieChartProps = PieChartProps & {
  disableDefaultLegend?: boolean;
};

const AppPieChart = ({
  slotProps,
  disableDefaultLegend = true,
  ...rest
}: AppPieChartProps) => {
  const mergedSlotProps = mergeChartSlotProps<PieChartProps['slotProps']>(slotProps, {
    includeLegend: !disableDefaultLegend,
  }) as PieChartProps['slotProps'];

  return <PieChart {...rest} slotProps={mergedSlotProps} />;
};

export default AppPieChart;
