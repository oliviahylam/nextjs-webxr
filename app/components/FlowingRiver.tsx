// Flowing River Component - Creates a serene water feature for the oasis
// This component creates an animated flowing river with gentle waves and soft blue tones

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Plane } from '@react-three/drei'
import * as THREE from 'three'

export function FlowingRiver(props: React.ComponentProps<'group'>) {
  // Reference to the river material so we can animate it
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!)
  
  // Create a custom shader material for the flowing water effect
  const riverGeometry = useMemo(() => {
    // Create a curved river path using a plane with custom geometry
    const geometry = new THREE.PlaneGeometry(20, 3, 32, 8)
    
    // Add gentle curves to make the river feel more natural
    const vertices = geometry.attributes.position.array
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i]
      const y = vertices[i + 1]
      
      // Create gentle S-curve for the river path
      vertices[i + 2] = Math.sin(x * 0.1) * 0.2 + Math.cos(y * 0.3) * 0.1
    }
    
    geometry.attributes.position.needsUpdate = true
    return geometry
  }, [])

  // Animation loop to create flowing water effect
  useFrame(({ clock }) => {
    if (materialRef.current) {
      // Animate the material to create flowing water illusion
      const time = clock.getElapsedTime()
      
      // Create subtle color variations for flowing water
      const flowPhase = Math.sin(time * 0.5) * 0.1 + 0.9
      materialRef.current.color.setRGB(
        0.4 * flowPhase,  // Soft blue
        0.7 * flowPhase,  // Aqua
        0.9 * flowPhase   // Light blue
      )
      
      // Add subtle transparency variation for depth
      materialRef.current.opacity = 0.7 + Math.sin(time * 0.3) * 0.1
    }
  })

  return (
    <group {...props}>
      {/* Main river surface */}
      <mesh 
        geometry={riverGeometry}
        position={[0, -0.8, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          ref={materialRef}
          color="#5fb3d9"      // Soft aqua blue
          transparent={true}
          opacity={0.7}
          roughness={0.1}      // Very smooth water surface
          metalness={0.2}      // Slight reflective quality
          emissive="#1a4a5c"  // Subtle inner glow
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* River bed - darker blue underneath for depth */}
      <mesh 
        geometry={riverGeometry}
        position={[0, -0.9, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1.1, 1, 1]}
      >
        <meshStandardMaterial
          color="#2d5a7a"      // Deeper blue for river bed
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Gentle mist particles above the water */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh 
          key={i}
          position={[
            (Math.random() - 0.5) * 18, // Random X along river
            0.2 + Math.random() * 0.5,  // Floating above water
            (Math.random() - 0.5) * 2   // Random Z within river width
          ]}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent={true}
            opacity={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}
