import { ContactShadows, OrbitControls, RoundedBox } from '@react-three/drei';
import { Canvas, type ThreeEvent } from '@react-three/fiber';
import { Suspense, useMemo, useState } from 'react';
import ServerBay, { type ServerSceneColors } from './ServerBay';
import type { ServerSlotViewModel } from './serverSlotModel';

interface ServerChassisSceneProps {
  slots: ServerSlotViewModel[];
  selectedSlotNumber: number | null;
  colors: ServerSceneColors;
  onSelectSlot: (slotNumber: number) => void;
  onRequestReboot: () => void;
  onRequestPoweroff: () => void;
  powerActionsDisabled: boolean;
}

const BAY_PANEL_CENTER_X = 0.72;
const BAY_SPACING = 0.9;
const BAY_WIDTH = 0.86;
const MIN_CHASSIS_WIDTH = 6.25;
const MIN_BAY_PANEL_WIDTH = 3.9;

const resolveSceneLayout = (slotCount: number) => {
  const safeSlotCount = Math.max(slotCount, 1);
  const bayPanelWidth = Math.max(
    MIN_BAY_PANEL_WIDTH,
    BAY_WIDTH + (safeSlotCount - 1) * BAY_SPACING + 0.56
  );
  const chassisWidth = Math.max(MIN_CHASSIS_WIDTH, bayPanelWidth + 2.35);
  const controlPanelX = -chassisWidth / 2 + 1.1;
  const bayPositions = Array.from({ length: safeSlotCount }, (_, index) => {
    const startX = BAY_PANEL_CENTER_X - ((safeSlotCount - 1) * BAY_SPACING) / 2;
    return startX + index * BAY_SPACING;
  });

  return {
    bayPanelWidth,
    chassisWidth,
    controlPanelX,
    bayPositions,
    cameraDistance: Math.max(7.15, chassisWidth * 0.92),
    shadowScale: Math.max(6, chassisWidth * 0.96),
  };
};

interface ControlGlyphProps {
  x: number;
  y: number;
  hovered: boolean;
}

const RebootGlyph = ({ x, y, hovered }: ControlGlyphProps) => {
  const color = hovered ? '#bbf7d0' : '#6ee7b7';
  const emissiveIntensity = hovered ? 1.8 : 1.15;

  return (
    <group position={[x, y, 0.455]}>
      <mesh position={[0, 0, -0.012]}>
        <circleGeometry args={[0.17, 48]} />
        <meshStandardMaterial
          color="#10281f"
          emissive="#16a34a"
          emissiveIntensity={hovered ? 0.28 : 0.12}
          roughness={0.5}
        />
      </mesh>

      <mesh rotation={[0, 0, -0.42]}>
        <torusGeometry args={[0.105, 0.016, 16, 64, Math.PI * 1.55]} />
        <meshStandardMaterial
          color={color}
          emissive="#22c55e"
          emissiveIntensity={emissiveIntensity}
          roughness={0.18}
        />
      </mesh>

      <mesh position={[0.105, 0.075, 0.008]} rotation={[0, 0, -0.82]}>
        <coneGeometry args={[0.038, 0.085, 3]} />
        <meshStandardMaterial
          color={color}
          emissive="#22c55e"
          emissiveIntensity={emissiveIntensity}
          roughness={0.18}
        />
      </mesh>
    </group>
  );
};

const PowerGlyph = ({ x, y, hovered }: ControlGlyphProps) => {
  const color = hovered ? '#fecaca' : '#fca5a5';
  const emissiveIntensity = hovered ? 1.6 : 1.05;

  return (
    <group position={[x, y, 0.455]}>
      <mesh position={[0, 0, -0.012]}>
        <circleGeometry args={[0.17, 48]} />
        <meshStandardMaterial
          color="#301517"
          emissive="#dc2626"
          emissiveIntensity={hovered ? 0.3 : 0.12}
          roughness={0.5}
        />
      </mesh>

      <mesh rotation={[0, 0, 0.76]}>
        <torusGeometry args={[0.1, 0.016, 16, 64, Math.PI * 1.48]} />
        <meshStandardMaterial
          color={color}
          emissive="#ef4444"
          emissiveIntensity={emissiveIntensity}
          roughness={0.18}
        />
      </mesh>

      <mesh position={[0, 0.085, 0.008]}>
        <boxGeometry args={[0.026, 0.14, 0.024]} />
        <meshStandardMaterial
          color={color}
          emissive="#ef4444"
          emissiveIntensity={emissiveIntensity}
          roughness={0.16}
        />
      </mesh>
    </group>
  );
};

