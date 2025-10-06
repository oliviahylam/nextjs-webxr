// Tropical Plants Component - Creates lush oasis vegetation
// Palm trees, ferns, and hanging vines to complete the oasis atmosphere

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Palm Tree component
function PalmTree({ 
  position, 
  scale = 1 
}: { 
  position: [number, number, number]
  scale?: number 
}) {
  const leavesRef = useRef<THREE.Group>(null!)
  
  // Gentle swaying animation for palm leaves
  useFrame(({ clock }) => {
    if (leavesRef.current) {
      const time = clock.getElapsedTime()
      leavesRef.current.rotation.z = Math.sin(time * 0.5) * 0.1
      leavesRef.current.rotation.x = Math.cos(time * 0.3) * 0.05
    }
  })

  return (
    <group position={position} scale={scale}>
      {/* Palm trunk */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 4, 8]} />
        <meshStandardMaterial
          color="#8b6914"       // Brown trunk
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Palm leaves group */}
      <group ref={leavesRef} position={[0, 4, 0]}>
        {/* Individual palm fronds */}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * Math.PI * 2
          const x = Math.cos(angle) * 0.1
          const z = Math.sin(angle) * 0.1
          
          return (
            <mesh 
              key={i}
              position={[x, 0, z]}
              rotation={[
                Math.PI / 6,      // Droop angle
                angle,            // Radial position
                Math.sin(angle) * 0.2 // Natural curve
              ]}
              scale={[0.2, 2, 0.05]}
            >
              <boxGeometry />
              <meshStandardMaterial
                color="#228b22"   // Forest green
                roughness={0.7}
                metalness={0.1}
              />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

// Large Tropical Fern
function TropicalFern({ 
  position, 
  scale = 1 
}: { 
  position: [number, number, number]
  scale?: number 
}) {
  const fernRef = useRef<THREE.Group>(null!)
  
  // Gentle breathing motion
  useFrame(({ clock }) => {
    if (fernRef.current) {
      const time = clock.getElapsedTime()
      fernRef.current.scale.setScalar(scale * (1 + Math.sin(time * 0.8) * 0.05))
    }
  })

  return (
    <group ref={fernRef} position={position} scale={scale}>
      {/* Fern fronds arranged in a spiral */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const radius = 0.5 + (i % 3) * 0.3
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const height = 1 + Math.random() * 0.5
        
        return (
          <mesh 
            key={i}
            position={[x, height / 2, z]}
            rotation={[0, angle, Math.PI / 8]}
            scale={[0.1, height, 0.3]}
          >
            <boxGeometry />
            <meshStandardMaterial
              color="#32cd32"     // Lime green
              roughness={0.8}
              transparent={true}
              opacity={0.8}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// Hanging Vines from ceiling
function HangingVines({ 
  position, 
  length = 3 
}: { 
  position: [number, number, number]
  length?: number 
}) {
  const vinesRef = useRef<THREE.Group>(null!)
  
  // Gentle swaying motion
  useFrame(({ clock }) => {
    if (vinesRef.current) {
      const time = clock.getElapsedTime()
      vinesRef.current.rotation.z = Math.sin(time * 0.4 + position[0]) * 0.15
    }
  })

  return (
    <group ref={vinesRef} position={position}>
      {/* Multiple vine strands */}
      {Array.from({ length: 5 }, (_, i) => {
        const offset = (i - 2) * 0.2
        const vineLength = length + Math.random() * 2
        
        return (
          <mesh 
            key={i}
            position={[offset, -vineLength / 2, offset * 0.5]}
            scale={[0.05, vineLength, 0.05]}
          >
            <cylinderGeometry args={[1, 1, 1, 6]} />
            <meshStandardMaterial
              color="#006400"     // Dark green
              roughness={0.9}
            />
          </mesh>
        )
      })}
      
      {/* Small leaves along the vines */}
      {Array.from({ length: 8 }, (_, i) => {
        const y = -0.5 - (i * 0.4)
        const offset = Math.sin(i) * 0.3
        
        return (
          <mesh 
            key={`leaf-${i}`}
            position={[offset, y, 0]}
            rotation={[0, i * 0.5, Math.PI / 4]}
            scale={[0.15, 0.1, 0.02]}
          >
            <boxGeometry />
            <meshStandardMaterial
              color="#228b22"
              roughness={0.7}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// Main component that places all tropical plants
export function TropicalPlants(props: React.ComponentProps<'group'>) {
  return (
    <group {...props}>
      
      {/* Palm trees around the oasis */}
      <PalmTree position={[15, -1, 8]} scale={1.2} />
      <PalmTree position={[-12, -1, 15]} scale={1.0} />
      <PalmTree position={[18, -1, -5]} scale={1.4} />
      <PalmTree position={[-8, -1, -18]} scale={0.9} />
      <PalmTree position={[5, -1, 20]} scale={1.1} />
      
      {/* Large ferns for undergrowth */}
      <TropicalFern position={[8, -1, 5]} scale={1.5} />
      <TropicalFern position={[-15, -1, 3]} scale={1.2} />
      <TropicalFern position={[12, -1, -12]} scale={1.8} />
      <TropicalFern position={[-5, -1, -8]} scale={1.0} />
      <TropicalFern position={[-18, -1, -2]} scale={1.3} />
      <TropicalFern position={[2, -1, 18]} scale={1.6} />
      
      {/* Hanging vines from the ceiling near pillars */}
      <HangingVines position={[20, 11, 6]} length={4} />
      <HangingVines position={[-18, 11, -8]} length={5} />
      <HangingVines position={[6, 11, -20]} length={3} />
      <HangingVines position={[-10, 11, 16]} length={4.5} />
      <HangingVines position={[16, 11, 16]} length={3.5} />
      <HangingVines position={[-20, 11, 4]} length={4} />
      
      {/* Small decorative plants */}
      {Array.from({ length: 20 }, (_, i) => {
        const angle = Math.random() * Math.PI * 2
        const radius = 5 + Math.random() * 15
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <mesh 
            key={`small-plant-${i}`}
            position={[x, -0.5, z]}
            scale={[0.2, 0.3 + Math.random() * 0.4, 0.2]}
          >
            <coneGeometry args={[1, 2, 6]} />
            <meshStandardMaterial
              color="#90ee90"     // Light green
              roughness={0.8}
            />
          </mesh>
        )
      })}
      
    </group>
  )
}
