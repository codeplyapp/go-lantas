// @ts-nocheck
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { DroneStatus } from '../../../core/types';

interface DroneMeshProps {
  status: DroneStatus;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Tri-blade propeller generator helper (120 degrees apart)
const TriBladePropeller: React.FC<{ status: DroneStatus }> = ({ status }) => {
  const bladeAngles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];

  return (
    <>
      {/* Central Spinner Hub Cap */}
      <mesh position={[0, 0.015, 0]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color="#0077C0" roughness={0.25} metalness={0.8} />
      </mesh>

      {/* 3 Airfoil Rotor Blades */}
      {bladeAngles.map((angle, idx) => (
        <group key={idx} rotation={[0, angle, 0]}>
          {/* Main Blade Body */}
          <mesh position={[0.22, 0, 0]} rotation={[0, 0, 0.06]}>
            <boxGeometry args={[0.44, 0.008, 0.048]} />
            <meshStandardMaterial
              color="#0F172A"
              roughness={0.2}
              metalness={0.85}
              transparent
              opacity={status === 'flying' ? 0.65 : 0.95}
            />
          </mesh>
          {/* Aerodynamic Winglet Tip Accent */}
          <mesh position={[0.42, 0.004, 0]}>
            <boxGeometry args={[0.07, 0.01, 0.05]} />
            <meshStandardMaterial
              color="#00E5FF"
              emissive="#00E5FF"
              emissiveIntensity={status === 'flying' ? 2.5 : 1.0}
            />
          </mesh>
        </group>
      ))}
    </>
  );
};

// Procedural Tactical FPV Drone Mesh (Adapted strictly from Wireframe Sketch)
const DroneMesh: React.FC<DroneMeshProps> = ({ status }) => {
  const droneGroupRef = useRef<any>(null);
  const gimbalRef = useRef<any>(null);
  const beaconLightRef = useRef<any>(null);
  const beaconMeshRef = useRef<any>(null);
  const shadowMeshRef = useRef<any>(null);

  // Rotor refs for 4 propellers
  const rotorRefs = [
    useRef<any>(null),
    useRef<any>(null),
    useRef<any>(null),
    useRef<any>(null),
  ];

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Rotor rotation speed based on flight status
    let rotorSpeed = 15; // rad/s for standby
    if (status === 'arming') {
      rotorSpeed = 42;
    } else if (status === 'flying') {
      rotorSpeed = 80;
    } else if (status === 'on_scene') {
      rotorSpeed = 30;
    }

    rotorRefs.forEach((ref, index) => {
      if (ref.current) {
        // Alternating CW and CCW rotation
        const dir = index % 2 === 0 ? 1 : -1;
        ref.current.rotation.y += dir * rotorSpeed * delta;
      }
    });

    // 2. Emergency Beacon Flashing Strobe
    if (beaconLightRef.current && beaconMeshRef.current) {
      const flash = Math.sin(t * 8) > 0.1 ? 1 : 0.05;
      beaconLightRef.current.intensity = flash * 3.5;
      const mat = beaconMeshRef.current.material;
      if (mat) {
        mat.emissiveIntensity = flash * 2.5;
      }
    }

    // 3. Drone Movement & Flight Dynamics (Front Dynamic Perspective, No Exclamation Mark)
    if (droneGroupRef.current) {
      const group = droneGroupRef.current;

      if (status === 'standby') {
        // Subtle floating hover facing front
        const targetY = Math.sin(t * 1.8) * 0.035;
        group.position.y = lerp(group.position.y, targetY, 0.1);
        group.position.x = lerp(group.position.x, 0, 0.1);
        group.position.z = lerp(group.position.z, 0, 0.1);

        group.rotation.x = lerp(group.rotation.x, Math.sin(t * 1.2) * 0.015, 0.1);
        group.rotation.y = lerp(group.rotation.y, 0, 0.08); // Head-on alignment
        group.rotation.z = lerp(group.rotation.z, Math.cos(t * 1.4) * 0.015, 0.1);
      } else if (status === 'arming') {
        // Fast engine spooling vibration
        const vibration = Math.sin(t * 50) * 0.012;
        group.position.y = lerp(group.position.y, vibration + 0.02, 0.2);
        group.rotation.x = lerp(group.rotation.x, -0.04, 0.1);
        group.rotation.y = lerp(group.rotation.y, 0, 0.1);
        group.rotation.z = lerp(group.rotation.z, (Math.random() - 0.5) * 0.015, 0.2);
      } else if (status === 'flying') {
        // Forward high speed climb & aggressive forward pitch
        const targetY = 0.38 + Math.sin(t * 2.8) * 0.05;
        group.position.y = lerp(group.position.y, targetY, 0.08);
        group.position.z = lerp(group.position.z, -0.12, 0.08);

        group.rotation.x = lerp(group.rotation.x, -0.25, 0.1); // ~14 deg forward rake
        group.rotation.y = lerp(group.rotation.y, 0, 0.08);
        group.rotation.z = lerp(group.rotation.z, Math.sin(t * 2.2) * 0.05, 0.1);
      } else if (status === 'on_scene') {
        // Tactical aerial surveillance hover
        const targetY = 0.20 + Math.sin(t * 1.5) * 0.04;
        group.position.y = lerp(group.position.y, targetY, 0.08);
        group.position.z = lerp(group.position.z, 0, 0.08);

        group.rotation.x = lerp(group.rotation.x, 0.03, 0.08);
        group.rotation.y = lerp(group.rotation.y, Math.sin(t * 0.6) * 0.12, 0.05);
        group.rotation.z = lerp(group.rotation.z, Math.sin(t * 1.6) * 0.03, 0.08);
      }
    }

    // 4. Ground Shadow scaling & opacity
    if (shadowMeshRef.current) {
      const targetScale = status === 'flying' ? 1.2 : 1.0;
      const targetOpacity = status === 'flying' ? 0.12 : 0.24;
      shadowMeshRef.current.scale.x = lerp(shadowMeshRef.current.scale.x, targetScale, 0.1);
      shadowMeshRef.current.scale.y = lerp(shadowMeshRef.current.scale.y, targetScale, 0.1);
      if (shadowMeshRef.current.material) {
        shadowMeshRef.current.material.opacity = lerp(
          shadowMeshRef.current.material.opacity,
          targetOpacity,
          0.1
        );
      }
    }

    // 5. Front Nose FPV Camera Pitch Tracking
    if (gimbalRef.current) {
      if (status === 'flying' || status === 'on_scene') {
        gimbalRef.current.rotation.x = lerp(gimbalRef.current.rotation.x, 0.35, 0.1);
      } else {
        gimbalRef.current.rotation.x = lerp(gimbalRef.current.rotation.x, 0.05, 0.1);
      }
    }
  });

  // 4 Arm positions matching the aggressive X-frame in the sketch
  const armConfigs = [
    // Front-Left
    { x: -0.68, y: 0.01, z: 0.44, angle: Math.PI / 4, isFront: true },
    // Front-Right
    { x: 0.68, y: 0.01, z: 0.44, angle: -Math.PI / 4, isFront: true },
    // Rear-Left
    { x: -0.64, y: 0.03, z: -0.56, angle: (3 * Math.PI) / 4, isFront: false },
    // Rear-Right
    { x: 0.64, y: 0.03, z: -0.56, angle: -(3 * Math.PI) / 4, isFront: false },
  ];

  return (
    <>
      <group ref={droneGroupRef} position={[0, 0, 0]}>
        {/* ========================================================= */}
        {/* 1. AERODYNAMIC COCKPIT CANOPY (Adapted from Wireframe)  */}
        {/* ========================================================= */}
        <group position={[0, 0, 0]}>
          {/* Main Helmet Dome Canopy */}
          <mesh castShadow receiveShadow position={[0, 0.06, -0.04]} scale={[1, 0.78, 1.22]}>
            <sphereGeometry args={[0.27, 32, 24]} />
            <meshStandardMaterial
              color="#0F172A"
              roughness={0.25}
              metalness={0.88}
            />
          </mesh>

          {/* Top Aerodynamic Air Intake Vent / Grille (From Sketch) */}
          <mesh position={[0, 0.185, 0.06]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.16, 0.02, 0.12]} />
            <meshStandardMaterial
              color="#1E293B"
              roughness={0.2}
              metalness={0.95}
            />
          </mesh>
          <mesh position={[0, 0.19, 0.06]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.12, 0.008, 0.08]} />
            <meshStandardMaterial
              color="#0077C0"
              emissive="#0077C0"
              emissiveIntensity={0.8}
            />
          </mesh>

          {/* Korlantas Racing Center Stripe */}
          <mesh position={[0, 0.165, -0.06]}>
            <boxGeometry args={[0.12, 0.015, 0.44]} />
            <meshStandardMaterial
              color="#0077C0"
              emissive="#0077C0"
              emissiveIntensity={0.6}
              roughness={0.2}
            />
          </mesh>

          {/* Left & Right Air Intake Cheeks */}
          <mesh position={[-0.21, 0.03, -0.02]} rotation={[0, 0, 0.25]}>
            <boxGeometry args={[0.07, 0.12, 0.32]} />
            <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0.21, 0.03, -0.02]} rotation={[0, 0, -0.25]}>
            <boxGeometry args={[0.07, 0.12, 0.32]} />
            <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Rear Battery Tray (Raked Downwards at 35 degrees) */}
          <mesh position={[0, -0.03, -0.28]} rotation={[-0.35, 0, 0]}>
            <boxGeometry args={[0.3, 0.14, 0.26]} />
            <meshStandardMaterial color="#1E293B" metalness={0.85} roughness={0.3} />
          </mesh>

          {/* Top Emergency Beacon Strobe */}
          <mesh ref={beaconMeshRef} position={[0, 0.22, -0.12]}>
            <cylinderGeometry args={[0.035, 0.045, 0.04, 16]} />
            <meshStandardMaterial
              color="#EF4444"
              emissive="#EF4444"
              emissiveIntensity={2.5}
              roughness={0.1}
            />
          </mesh>
          <pointLight
            ref={beaconLightRef}
            position={[0, 0.28, -0.12]}
            color="#EF4444"
            intensity={3}
            distance={4}
          />
        </group>

        {/* ========================================================= */}
        {/* 2. FRONT NOSE FPV GIMBAL CAMERA (Signature Feature)       */}
        {/* ========================================================= */}
        <group ref={gimbalRef} position={[0, 0.02, 0.22]}>
          {/* Left & Right Roll Damper Brackets */}
          <mesh position={[-0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.028, 0.028, 0.04, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.9} />
          </mesh>
          <mesh position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.028, 0.028, 0.04, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.9} />
          </mesh>

          {/* Front Cylindrical FPV Camera Barrel */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.04]}>
            <cylinderGeometry args={[0.064, 0.064, 0.09, 24]} />
            <meshStandardMaterial color="#0F172A" metalness={0.92} roughness={0.15} />
          </mesh>

          {/* Sapphire Optical Lens Ring */}
          <mesh position={[0, 0, 0.086]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.044, 0.009, 16, 24]} />
            <meshStandardMaterial color="#0077C0" emissive="#0077C0" emissiveIntensity={1} />
          </mesh>
          {/* Glass Core */}
          <mesh position={[0, 0, 0.088]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.038, 24]} />
            <meshStandardMaterial color="#0284C7" roughness={0.05} metalness={0.95} />
          </mesh>

          {/* Lower Auxiliary Obstacle Sensor (From Sketch) */}
          <mesh position={[0, -0.065, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.03, 16]} />
            <meshStandardMaterial color="#1E293B" metalness={0.9} />
          </mesh>
          <mesh position={[0, -0.065, 0.036]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.02, 16]} />
            <meshStandardMaterial color="#F59E0B" emissive="#D97706" emissiveIntensity={1.2} />
          </mesh>

          {/* Front Dual Tactical Headlights (Cyan LEDs) */}
          <mesh position={[-0.13, 0.01, 0.02]}>
            <cylinderGeometry args={[0.022, 0.022, 0.02, 12]} />
            <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={3} />
          </mesh>
          <mesh position={[0.13, 0.01, 0.02]}>
            <cylinderGeometry args={[0.022, 0.022, 0.02, 12]} />
            <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={3} />
          </mesh>
          <pointLight position={[0, 0.01, 0.15]} color="#00E5FF" intensity={1.8} distance={3.5} />
        </group>

        {/* ========================================================= */}
        {/* 3. 4 CARBON FIBER ARMS, MOTOR PODS & VERTICAL FIN FEET    */}
        {/* ========================================================= */}
        {armConfigs.map((arm, index) => {
          const ledColor = arm.isFront ? '#0077C0' : '#10B981';

          return (
            <group key={index}>
              {/* Carbon Arm Tube */}
              <mesh
                position={[arm.x * 0.5, arm.y, arm.z * 0.5]}
                rotation={[0, arm.angle, Math.PI / 2]}
              >
                <cylinderGeometry args={[0.028, 0.028, 0.78, 16]} />
                <meshStandardMaterial
                  color="#1E293B"
                  roughness={0.35}
                  metalness={0.85}
                />
              </mesh>

              {/* Arm Navigation LED Strip */}
              <mesh position={[arm.x * 0.72, arm.y + 0.03, arm.z * 0.72]}>
                <boxGeometry args={[0.03, 0.015, 0.08]} />
                <meshStandardMaterial
                  color={ledColor}
                  emissive={ledColor}
                  emissiveIntensity={2.0}
                />
              </mesh>

              {/* Motor Pod Assembly */}
              <group position={[arm.x, arm.y, arm.z]}>
                {/* Brushless Motor Bell */}
                <mesh castShadow position={[0, 0.03, 0]}>
                  <cylinderGeometry args={[0.085, 0.08, 0.1, 20]} />
                  <meshStandardMaterial
                    color="#0F172A"
                    roughness={0.25}
                    metalness={0.9}
                  />
                </mesh>
                {/* Titanium Motor Top Rim */}
                <mesh position={[0, 0.075, 0]}>
                  <cylinderGeometry args={[0.052, 0.052, 0.02, 16]} />
                  <meshStandardMaterial
                    color="#94A3B8"
                    roughness={0.2}
                    metalness={0.95}
                  />
                </mesh>

                {/* =================================================== */}
                {/* VERTICAL LANDING FIN / LEG (Directly from Sketch)   */}
                {/* =================================================== */}
                <group position={[0, -0.1, 0]}>
                  {/* Tapered Vertical Fin Leg */}
                  <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.035, 0.018, 0.22, 12]} />
                    <meshStandardMaterial
                      color="#1E293B"
                      metalness={0.88}
                      roughness={0.3}
                    />
                  </mesh>
                  {/* Rubber Foot Tip */}
                  <mesh position={[0, -0.115, 0]}>
                    <sphereGeometry args={[0.02, 12, 12]} />
                    <meshStandardMaterial color="#0F172A" roughness={0.8} />
                  </mesh>
                </group>

                {/* =================================================== */}
                {/* ROTATING TRI-BLADE PROPELLER (3-Bilah Sesuai Sketsa)*/}
                {/* =================================================== */}
                <group ref={rotorRefs[index]} position={[0, 0.09, 0]}>
                  <TriBladePropeller status={status} />
                </group>
              </group>
            </group>
          );
        })}
      </group>

      {/* ========================================================= */}
      {/* 4. SOFT GROUND SHADOW DISC                                */}
      {/* ========================================================= */}
      <mesh
        ref={shadowMeshRef}
        position={[0, -0.38, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.72, 32]} />
        <meshBasicMaterial
          color="#0F172A"
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
    </>
  );
};

export interface Drone3DProps {
  status: DroneStatus;
  className?: string;
}

export const Drone3D: React.FC<Drone3DProps> = ({ status, className = '' }) => {
  return (
    <div className={`w-full h-full relative select-none pointer-events-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0.78, 2.35], fov: 42 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        style={{ pointerEvents: 'none' }}
      >
        {/* Soft Studio & Sun Lighting */}
        <ambientLight intensity={1.5} />
        <directionalLight
          position={[4, 8, 4]}
          intensity={2.0}
          castShadow
        />
        <directionalLight position={[-4, -2, -3]} intensity={0.6} color="#C7EEFF" />

        {/* 3D Quadcopter Model */}
        <DroneMesh status={status} />
      </Canvas>
    </div>
  );
};

export default Drone3D;
