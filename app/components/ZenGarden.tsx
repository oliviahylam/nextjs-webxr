// Zen Garden Component - Creates the ground surface with soft, curved terrain
// This represents the peaceful earth foundation of the oasis with gentle hills

import React, { useMemo } from 'react'
import * as THREE from 'three'

export function ZenGarden(props: React.ComponentProps<'group'>) {
  // Create organic, gently rolling terrain
  const gardenGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(30, 30, 32, 32)
    const vertices = geometry.attributes.position.array
    
    // Create gentle rolling hills and valleys
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i]
      const z = vertices[i + 2] // Z is the "y" for a horizontal plane
      
      // Create organic terrain with multiple wave patterns
      const elevation = 
        Math.sin(x * 0.1) * 0.3 +           // Large rolling hills
        Math.cos(z * 0.15) * 0.2 +          // Perpendicular waves
        Math.sin(x * 0.3 + z * 0.2) * 0.1 + // Diagonal patterns
        Math.cos(x * 0.05 + z * 0.08) * 0.15 // Very gentle base waves
      
      vertices[i + 1] = elevation // Y coordinate (height)
    }
    
    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals() // Recalculate lighting
    return geometry
  }, [])

  return (
    <group {...props}>
      {/* Main garden terrain */}
      <mesh 
        geometry={gardenGeometry}
        position={[0, -1.2, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          color="#8fbc8f"        // Sage green - peaceful and natural
          roughness={0.8}        // Natural earth texture
          metalness={0.1}        // Slight mineral content
          wireframe={false}
        />
      </mesh>
      
      {/* Soft moss patches - add texture variation */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh 
          key={i}
          position={[
            (Math.random() - 0.5) * 25, // Random X position
            -1.0 + Math.random() * 0.2,  // Slightly above terrain
            (Math.random() - 0.5) * 25   // Random Z position
          ]}
          rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}
          scale={[
            0.5 + Math.random() * 1.5,   // Random width
            0.5 + Math.random() * 1.5,   // Random depth
            1
          ]}
        >
          <circleGeometry args={[1, 16]} />
          <meshStandardMaterial
            color="#7fb069"      // Slightly different green for moss
            transparent={true}
            opacity={0.6}
            roughness={0.9}
          />
        </mesh>
      ))}
      
      {/* Small wildflower patches - add color dots */}
      {Array.from({ length: 15 }, (_, i) => (
        <mesh 
          key={`flower-${i}`}
          position={[
            (Math.random() - 0.5) * 20,
            -0.9 + Math.random() * 0.3,
            (Math.random() - 0.5) * 20
          ]}
        >
          <sphereGeometry args={[0.02, 8, 6]} />
          <meshBasicMaterial
            color={[
              "#ffb3ba", "#bae1ff", "#ffffba", 
              "#baffc9", "#ffdfba", "#e0baff"
            ][Math.floor(Math.random() * 6)]} // Random pastel colors
            emissive={[
              "#ffb3ba", "#bae1ff", "#ffffba", 
              "#baffc9", "#ffdfba", "#e0baff"
            ][Math.floor(Math.random() * 6)]}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  )
}
