// Zen Rocks Component - Creates smooth, curved rock formations
// These rocks have organic shapes and soft colors inspired by Japanese gardens

import React, { useMemo } from 'react'
import * as THREE from 'three'

// Individual zen rock with custom organic shape
function ZenRock({ 
  position, 
  scale = 1, 
  color = "#c8b5a0" 
}: { 
  position: [number, number, number]
  scale?: number
  color?: string 
}) {
  // Create organic rock geometry using noise
  const rockGeometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(1, 16, 12)
    const vertices = geometry.attributes.position.array
    
    // Add organic deformation to make each rock unique
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i]
      const y = vertices[i + 1]
      const z = vertices[i + 2]
      
      // Create natural rock-like bumps and variations
      const noise = 
        Math.sin(x * 2) * 0.1 + 
        Math.cos(y * 3) * 0.05 + 
        Math.sin(z * 1.5) * 0.08
      
      // Apply the noise to create organic shapes
      vertices[i] *= (1 + noise)
      vertices[i + 1] *= (1 + noise * 0.7) // Less variation on Y for stability
      vertices[i + 2] *= (1 + noise)
    }
    
    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals() // Recalculate lighting normals
    return geometry
  }, [])

  return (
    <mesh 
      geometry={rockGeometry} 
      position={position} 
      scale={scale}
      // Make rocks interactive in XR - they can be moved around the garden
      userData={{ interactable: true }}
    >
      <meshStandardMaterial
        color={color}
        roughness={0.7}        // Natural stone texture
        metalness={0.1}        // Slight mineral shimmer
        bumpScale={0.02}       // Subtle surface detail
      />
    </mesh>
  )
}

// Collection of zen rocks arranged naturally
export function ZenRocks(props: React.ComponentProps<'group'>) {
  return (
    <group {...props}>
      {/* Large central meditation rock */}
      <ZenRock 
        position={[3, -0.5, -2]} 
        scale={1.5} 
        color="#d4c4b0" // Warm sandstone
      />
      
      {/* Medium river stones */}
      <ZenRock 
        position={[-2, -0.7, 1]} 
        scale={0.8} 
        color="#b8a693" // Cooler stone
      />
      
      <ZenRock 
        position={[5, -0.6, 3]} 
        scale={1.2} 
        color="#c0ad95" // Neutral tone
      />
      
      {/* Small accent stones */}
      <ZenRock 
        position={[-4, -0.8, -1]} 
        scale={0.5} 
        color="#ddd5c7" // Light limestone
      />
      
      <ZenRock 
        position={[1, -0.75, 4]} 
        scale={0.6} 
        color="#a99688" // Darker granite
      />
      
      <ZenRock 
        position={[-1, -0.7, -3]} 
        scale={0.7} 
        color="#cbbfa8" // Medium tone
      />
      
      {/* Stepping stones across the river */}
      <ZenRock 
        position={[0, -0.5, 0]} 
        scale={0.4} 
        color="#b5a394" // River stone
      />
      
      <ZenRock 
        position={[2, -0.5, 0.5]} 
        scale={0.35} 
        color="#c4b8a8" // River stone
      />
      
      <ZenRock 
        position={[-2, -0.5, -0.3]} 
        scale={0.4} 
        color="#ada087" // River stone
      />
    </group>
  )
}
