// Simple Stream Component - A more basic, guaranteed-to-show water stream
// This ensures the water is visible while we debug the advanced version

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function SimpleStream(props: React.ComponentProps<'group'>) {
  const streamRef = useRef<THREE.Mesh>(null!)
  
  // Create a simple curved stream geometry
  const streamGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(20, 3, 32, 8)
    
    // Add gentle curves to the stream
    const vertices = geometry.attributes.position.array
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i]
      const y = vertices[i + 1]
      
      // Create S-curve
      vertices[i + 2] = Math.sin(x * 0.1) * 2 + Math.cos(y * 0.3) * 1
    }
    
    geometry.attributes.position.needsUpdate = true
    return geometry
  }, [])
  
  // Simple animation
  useFrame(({ clock }) => {
    if (streamRef.current) {
      const time = clock.getElapsedTime()
      // Animate the material for flow effect
      if (streamRef.current.material instanceof THREE.MeshStandardMaterial) {
        streamRef.current.material.emissiveIntensity = 0.1 + Math.sin(time) * 0.05
      }
    }
  })
  
  return (
    <group {...props}>
      {/* Simple blue water plane */}
      <mesh 
        ref={streamRef}
        geometry={streamGeometry}
        position={[0, 2, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          color="#4682b4"        // Steel blue
          transparent={true}
          opacity={0.7}
          roughness={0.1}
          metalness={0.2}
          emissive="#87ceeb"     // Light blue glow
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Stream bed underneath */}
      <mesh 
        geometry={streamGeometry}
        position={[0, 1.8, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1.1, 1, 1]}
      >
        <meshStandardMaterial
          color="#2d5a7a"      // Darker blue for depth
          roughness={0.8}
        />
      </mesh>
      
      {/* Some simple stones along the edge */}
      {Array.from({ length: 10 }, (_, i) => {
        const x = (i - 5) * 3 + (Math.random() - 0.5) * 2
        const z = (Math.random() - 0.5) * 6
        
        return (
          <mesh
            key={i}
            position={[x, 2.1, z]}
            scale={[0.3 + Math.random() * 0.2, 0.2, 0.3 + Math.random() * 0.2]}
          >
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial
              color="#8a8a7a"
              roughness={0.9}
            />
          </mesh>
        )
      })}
    </group>
  )
}
