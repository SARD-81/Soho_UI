import { ContactShadows, Environment, OrbitControls, RoundedBox } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import ServerBay, { type ServerSceneColors } from './ServerBay';
import type { ServerSlotViewModel } from './serverSlotModel';

interface ServerChassisSceneProps {
  slots: ServerSlotViewModel[];
  selectedSlotNumber: number | null;
  colors: ServerSceneColors;
  onSelectSlot: (slotNumber: number) => void;
}

const BAY_PANEL_CENTER_X = 0.72;
const BAY_SPACING = 0.9;

const BAY_X_POSITIONS = [
  BAY_PANEL_CENTER_X - BAY_SPACING * 1.5,
  BAY_PANEL_CENTER_X - BAY_SPACING * 0.5,
  BAY_PANEL_CENTER_X + BAY_SPACING * 0.5,
  BAY_PANEL_CENTER_X + BAY_SPACING * 1.5,
] as const;

const ServerChassisModel = ({
  slots,
  selectedSlotNumber,
  colors,
  onSelectSlot,
}: ServerChassisSceneProps) => {
  return (
    <group rotation={[0, 0, 0]} position={[0, -0.05, 0]}>
      <RoundedBox
        args={[6.25, 3.55, 0.62]}
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
        args={[6.05, 3.34, 0.12]}
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
        position={[-2.0, 0, 0.26]}
      >
        <meshStandardMaterial
          color="#151821"
          roughness={0.76}
          metalness={0.38}
        />
      </RoundedBox>

      <RoundedBox
        args={[0.43, 0.43, 0.08]}
        radius={0.075}
        smoothness={8}
        position={[-2.0, -0.08, 0.39]}
      >
        <meshStandardMaterial
          color="#1c232d"
          emissive="#16a34a"
          emissiveIntensity={0.5}
          roughness={0.42}
        />
      </RoundedBox>

      <mesh position={[-2.0, -0.08, 0.445]}>
        <torusGeometry args={[0.16, 0.018, 12, 42, Math.PI * 1.55]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={1.35}
          roughness={0.25}
        />
      </mesh>

      <RoundedBox
        args={[0.5, 0.18, 0.07]}
        radius={0.035}
        smoothness={5}
        position={[-2.0, -0.82, 0.39]}
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
        position={[-2.0, -1.35, 0.39]}
      >
        <meshStandardMaterial color="#e5dfc8" roughness={0.45} metalness={0.2} />
      </RoundedBox>

      <RoundedBox
  args={[3.9, 3.08, 0.2]}
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
          position={[BAY_X_POSITIONS[index] ?? 0, -0.04, 0.46]}
          selected={selectedSlotNumber === slot.slotNumber}
          colors={colors}
          onSelect={onSelectSlot}
        />
      ))}

      <mesh position={[-0.02, 1.63, 0.37]}>
        <boxGeometry args={[5.15, 0.03, 0.04]} />
        <meshStandardMaterial color={colors.chassisEdge} roughness={0.55} />
      </mesh>

      <mesh position={[-0.02, -1.63, 0.37]}>
        <boxGeometry args={[4.15, 0.03, 0.04]} />
        <meshStandardMaterial color={colors.chassisEdge} roughness={0.55} />
      </mesh>
    </group>
  );
};

const ServerChassisScene = (props: ServerChassisSceneProps) => {
  return (
    <Canvas
      dpr={[1, 2]}
      frameloop="demand"
      camera={{ position: [0, 0.15, 7.15], fov: 36 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.85} />
        <directionalLight position={[3, 4, 5]} intensity={1.25} />
        <directionalLight position={[-4, 2, 3]} intensity={0.35} />
        <ServerChassisModel {...props} />
        <ContactShadows
          position={[0, -2.02, -0.8]}
          opacity={0.24}
          scale={6}
          blur={2.4}
          far={3.5}
        />
        <Environment preset="city" />
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