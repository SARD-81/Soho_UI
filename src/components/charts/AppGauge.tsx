import { GlobalStyles } from '@mui/material';
import { Gauge, type GaugeProps } from '@mui/x-charts/Gauge';

export type AppGaugeProps = GaugeProps & {
  valueFormatter?: (value: number | null) => string;
};

const AppGauge = ({ valueFormatter, text, ...rest }: AppGaugeProps) => {
  const gaugeText =
    text ??
    (({ value }: { value: number | null }) => {
      if (valueFormatter) {
        return valueFormatter(value ?? null);
      }

      const numericValue = typeof value === 'number' ? value : 0;
      return `${Math.round(numericValue)}`;
    });

  return (
    <>
      <GlobalStyles
        styles={{
          '.MuiGauge-valueText, .MuiGauge-valueText tspan': {
            fill: 'var(--color-text) !important',
            color: 'var(--color-text) !important',
          },
        }}
      />
      <Gauge {...rest} text={gaugeText} />
    </>
  );
};

export default AppGauge;
