import { Box } from '@mui/material';
import { useEffect, useRef, useState, type ReactNode } from 'react';

export type ResponsiveChartContainerProps = {
  height: number;
  children: (width: number) => ReactNode;
};

const ResponsiveChartContainer = ({
  height,
  children,
}: ResponsiveChartContainerProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const updateWidth = () => {
      setWidth(element.getBoundingClientRect().width);
    };

    if (typeof ResizeObserver === 'undefined') {
      updateWidth();
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setWidth(entry.contentRect.width);
      }
    });

    observer.observe(element);
    updateWidth();

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        minHeight: height,
      }}
    >
      {width > 0 && children(width)}
    </Box>
  );
};

export default ResponsiveChartContainer;
