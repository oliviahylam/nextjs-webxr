// Atmospheric Mist Component - Creates light mist effects throughout the garden
// Gentle fog and particle effects that enhance the dreamy zen atmosphere

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Individual mist particle
function MistParticle({ 
  position, 
  scale = 1,
  speed = 1 
}: { 
  position: [number, number, number]
  scale?: number
  speed?: number 
}) {
  const particleRef = useRef<THREE.Mesh>(null!)
  const initialPosition = useMemo(() => [...position], [position])
  
  useFrame(({ clock }) => {
    if (particleRef.current) {
      const time = clock.getElapsedTime() * speed
      
      // Gentle floating motion
      particleRef.current.position.x = initialPosition[0] + Math.sin(time * 0.3) * 2
      particleRef.current.position.y = initialPosition[1] + Math.sin(time * 0.2) * 0.5
      particleRef.current.position.z = initialPosition[2] + Math.cos(time * 0.25) * 1.5
      
      // Gentle pulsing opacity
      const opacity = 0.1 + Math.sin(time * 0.5) * 0.05
      if (particleRef.current.material instanceof THREE.MeshBasicMaterial) {
        particleRef.current.material.opacity = opacity
      }
    }
  })
  
  return (
    <mesh ref={particleRef} position={position} scale={scale}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent={true}
        opacity={0.1}
      />
    </mesh>
  )
}

// Ground fog layer
function GroundFog(props: React.ComponentProps<'group'>) {
  const fogRef = useRef<THREE.Group>(null!)
  
  useFrame(({ clock }) => {
    if (fogRef.current) {
      const time = clock.getElapsedTime()
      fogRef.current.rotation.y = time * 0.01 // Very slow rotation
    }
  })
  
  return (
    <group ref={fogRef} {...props}>
      {Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * Math.PI * 2
        const radius = 5 + Math.random() * 15
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const y = 1 + Math.random() * 0.5
        
        return (
          <mesh
            key={`fog-${i}`}
            position={[x, y, z]}
            scale={[2 + Math.random() * 2, 0.3, 2 + Math.random() * 2]}
            rotation={[0, Math.random() * Math.PI, 0]}
          >
            <sphereGeometry args={[1, 8, 6]} />
            <meshBasicMaterial
              color="#f0f8ff"      // Alice blue
              transparent={true}
              opacity={0.05 + Math.random() * 0.05}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// Rising steam from water
function WaterSteam(props: React.ComponentProps<'group'>) {
  return (
    <group {...props}>
      {Array.from({ length: 12 }, (_, i) => {
        const t = i / 12
        const x = (t - 0.5) * 18 + (Math.random() - 0.5) * 2
        const z = Math.sin(t * Math.PI * 2) * 6 + (Math.random() - 0.5) * 2
        const y = 2.2 + Math.random() * 0.3
        
        return (
          <MistParticle
            key={`steam-${i}`}
            position={[x, y, z]}
            scale={0.3 + Math.random() * 0.2}
            speed={0.8 + Math.random() * 0.4}
          />
        )
      })}
    </group>
  )
}

// Floating mist around bonsai
function BonsaiMist(props: React.ComponentProps<'group'>) {
  return (
    <group {...props}>
      {/* Mist around each bonsai area */}
      {[
        [8, 2.5, 5], [-6, 2.5, 8], [12, 2.5, -3],
        [-10, 2.5, -5], [3, 2.5, -12], [-8, 2.5, 12],
        [15, 2.5, 8], [-12, 2.5, 2]
      ].map((pos, i) => (
        <MistParticle
          key={`bonsai-mist-${i}`}
          position={pos as [number, number, number]}
          scale={0.4 + Math.random() * 0.3}
          speed={0.5 + Math.random() * 0.3}
        />
      ))}
    </group>
  )
}

// Main atmospheric mist component
export function AtmosphericMist(props: React.ComponentProps<'group'>) {
  return (
    <group {...props}>
      
      {/* Ground level fog */}
      <GroundFog />
      
      {/* Steam rising from water features */}
      <WaterSteam />
      
      {/* Mist around bonsai trees */}
      <BonsaiMist />
      
      {/* Random floating mist particles */}
      {Array.from({ length: 25 }, (_, i) => {
        const angle = Math.random() * Math.PI * 2
        const radius = Math.random() * 18
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const y = 2 + Math.random() * 4
        
        return (
          <MistParticle
            key={`ambient-mist-${i}`}
            position={[x, y, z]}
            scale={0.2 + Math.random() * 0.4}
            speed={0.3 + Math.random() * 0.7}
          />
        )
      })}
      
      {/* Subtle light rays through mist */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const x = Math.cos(angle) * 12
        const z = Math.sin(angle) * 12
        
        return (
          <mesh
            key={`light-ray-${i}`}
            position={[x, 4, z]}
            rotation={[Math.PI / 6, angle, 0]}
            scale={[0.1, 6, 0.1]}
          >
            <boxGeometry />
            <meshBasicMaterial
              color="#fff8dc"      // Cornsilk - warm light
              transparent={true}
              opacity={0.03}
            />
          </mesh>
        )
      })}
      
      {/* Volumetric fog effect using planes */}
      {Array.from({ length: 6 }, (_, i) => {
        const height = 1 + i * 1.5
        const opacity = 0.02 - i * 0.003 // Fade with height
        
        return (
          <mesh
            key={`fog-layer-${i}`}
            position={[0, height, 0]}
            rotation={[-Math.PI / 2, 0, i * 0.3]}
            scale={[40, 40, 1]}
          >
            <planeGeometry />
            <meshBasicMaterial
              color="#f5f5f5"      // White smoke
              transparent={true}
              opacity={opacity}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
      
    </group>
  )
}
