// Water Fountain Component - Creates beautiful water features
// Multiple fountains with animated water droplets and pools

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Individual water droplet particle
function WaterDroplet({ 
  startPosition, 
  delay = 0 
}: { 
  startPosition: [number, number, number]
  delay?: number 
}) {
  const dropletRef = useRef<THREE.Mesh>(null!)
  
  useFrame(({ clock }) => {
    if (dropletRef.current) {
      const time = clock.getElapsedTime() + delay
      const cycle = (time % 3) / 3 // 3-second cycles
      
      if (cycle < 0.8) { // Rising phase
        const height = cycle * 4 // Rise 4 units
        dropletRef.current.position.y = startPosition[1] + height
        dropletRef.current.position.x = startPosition[0] + Math.sin(time * 2) * 0.1
        dropletRef.current.position.z = startPosition[2] + Math.cos(time * 2) * 0.1
        dropletRef.current.visible = true
        
        // Scale effect - larger at peak
        const scale = 0.02 + cycle * 0.03
        dropletRef.current.scale.setScalar(scale)
      } else { // Falling phase
        const fallProgress = (cycle - 0.8) / 0.2
        const height = 4 * (1 - fallProgress * fallProgress) // Parabolic fall
        dropletRef.current.position.y = startPosition[1] + height
        dropletRef.current.visible = fallProgress < 1
      }
    }
  })
  
  return (
    <mesh ref={dropletRef} position={startPosition}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshStandardMaterial
        color="#87ceeb"      // Sky blue water
        transparent={true}
        opacity={0.8}
        roughness={0.1}
        metalness={0.1}
      />
    </mesh>
  )
}

// Single fountain with pool
function Fountain({ 
  position, 
  scale = 1 
}: { 
  position: [number, number, number]
  scale?: number 
}) {
  
  return (
    <group position={position} scale={scale}>
      
      {/* Fountain base/pool */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[2, 2, 0.4, 16]} />
        <meshStandardMaterial
          color="#d2b48c"      // Sandy stone color
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>
      
      {/* Water in the pool */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[1.8, 1.8, 0.2, 16]} />
        <meshStandardMaterial
          color="#4682b4"      // Steel blue water
          transparent={true}
          opacity={0.7}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>
      
      {/* Central fountain spout */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 1, 8]} />
        <meshStandardMaterial
          color="#a0522d"      // Brown stone
          roughness={0.8}
        />
      </mesh>
      
      {/* Water droplets shooting up */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 0.1
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <WaterDroplet 
            key={i}
            startPosition={[x, 1, z]}
            delay={i * 0.2} // Stagger the droplets
          />
        )
      })}
      
      {/* Decorative stones around the fountain */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2
        const radius = 2.5
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <mesh 
            key={`stone-${i}`}
            position={[x, -0.3, z]}
            scale={[0.3, 0.2, 0.3]}
          >
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial
              color="#696969"    // Dim gray stones
              roughness={0.9}
            />
          </mesh>
        )
      })}
      
    </group>
  )
}

// Main component with multiple fountains
export function WaterFountain(props: React.ComponentProps<'group'>) {
  return (
    <group {...props}>
      
      {/* Central grand fountain */}
      <Fountain position={[0, -1, 0]} scale={1.5} />
      
      {/* Smaller fountains around the oasis */}
      <Fountain position={[12, -1, 8]} scale={0.8} />
      <Fountain position={[-10, -1, 12]} scale={0.7} />
      <Fountain position={[15, -1, -6]} scale={0.9} />
      <Fountain position={[-8, -1, -14]} scale={0.6} />
      
      {/* Connecting water channels */}
      <mesh position={[6, -1.2, 4]} rotation={[0, 0.5, 0]} scale={[8, 0.1, 0.8]}>
        <boxGeometry />
        <meshStandardMaterial
          color="#4682b4"
          transparent={true}
          opacity={0.6}
          roughness={0.1}
        />
      </mesh>
      
      <mesh position={[-4, -1.2, -5]} rotation={[0, -0.8, 0]} scale={[10, 0.1, 0.8]}>
        <boxGeometry />
        <meshStandardMaterial
          color="#4682b4"
          transparent={true}
          opacity={0.6}
          roughness={0.1}
        />
      </mesh>
      
    </group>
  )
}
