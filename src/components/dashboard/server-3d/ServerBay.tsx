import { Html, RoundedBox } from '@react-three/drei';
import { memo, useEffect, useMemo, useState } from 'react';
import type { ServerSlotHealth, ServerSlotViewModel } from './serverSlotModel';

export interface ServerSceneColors {
  chassis: string;
  chassisEdge: string;
  bay: string;
  bayDark: string;
  primary: string;
  primaryLight: string;
  selected: string;
  empty: string;
  success: string;
  warning: string;
  error: string;
  unknown: string;
}

interface ServerBayProps {
  bay: ServerSlotViewModel;
  position: [number, number, number];
  selected: boolean;
  colors: ServerSceneColors;
  onSelect: (slotNumber: number) => void;
}

const resolveLedColor = (
  health: ServerSlotHealth,
  selected: boolean,
  colors: ServerSceneColors
) => {
  if (selected) {
    return colors.selected;
  }

  if (health === 'online') {
    return colors.primaryLight;
  }

  if (health === 'warning') {
    return colors.warning;
  }

  if (health === 'error') {
    return colors.error;
  }

  if (health === 'unknown') {
    return colors.unknown;
  }

  return colors.empty;
};

const ServerBay = ({
  bay,
  position,
  selected,
  colors,
  onSelect,
}: ServerBayProps) => {
  const [hovered, setHovered] = useState(false);

  useEffect(() => () => {
    document.body.style.cursor = 'default';
  }, []);

  const ledColor = useMemo(
    () => resolveLedColor(bay.health, selected, colors),
    [bay.health, colors, selected]
  );

  const trayColor = bay.isOccupied ? colors.bay : '#111827';
  const accentColor = selected || hovered ? colors.selected : ledColor;
  const emissiveIntensity = selected ? 1.8 : hovered ? 1.1 : 0.75;

  return (
    <group position={position}>
      <RoundedBox
        args={[0.86, 2.86, 0.16]}
        radius={0.035}
        smoothness={4}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color={selected ? '#18233a' : '#05070b'}
          roughness={0.55}
          metalness={0.42}
        />
      </RoundedBox>

      <RoundedBox
        args={[0.72, 2.62, 0.22]}
        radius={0.045}
        smoothness={5}
        position={[0, 0, 0.08]}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(bay.slotNumber);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
        onPointerUp={(event) => {
          event.stopPropagation();
        }}
      >
        <meshStandardMaterial
          color={hovered || selected ? '#1b2433' : trayColor}
          roughness={0.68}
          metalness={0.56}
          emissive={selected ? colors.primary : '#000000'}
          emissiveIntensity={selected ? 0.08 : 0}
        />
      </RoundedBox>

      {[-0.22, -0.07, 0.08, 0.23].map((x) => (
        <mesh key={`grill-top-${x}`} position={[x, 0.68, 0.205]}>
          <boxGeometry args={[0.05, 1.05, 0.035]} />
          <meshStandardMaterial color={colors.bayDark} roughness={0.8} />
        </mesh>
      ))}

      {[-0.24, -0.12, 0, 0.12, 0.24].map((x) => (
        <mesh key={`grill-bottom-${x}`} position={[x, -0.78, 0.205]}>
          <boxGeometry args={[0.045, 0.72, 0.035]} />
          <meshStandardMaterial color={colors.bayDark} roughness={0.82} />
        </mesh>
      ))}

      <mesh position={[0, -0.12, 0.235]}>
  <circleGeometry args={[0.105, 32]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.35}
          roughness={0.42}
        />
      </mesh>

      <RoundedBox
  args={[0.34, 0.075, 0.05]}
  radius={0.022}
  smoothness={4}
  position={[0, -0.5, 0.245]}
>
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.28}
          roughness={0.35}
        />
      </RoundedBox>

      <RoundedBox
        args={[0.34, 0.055, 0.055]}
        radius={0.018}
        smoothness={4}
        position={[-0.18, -1.24, 0.245]}
      >
        <meshStandardMaterial
          color={ledColor}
          emissive={ledColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.28}
        />
      </RoundedBox>

      <RoundedBox
        args={[0.34, 0.055, 0.055]}
        radius={0.018}
        smoothness={4}
        position={[0.19, -1.24, 0.245]}
      >
        <meshStandardMaterial
          color={bay.isOccupied ? colors.primaryLight : colors.empty}
          emissive={bay.isOccupied ? colors.primaryLight : '#000000'}
          emissiveIntensity={bay.isOccupied ? 1.15 : 0}
          roughness={0.28}
        />
      </RoundedBox>

      {(selected || hovered) && (
        <RoundedBox
          args={[0.82, 2.78, 0.035]}
          radius={0.055}
          smoothness={5}
          position={[0, 0, 0.285]}
        >
          <meshBasicMaterial color={accentColor} transparent opacity={0.22} />
        </RoundedBox>
      )}

      <Html position={[0.65, -1.43, 0.42]} center zIndexRange={[20, 0]}>
        <div
          style={{
  minWidth: 64,
  padding: '4px 10px',
  borderRadius: 999,
  direction: 'rtl',
  textAlign: 'center',
  fontFamily: 'var(--font-vazir)',
  fontSize: 11,
  lineHeight: '16px',
  fontWeight: 900,
  color: 'var(--color-text)',
  background: selected
    ? 'linear-gradient(135deg, rgba(0,198,169,0.42), rgba(35,167,213,0.3))'
    : 'linear-gradient(135deg, rgba(15,23,42,0.72), rgba(15,23,42,0.48))',
  border: selected
    ? '1px solid rgba(0,198,169,0.82)'
    : '1px solid rgba(148,163,184,0.28)',
  boxShadow: selected
    ? '0 10px 26px rgba(0,198,169,0.24), inset 0 1px 0 rgba(255,255,255,0.12)'
    : '0 8px 18px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)',
  backdropFilter: 'blur(8px)',
  userSelect: 'none',
  pointerEvents: 'none',
}}
        >
          اسلات {bay.slotNumber}
        </div>
      </Html>
    </group>
  );
};

export default memo(ServerBay);