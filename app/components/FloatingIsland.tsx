// Floating Island Component - Creates a circular zen garden island
// This forms the foundation of our Japanese oasis with cascading water edges
// Now enhanced with custom surface shaders for realistic moss and sand textures

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
// Unused shaders - keeping imports for future use
// import { StylizedMoss, StylizedSand } from '../shaders/SurfaceShaders'

export function FloatingIsland(props: React.ComponentProps<'group'>) {
  const islandRef = useRef<THREE.Group>(null!)
  
  // Create the main circular island geometry
  const islandGeometry = useMemo(() => {
    const radius = 20
    const geometry = new THREE.CylinderGeometry(radius, radius * 0.8, 3, 32, 1)
    
    // Add organic variation to the island surface
    const vertices = geometry.attributes.position.array
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i]
      const y = vertices[i + 1]
      const z = vertices[i + 2]
      
      // Create gentle undulations on the surface
      const distance = Math.sqrt(x * x + z * z)
      const noise = Math.sin(distance * 0.2) * 0.3 + Math.cos(x * 0.1) * 0.2
      vertices[i + 1] = y + noise
    }
    
    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
    return geometry
  }, [])

  // Gentle floating animation
  useFrame(({ clock }) => {
    if (islandRef.current) {
      const time = clock.getElapsedTime()
      islandRef.current.position.y = Math.sin(time * 0.3) * 0.1
      islandRef.current.rotation.y = time * 0.01 // Very slow rotation
    }
  })

  return (
    <group ref={islandRef} {...props}>
      
      {/* Main island surface with beige material */}
      <mesh 
        geometry={islandGeometry} 
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="#f0e6d2"        // Warm beige base
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      
      {/* Moss patches on top */}
      {Array.from({ length: 15 }, (_, i) => {
        const angle = Math.random() * Math.PI * 2
        const radius = Math.random() * 18
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <mesh 
            key={`moss-${i}`}
            position={[x, 1.8 + Math.random() * 0.3, z]}
            rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}
            scale={[0.5 + Math.random(), 0.5 + Math.random(), 1]}
          >
            <circleGeometry args={[1, 12]} />
            <meshStandardMaterial
              color="#e8dcc6"      // Light beige patches
              transparent={true}
              opacity={0.7}
              roughness={0.9}
            />
          </mesh>
        )
      })}
      
      {/* Cascading water around the edges */}
      {Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * Math.PI * 2
        const radius = 19.5
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <group key={`waterfall-${i}`} position={[x, 0, z]} rotation={[0, angle, 0]}>
            {/* Water curtain */}
            <mesh position={[0, -2, 0]} scale={[0.3, 4, 0.1]}>
              <boxGeometry />
              <meshStandardMaterial
                color="#87ceeb"
                transparent={true}
                opacity={0.6}
                roughness={0.1}
                metalness={0.1}
              />
            </mesh>
            
            {/* Water droplets */}
            {Array.from({ length: 3 }, (_, j) => (
              <mesh 
                key={j}
                position={[
                  (Math.random() - 0.5) * 0.4,
                  -1 - j * 1.5,
                  (Math.random() - 0.5) * 0.2
                ]}
                scale={[0.05, 0.1, 0.05]}
              >
                <sphereGeometry args={[1, 6, 4]} />
                <meshStandardMaterial
                  color="#b0e0e6"
                  transparent={true}
                  opacity={0.8}
                />
              </mesh>
            ))}
          </group>
        )
      })}
      
      {/* Underwater glow effect */}
      <mesh position={[0, -1, 0]} scale={[25, 0.1, 25]}>
        <cylinderGeometry args={[1, 1, 1, 32]} />
        <meshBasicMaterial
          color="#4682b4"
          transparent={true}
          opacity={0.3}
        />
      </mesh>
      
    </group>
  )
}
