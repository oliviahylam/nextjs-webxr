// Oasis Room Component - Creates a large circular room with skylight
// This architectural component forms the sanctuary walls and ceiling opening

import React, { useMemo } from 'react'
import * as THREE from 'three'

export function OasisRoom(props: React.ComponentProps<'group'>) {
  
  // Create circular room walls
  const wallGeometry = useMemo(() => {
    const radius = 25        // Large room radius
    const height = 12        // High ceiling
    const segments = 32      // Smooth circular walls
    
    // Create cylinder geometry for the room walls
    const geometry = new THREE.CylinderGeometry(
      radius, radius,    // Same radius top and bottom
      height,           // Height of walls
      segments,         // Number of segments for smoothness
      1,               // Height segments
      true             // Open ended (no top/bottom)
    )
    
    return geometry
  }, [])
  
  // Create the ceiling with a circular skylight hole
  const ceilingGeometry = useMemo(() => {
    const outerRadius = 25    // Same as room radius
    const innerRadius = 8     // Skylight opening size
    const segments = 32
    
    // Create ring geometry for ceiling with hole
    const geometry = new THREE.RingGeometry(
      innerRadius,      // Inner radius (skylight hole)
      outerRadius,      // Outer radius (room edge)
      segments          // Smooth circular opening
    )
    
    return geometry
  }, [])
  
  // Create floor geometry
  const floorGeometry = useMemo(() => {
    const geometry = new THREE.CircleGeometry(25, 32)
    return geometry
  }, [])

  return (
    <group {...props}>
      
      {/* Circular room walls */}
      <mesh 
        geometry={wallGeometry}
        position={[0, 6, 0]}  // Center the walls vertically
      >
        <meshStandardMaterial
          color="#f4e4bc"       // Warm sandstone color
          roughness={0.8}       // Natural stone texture
          metalness={0.1}       // Slight mineral shine
          side={THREE.BackSide} // Render inside faces
        />
      </mesh>
      
      {/* Ceiling with skylight opening */}
      <mesh 
        geometry={ceilingGeometry}
        position={[0, 12, 0]}   // At the top of the walls
        rotation={[-Math.PI / 2, 0, 0]} // Face downward
      >
        <meshStandardMaterial
          color="#e8d5a3"       // Slightly darker ceiling tone
          roughness={0.9}       // Matte finish
          metalness={0.05}
          side={THREE.DoubleSide} // Visible from both sides
        />
      </mesh>
      
      {/* Stone floor base */}
      <mesh 
        geometry={floorGeometry}
        position={[0, -2, 0]}   // Below the zen garden
        rotation={[-Math.PI / 2, 0, 0]} // Face upward
      >
        <meshStandardMaterial
          color="#d4c4a8"       // Natural stone floor
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>
      
      {/* Decorative stone pillars around the room */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 22  // Near the walls
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <mesh 
            key={`pillar-${i}`}
            position={[x, 4, z]}
            scale={[1, 2, 1]} // Tall pillars
          >
            <cylinderGeometry args={[0.8, 1.2, 8, 8]} />
            <meshStandardMaterial
              color="#c8b5a0"     // Warm stone color
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
        )
      })}
      
      {/* Skylight rim - decorative border around the opening */}
      <mesh position={[0, 11.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7.5, 8.5, 32]} />
        <meshStandardMaterial
          color="#b8a085"       // Darker rim
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>
      
      {/* Light rays effect from skylight */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const x = Math.cos(angle) * 3
        const z = Math.sin(angle) * 3
        
        return (
          <mesh 
            key={`lightray-${i}`}
            position={[x, 8, z]}
            rotation={[0, angle, 0]}
            scale={[0.1, 4, 0.1]}
          >
            <boxGeometry />
            <meshBasicMaterial
              color="#fff8dc"     // Warm sunlight color
              transparent={true}
              opacity={0.1}       // Very subtle light rays
            />
          </mesh>
        )
      })}
      
    </group>
  )
}