const ServerChassisModel = ({
  slots,
  selectedSlotNumber,
  colors,
  onSelectSlot,
  onRequestReboot,
  onRequestPoweroff,
  powerActionsDisabled,
}: ServerChassisSceneProps) => {
  const [hoveredControl, setHoveredControl] = useState<
    'reboot' | 'poweroff' | null
  >(null);
  const layout = useMemo(
    () => resolveSceneLayout(slots.length),
    [slots.length]
  );

  const handleControlPointerOver = (
    event: ThreeEvent<PointerEvent>,
    control: 'reboot' | 'poweroff'
  ) => {
    event.stopPropagation();
    setHoveredControl(control);
    document.body.style.cursor = powerActionsDisabled
      ? 'not-allowed'
      : 'pointer';
  };

  const handleControlPointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHoveredControl(null);
    document.body.style.cursor = 'auto';
  };

  const handlePowerControlClick = (
    event: ThreeEvent<MouseEvent>,
    action: 'reboot' | 'poweroff'
  ) => {
    event.stopPropagation();
    if (powerActionsDisabled) {
      return;
    }

    if (action === 'reboot') {
      onRequestReboot();
      return;
    }

    onRequestPoweroff();
  };

  return (
    <group rotation={[0, 0, 0]} position={[0, -0.05, 0]}>
      <RoundedBox
        args={[layout.chassisWidth, 3.55, 0.62]}
        radius={0.16}
        smoothness={8}
        position={[0, 0, -0.18]}
      >
        <meshStandardMaterial
          color={colors.chassis}
          roughness={0.72}
          metalness={0.5}
        />
      </RoundedBox>

      <RoundedBox
        args={[layout.chassisWidth - 0.2, 3.34, 0.12]}
        radius={0.11}
        smoothness={7}
        position={[0, 0, 0.17]}
      >
        <meshStandardMaterial
          color="#0a0d12"
          roughness={0.68}
          metalness={0.48}
        />
      </RoundedBox>

      <RoundedBox
        args={[1.1, 3.24, 0.18]}
        radius={0.08}
        smoothness={6}
        position={[layout.controlPanelX, 0, 0.26]}
      >
        <meshStandardMaterial
          color="#151821"
          roughness={0.76}
          metalness={0.38}
        />
      </RoundedBox>

      <group
        onClick={(event) => handlePowerControlClick(event, 'reboot')}
        onPointerOver={(event) => handleControlPointerOver(event, 'reboot')}
        onPointerOut={handleControlPointerOut}
      >
        <RoundedBox
          args={[0.46, 0.46, 0.08]}
          radius={0.075}
          smoothness={8}
          position={[layout.controlPanelX, -0.2, 0.39]}
        >
          <meshStandardMaterial
            color={hoveredControl === 'reboot' ? '#1d332a' : '#18231f'}
            emissive="#16a34a"
            emissiveIntensity={hoveredControl === 'reboot' ? 0.58 : 0.24}
            roughness={0.4}
            metalness={0.12}
          />
        </RoundedBox>
        <RebootGlyph
          x={layout.controlPanelX}
          y={-0.2}
          hovered={hoveredControl === 'reboot'}
        />
      </group>

      <group
        onClick={(event) => handlePowerControlClick(event, 'poweroff')}
        onPointerOver={(event) => handleControlPointerOver(event, 'poweroff')}
        onPointerOut={handleControlPointerOut}
      >
        <RoundedBox
          args={[0.46, 0.46, 0.08]}
          radius={0.075}
          smoothness={8}
          position={[layout.controlPanelX, -1.22, 0.39]}
        >
          <meshStandardMaterial
            color={hoveredControl === 'poweroff' ? '#3a2023' : '#271a1d'}
            emissive="#dc2626"
            emissiveIntensity={hoveredControl === 'poweroff' ? 0.5 : 0.2}
            roughness={0.42}
            metalness={0.12}
          />
        </RoundedBox>
        <PowerGlyph
          x={layout.controlPanelX}
          y={-1.22}
          hovered={hoveredControl === 'poweroff'}
        />
      </group>

      <RoundedBox
        args={[layout.bayPanelWidth, 3.08, 0.2]}
        radius={0.065}
        smoothness={7}
        position={[BAY_PANEL_CENTER_X, -0.03, 0.29]}
      >
        <meshStandardMaterial
          color="#05070c"
          roughness={0.75}
          metalness={0.45}
        />
      </RoundedBox>

      {slots.map((slot, index) => (
        <ServerBay
          key={slot.id}
          bay={slot}
          position={[
            layout.bayPositions[index] ?? BAY_PANEL_CENTER_X,
            -0.04,
            0.46,
          ]}
          selected={selectedSlotNumber === slot.slotNumber}
          colors={colors}
          onSelect={onSelectSlot}
        />
      ))}

      <mesh position={[-0.02, 1.63, 0.37]}>
        <boxGeometry args={[layout.chassisWidth - 1.1, 0.03, 0.04]} />
        <meshStandardMaterial color={colors.chassisEdge} roughness={0.55} />
      </mesh>

      <mesh position={[-0.02, -1.63, 0.37]}>
        <boxGeometry args={[layout.chassisWidth - 2.1, 0.03, 0.04]} />
        <meshStandardMaterial color={colors.chassisEdge} roughness={0.55} />
      </mesh>
    </group>
  );
};

const ServerChassisScene = (props: ServerChassisSceneProps) => {
  const layout = useMemo(
    () => resolveSceneLayout(props.slots.length),
    [props.slots.length]
  );

  return (
    <Canvas
      dpr={[1, 2]}
      frameloop="demand"
      camera={{ position: [0, 0.15, layout.cameraDistance], fov: 36 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={1.05} />
        <hemisphereLight intensity={0.65} groundColor="#020617" />
        <directionalLight position={[3, 4, 5]} intensity={1.35} />
        <directionalLight position={[-4, 2, 3]} intensity={0.45} />

        <ServerChassisModel {...props} />

        <ContactShadows
          position={[0, -2.02, -0.8]}
          opacity={0.24}
          scale={layout.shadowScale}
          blur={2.4}
          far={3.5}
        />

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 2.35}
          maxPolarAngle={Math.PI / 1.9}
          minAzimuthAngle={-0.22}
          maxAzimuthAngle={0.22}
          rotateSpeed={0.45}
        />
      </Suspense>
    </Canvas>
  );
};

export default ServerChassisScene;
