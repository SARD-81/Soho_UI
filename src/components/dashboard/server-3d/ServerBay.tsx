import { Html, RoundedBox } from '@react-three/drei';
import { memo, useMemo, useState } from 'react';
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

      <mesh position={[0, -0.18, 0.225]}>
        <circleGeometry args={[0.115, 32]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.35}
          roughness={0.42}
        />
      </mesh>

      <RoundedBox
        args={[0.28, 0.09, 0.045]}
        radius={0.025}
        smoothness={4}
        position={[0, -0.55, 0.235]}
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

      <Html position={[0, -1.52, 0.35]} center>
        <div
          style={{
            minWidth: 58,
            padding: '3px 8px',
            borderRadius: 999,
            direction: 'rtl',
            textAlign: 'center',
            fontFamily: 'var(--font-vazir)',
            fontSize: 11,
            fontWeight: 800,
            color: 'var(--color-text)',
            background: selected
              ? 'linear-gradient(135deg, rgba(0,198,169,0.34), rgba(35,167,213,0.26))'
              : 'rgba(15,23,42,0.56)',
            border: selected
              ? '1px solid rgba(0,198,169,0.75)'
              : '1px solid rgba(148,163,184,0.24)',
            boxShadow: selected
              ? '0 12px 32px rgba(0,198,169,0.18)'
              : '0 8px 20px rgba(0,0,0,0.18)',
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