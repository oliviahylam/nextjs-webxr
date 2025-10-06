// Floating Orbs Component - Magical glowing spheres that drift peacefully
// These orbs add a whimsical, dreamlike quality to the oasis with soft colors

import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Individual floating orb with gentle animation
function FloatingOrb({ 
  position, 
  color, 
  size = 0.1,
  speed = 1 
}: { 
  position: [number, number, number]
  color: string
  size?: number
  speed?: number 
}) {
  const orbRef = useRef<THREE.Mesh>(null!)
  const initialY = position[1]

  // Gentle floating animation
  useFrame(({ clock }) => {
    if (orbRef.current) {
      const time = clock.getElapsedTime() * speed
      
      // Float up and down gently
      orbRef.current.position.y = initialY + Math.sin(time) * 0.3
      
      // Subtle side-to-side drift
      orbRef.current.position.x = position[0] + Math.cos(time * 0.7) * 0.2
      orbRef.current.position.z = position[2] + Math.sin(time * 0.5) * 0.15
      
      // Gentle pulsing glow effect
      const glowIntensity = 0.3 + Math.sin(time * 2) * 0.1
      if (orbRef.current.material instanceof THREE.MeshStandardMaterial) {
        orbRef.current.material.emissiveIntensity = glowIntensity
      }
    }
  })

  return (
    <mesh ref={orbRef} position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        transparent={true}
        opacity={0.8}
        roughness={0.1}
        metalness={0.1}
      />
    </mesh>
  )
}

// Collection of magical floating orbs throughout the oasis
export function FloatingOrbs(props: React.ComponentProps<'group'>) {
  return (
    <group {...props}>
      {/* Warm sunset colors - peaceful and dreamy */}
      <FloatingOrb 
        position={[-3, 2, -1]} 
        color="#ffb3ba" // Soft pink
        size={0.08}
        speed={0.8}
      />
      
      <FloatingOrb 
        position={[4, 2.5, 2]} 
        color="#bae1ff" // Sky blue
        size={0.12}
        speed={0.6}
      />
      
      <FloatingOrb 
        position={[0, 3, 4]} 
        color="#ffffba" // Gentle yellow
        size={0.1}
        speed={1.2}
      />
      
      <FloatingOrb 
        position={[-2, 1.8, 3]} 
        color="#baffc9" // Mint green
        size={0.09}
        speed={0.9}
      />
      
      <FloatingOrb 
        position={[2, 2.2, -3]} 
        color="#ffdfba" // Warm peach
        size={0.11}
        speed={0.7}
      />
      
      <FloatingOrb 
        position={[-4, 3.2, 0]} 
        color="#e0baff" // Lavender
        size={0.07}
        speed={1.1}
      />
      
      <FloatingOrb 
        position={[1, 2.8, 1]} 
        color="#baffdf" // Seafoam
        size={0.1}
        speed={0.8}
      />
      
      {/* Smaller accent orbs */}
      <FloatingOrb 
        position={[3, 1.5, -1]} 
        color="#ffc9ba" // Coral
        size={0.06}
        speed={1.3}
      />
      
      <FloatingOrb 
        position={[-1, 2.3, -2]} 
        color="#c9baff" // Periwinkle
        size={0.08}
        speed={0.9}
      />
    </group>
  )
}
