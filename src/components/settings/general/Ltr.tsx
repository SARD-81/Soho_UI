import type { CSSProperties, ReactNode } from 'react';

interface LtrProps {
  children: ReactNode;
}

/**
 * Inline style on purpose.
 *
 * Emotion styles pass through `stylis-plugin-rtl` (see `src/rtl-cache.ts`),
 * which mirrors `direction` and `text-align`. React inline styles never touch
 * the stylis pipeline, so this is the only reliable way to force an LTR run.
 */
const ltrStyle: CSSProperties = {
  direction: 'ltr',
  unicodeBidi: 'isolate',
  fontVariantNumeric: 'tabular-nums',
  overflowWrap: 'anywhere',
};

/**
 * Isolates a left-to-right technical token (hostname, IP, timezone id,
 * timestamp) inside Persian text so the bidi algorithm cannot reorder the
 * surrounding sentence.
 */
const Ltr = ({ children }: LtrProps) => (
  <bdi dir="ltr" style={ltrStyle}>
    {children}
  </bdi>
);

export default Ltr;
