// @ts-nocheck
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { DroneStatus } from '../../../core/types';

interface DroneMeshProps {
  status: DroneStatus;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Procedural Drone Quadcopter Component
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

    // 1. Rotor rotation speed based on status
    let rotorSpeed = 12; // rad/s for standby
    if (status === 'arming') {
      rotorSpeed = 38;
    } else if (status === 'flying') {
      rotorSpeed = 70;
    } else if (status === 'on_scene') {
      rotorSpeed = 26;
    }

    rotorRefs.forEach((ref, index) => {
      if (ref.current) {
        // Alternating CW and CCW rotation for realistic quadcopter physics
        const dir = index % 2 === 0 ? 1 : -1;
        ref.current.rotation.y += dir * rotorSpeed * delta;
      }
    });

    // 2. Beacon Flashing Strobe (Red Emergency Light)
    if (beaconLightRef.current && beaconMeshRef.current) {
      const flash = Math.sin(t * 8) > 0.1 ? 1 : 0.05;
      beaconLightRef.current.intensity = flash * 3.5;
      const mat = beaconMeshRef.current.material;
      if (mat) {
        mat.emissiveIntensity = flash * 2.5;
      }
    }

    // 3. Drone Movement & Flight Dynamics
    if (droneGroupRef.current) {
      const group = droneGroupRef.current;

      if (status === 'standby') {
        // Gentle floating hover
        const targetY = Math.sin(t * 1.8) * 0.05;
        group.position.y = lerp(group.position.y, targetY, 0.1);
        group.position.x = lerp(group.position.x, 0, 0.1);
        group.position.z = lerp(group.position.z, 0, 0.1);
        
        group.rotation.x = lerp(group.rotation.x, Math.sin(t * 1.2) * 0.03, 0.1);
        group.rotation.y = lerp(group.rotation.y, Math.sin(t * 0.5) * 0.15, 0.05);
        group.rotation.z = lerp(group.rotation.z, Math.cos(t * 1.4) * 0.03, 0.1);
      } else if (status === 'arming') {
        // Spooling up: fast micro-vibration indicating engine ignition
        const vibration = Math.sin(t * 50) * 0.012;
        group.position.y = lerp(group.position.y, vibration + 0.03, 0.2);
        group.rotation.x = lerp(group.rotation.x, -0.05, 0.1);
        group.rotation.z = lerp(group.rotation.z, (Math.random() - 0.5) * 0.02, 0.2);
      } else if (status === 'flying') {
        // High speed forward scramble & climb
        const targetY = 0.45 + Math.sin(t * 2.8) * 0.08;
        group.position.y = lerp(group.position.y, targetY, 0.08);
        group.position.z = lerp(group.position.z, -0.15, 0.08);
        
        // Pitch forward (-X) + bank roll
        group.rotation.x = lerp(group.rotation.x, -0.28, 0.1); // ~16 deg pitch down
        group.rotation.z = lerp(group.rotation.z, Math.sin(t * 2.2) * 0.08, 0.1);
        group.rotation.y = lerp(group.rotation.y, Math.sin(t * 0.8) * 0.2, 0.08);
      } else if (status === 'on_scene') {
        // Tactical aerial surveillance hover (yaw rotation scanning 360)
        const targetY = 0.25 + Math.sin(t * 1.5) * 0.06;
        group.position.y = lerp(group.position.y, targetY, 0.08);
        group.position.z = lerp(group.position.z, 0, 0.08);
        
        group.rotation.x = lerp(group.rotation.x, 0.05, 0.08);
        group.rotation.y += 0.4 * delta; // slow 360 scan
        group.rotation.z = lerp(group.rotation.z, Math.sin(t * 1.6) * 0.04, 0.08);
      }
    }

