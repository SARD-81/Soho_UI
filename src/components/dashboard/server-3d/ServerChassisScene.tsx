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
          args={[0.43, 0.43, 0.08]}
          radius={0.075}
          smoothness={8}
          position={[layout.controlPanelX, -0.08, 0.39]}
        >
          <meshStandardMaterial
            color={hoveredControl === 'reboot' ? '#244033' : '#1c232d'}
            emissive="#16a34a"
            emissiveIntensity={hoveredControl === 'reboot' ? 0.85 : 0.5}
            roughness={0.42}
          />
        </RoundedBox>

        <mesh position={[layout.controlPanelX, -0.08, 0.445]}>
          <torusGeometry args={[0.16, 0.018, 12, 42, Math.PI * 1.55]} />
          <meshStandardMaterial
            color={hoveredControl === 'reboot' ? '#4ade80' : '#22c55e'}
            emissive="#22c55e"
            emissiveIntensity={hoveredControl === 'reboot' ? 1.75 : 1.35}
            roughness={0.25}
          />
        </mesh>
      </group>

      <RoundedBox
        args={[0.5, 0.18, 0.07]}
        radius={0.035}
        smoothness={5}
        position={[layout.controlPanelX, -0.82, 0.39]}
      >
        <meshStandardMaterial
          color="#111827"
          emissive="#22c55e"
          emissiveIntensity={0.5}
          roughness={0.45}
        />
      </RoundedBox>

      <RoundedBox
        args={[0.36, 0.42, 0.07]}
        radius={0.03}
        smoothness={5}
        position={[layout.controlPanelX, -1.35, 0.39]}
        onClick={(event) => handlePowerControlClick(event, 'poweroff')}
        onPointerOver={(event) => handleControlPointerOver(event, 'poweroff')}
        onPointerOut={handleControlPointerOut}
      >
        <meshStandardMaterial
          color={hoveredControl === 'poweroff' ? '#f8d7a3' : '#e5dfc8'}
          emissive={hoveredControl === 'poweroff' ? '#ef4444' : '#000000'}
          emissiveIntensity={hoveredControl === 'poweroff' ? 0.45 : 0}
          roughness={0.45}
          metalness={0.2}
        />
      </RoundedBox>

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