    // 4. Ground Shadow scaling and opacity reacting to altitude
    if (shadowMeshRef.current) {
      const targetScale = status === 'flying' ? 1.4 : 1.0;
      const targetOpacity = status === 'flying' ? 0.15 : 0.38;
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

    // 5. Camera Gimbal Tracking
    if (gimbalRef.current) {
      if (status === 'flying' || status === 'on_scene') {
        // Pitch camera down to survey road / ground
        gimbalRef.current.rotation.x = lerp(gimbalRef.current.rotation.x, 0.45, 0.1);
      } else {
        gimbalRef.current.rotation.x = lerp(gimbalRef.current.rotation.x, 0.1, 0.1);
      }
    }
  });

  // Arm positions: 4 diagonal quadcopter corners
  const armRadius = 0.85;
  const armAngleDeg = [45, 135, 225, 315];
  const armPositions = armAngleDeg.map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x: Math.cos(rad) * armRadius,
      z: Math.sin(rad) * armRadius,
      angle: -rad + Math.PI / 2,
    };
  });

  return (
    <>
      <group ref={droneGroupRef} position={[0, 0, 0]}>
        {/* 1. CENTRAL FUSELAGE / BODY */}
        <group position={[0, 0, 0]}>
          {/* Main Sleek Body Shell */}
          <mesh castShadow receiveShadow position={[0, 0, 0]}>
            <boxGeometry args={[0.55, 0.18, 0.7]} />
            <meshStandardMaterial
              color="#0F172A"
              roughness={0.25}
              metalness={0.85}
            />
          </mesh>

          {/* Top Aerodynamic Hood / Shield */}
          <mesh castShadow position={[0, 0.1, 0.02]}>
            <boxGeometry args={[0.42, 0.06, 0.55]} />
            <meshStandardMaterial
              color="#1E293B"
              roughness={0.2}
              metalness={0.9}
            />
          </mesh>

          {/* Korlantas Blue Livery Stripe */}
          <mesh position={[0, 0.132, 0.02]}>
            <boxGeometry args={[0.16, 0.01, 0.52]} />
            <meshStandardMaterial
              color="#0077C0"
              emissive="#0077C0"
              emissiveIntensity={0.6}
              roughness={0.2}
            />
          </mesh>

          {/* White Police Trim Accent */}
          <mesh position={[0, 0.133, 0.15]}>
            <boxGeometry args={[0.3, 0.008, 0.05]} />
            <meshStandardMaterial
              color="#FFFFFF"
              emissive="#FFFFFF"
              emissiveIntensity={0.4}
              roughness={0.1}
            />
          </mesh>

          {/* Red Emergency Beacon (Top Strobe) */}
          <mesh ref={beaconMeshRef} position={[0, 0.16, -0.08]}>
            <cylinderGeometry args={[0.045, 0.055, 0.05, 16]} />
            <meshStandardMaterial
              color="#EF4444"
              emissive="#EF4444"
              emissiveIntensity={2.5}
              roughness={0.1}
            />
          </mesh>
          <pointLight
            ref={beaconLightRef}
            position={[0, 0.22, -0.08]}
            color="#EF4444"
            intensity={3}
            distance={4}
          />

          {/* Dual Forward Headlights (Blue / Bright White Tactical Searchlights) */}
          <mesh position={[-0.14, -0.02, 0.35]}>
            <cylinderGeometry args={[0.03, 0.03, 0.02, 12]} />
            <meshStandardMaterial
              color="#00E5FF"
              emissive="#00E5FF"
              emissiveIntensity={3}
            />
          </mesh>
          <mesh position={[0.14, -0.02, 0.35]}>
            <cylinderGeometry args={[0.03, 0.03, 0.02, 12]} />
            <meshStandardMaterial
              color="#00E5FF"
              emissive="#00E5FF"
              emissiveIntensity={3}
            />
          </mesh>
          {/* Forward spot lighting */}
          <pointLight position={[0, -0.02, 0.45]} color="#00E5FF" intensity={1.5} distance={3} />
        </group>

        {/* 2. GIMBAL CAMERA & THERMAL SENSOR (Underbelly) */}
        <group ref={gimbalRef} position={[0, -0.12, 0.1]}>
          {/* Gimbal base mount */}
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
            <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Camera sphere housing */}
          <mesh castShadow position={[0, -0.04, 0]}>
            <sphereGeometry args={[0.09, 24, 24]} />
            <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.15} />
          </mesh>
          {/* 4K Optical Lens Ring */}
          <mesh position={[0, -0.04, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.045, 0.01, 16, 24]} />
            <meshStandardMaterial color="#0077C0" emissive="#0077C0" emissiveIntensity={0.8} />
          </mesh>
          {/* Glass Lens Core */}
          <mesh position={[0, -0.04, 0.082]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.04, 24]} />
            <meshStandardMaterial color="#0284C7" roughness={0.05} metalness={0.95} />
          </mesh>
          {/* Secondary FLIR Thermal Sensor Lens */}
          <mesh position={[0.045, -0.055, 0.065]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.018, 16]} />
            <meshStandardMaterial color="#F59E0B" emissive="#D97706" emissiveIntensity={1} />
          </mesh>
        </group>

        {/* 3. CARBON FIBER LANDING SKIDS */}
        <group position={[0, -0.16, 0]}>
          {/* Left Skid */}
          <mesh position={[-0.24, -0.05, 0]}>
            <boxGeometry args={[0.025, 0.015, 0.65]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[-0.24, 0.02, 0.15]} rotation={[0, 0, 0.25]}>
            <cylinderGeometry args={[0.012, 0.012, 0.12, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.9} />
          </mesh>
          <mesh position={[-0.24, 0.02, -0.15]} rotation={[0, 0, 0.25]}>
            <cylinderGeometry args={[0.012, 0.012, 0.12, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.9} />
          </mesh>

          {/* Right Skid */}
          <mesh position={[0.24, -0.05, 0]}>
            <boxGeometry args={[0.025, 0.015, 0.65]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh position={[0.24, 0.02, 0.15]} rotation={[0, 0, -0.25]}>
            <cylinderGeometry args={[0.012, 0.012, 0.12, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.9} />
          </mesh>
          <mesh position={[0.24, 0.02, -0.15]} rotation={[0, 0, -0.25]}>
            <cylinderGeometry args={[0.012, 0.012, 0.12, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.9} />
          </mesh>
        </group>

        {/* 4. 4 ROTOR ARMS & MOTOR PODS & PROPELLERS */}
        {armPositions.map((arm, index) => {
          const isFront = index < 2;
          const ledColor = isFront ? '#0077C0' : '#10B981';

          return (
            <group key={index}>
              {/* Carbon Arm Tube */}
              <mesh
                position={[arm.x * 0.5, 0.01, arm.z * 0.5]}
                rotation={[0, arm.angle, Math.PI / 2]}
              >
                <cylinderGeometry args={[0.026, 0.026, armRadius, 12]} />
                <meshStandardMaterial
                  color="#1E293B"
                  roughness={0.4}
                  metalness={0.8}
                />
              </mesh>

              {/* Arm Navigation LED Strip */}
              <mesh
                position={[arm.x * 0.72, 0.035, arm.z * 0.72]}
              >
                <boxGeometry args={[0.03, 0.015, 0.08]} />
                <meshStandardMaterial
                  color={ledColor}
                  emissive={ledColor}
                  emissiveIntensity={1.8}
                />
              </mesh>

              {/* Motor Pod Housing */}
              <group position={[arm.x, 0.03, arm.z]}>
                <mesh castShadow position={[0, 0, 0]}>
                  <cylinderGeometry args={[0.085, 0.08, 0.12, 16]} />
                  <meshStandardMaterial
                    color="#0F172A"
                    roughness={0.3}
                    metalness={0.85}
                  />
                </mesh>
                {/* Titanium Motor Top Rim */}
                <mesh position={[0, 0.065, 0]}>
                  <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
                  <meshStandardMaterial
                    color="#94A3B8"
                    roughness={0.2}
                    metalness={0.95}
                  />
                </mesh>

                {/* ROTATING PROPELLER BLADES */}
                <group ref={rotorRefs[index]} position={[0, 0.08, 0]}>
                  {/* Propeller Hub Cap */}
                  <mesh position={[0, 0.015, 0]}>
                    <sphereGeometry args={[0.035, 12, 12]} />
                    <meshStandardMaterial color="#0077C0" roughness={0.3} metalness={0.7} />
                  </mesh>

                  {/* Blade 1 */}
                  <mesh position={[0.26, 0, 0]} rotation={[0, 0, 0.08]}>
                    <boxGeometry args={[0.52, 0.008, 0.045]} />
                    <meshStandardMaterial
                      color="#0F172A"
                      roughness={0.2}
                      metalness={0.8}
                      transparent
                      opacity={status === 'flying' ? 0.6 : 0.95}
                    />
                  </mesh>
                  {/* Blade 1 Tip Stripe */}
                  <mesh position={[0.48, 0.005, 0]}>
                    <boxGeometry args={[0.08, 0.01, 0.046]} />
                    <meshStandardMaterial
                      color="#00E5FF"
                      emissive="#00E5FF"
                      emissiveIntensity={status === 'flying' ? 2 : 0.8}
                    />
                  </mesh>

                  {/* Blade 2 */}
                  <mesh position={[-0.26, 0, 0]} rotation={[0, 0, -0.08]}>
                    <boxGeometry args={[0.52, 0.008, 0.045]} />
                    <meshStandardMaterial
                      color="#0F172A"
                      roughness={0.2}
                      metalness={0.8}
                      transparent
                      opacity={status === 'flying' ? 0.6 : 0.95}
                    />
                  </mesh>
                  {/* Blade 2 Tip Stripe */}
                  <mesh position={[-0.48, 0.005, 0]}>
                    <boxGeometry args={[0.08, 0.01, 0.046]} />
                    <meshStandardMaterial
                      color="#00E5FF"
                      emissive="#00E5FF"
                      emissiveIntensity={status === 'flying' ? 2 : 0.8}
                    />
                  </mesh>
                </group>
              </group>
            </group>
          );
        })}
      </group>

      {/* 5. SOFT GROUND SHADOW (Native Three.js Plane) */}
      <mesh
        ref={shadowMeshRef}
        position={[0, -0.72, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.95, 32]} />
        <meshBasicMaterial
          color="#001a33"
          transparent
          opacity={0.38}
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
        camera={{ position: [0, 1.35, 2.9], fov: 42 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        style={{ pointerEvents: 'none' }}
      >
        {/* Soft Ambient & Directional Sun Lighting */}
        <ambientLight intensity={1.4} />
        <directionalLight
          position={[4, 8, 4]}
          intensity={1.8}
          castShadow
        />
        <directionalLight position={[-4, -2, -3]} intensity={0.5} color="#C7EEFF" />

        {/* 3D Quadcopter Model */}
        <DroneMesh status={status} />
      </Canvas>
    </div>
  );
};

export default Drone3D;
