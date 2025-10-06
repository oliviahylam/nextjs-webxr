// Stone Paths Component - Creates softly curved pathways through the zen garden
// Organic stone paths that wind naturally around the flowing stream
// Enhanced with custom sand shader for realistic texture and lighting response

import React, { useMemo } from 'react'
import * as THREE from 'three'
import { StylizedSand } from '../shaders/SurfaceShaders'

export function StonePaths(props: React.ComponentProps<'group'>) {
  
  // Create curved path geometry using spline curves
  const pathGeometry = useMemo(() => {
    const points = []
    
    // Create a spiral path around the island
    for (let i = 0; i <= 100; i++) {
      const t = i / 100
      const angle = t * Math.PI * 4 // Two full spirals
      const radius = 15 - t * 8     // Spiral inward
      
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = Math.sin(t * Math.PI * 2) * 0.2 // Gentle undulation
      
      points.push(new THREE.Vector3(x, y, z))
    }
    
    // Create spline curve from points
    const curve = new THREE.CatmullRomCurve3(points)
    const tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.8, 8, false)
    
    return tubeGeometry
  }, [])
  
  // Create stepping stones
  const steppingStones = useMemo(() => {
    const stones = []
    
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 5 + Math.random() * 12
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      
      stones.push({
        position: [x, 2.2, z] as [number, number, number],
        scale: 0.3 + Math.random() * 0.4,
        rotation: Math.random() * Math.PI
      })
    }
    
    return stones
  }, [])

  return (
    <group {...props}>
      
      {/* Main curved pathway */}
      <mesh geometry={pathGeometry} position={[0, 2, 0]}>
        <meshStandardMaterial
          color="#f0e6d2"        // Beige stone color
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>
      
      {/* Secondary curved path */}
      <mesh 
        geometry={pathGeometry} 
        position={[0, 2.1, 0]}
        rotation={[0, Math.PI / 3, 0]}
        scale={[0.7, 1, 0.7]}
      >
        <meshStandardMaterial
          color="#daa520"        // Goldenrod stone
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      
      {/* Individual stepping stones */}
      {steppingStones.map((stone, i) => (
        <mesh
          key={`stone-${i}`}
          position={stone.position}
          rotation={[0, stone.rotation, 0]}
          scale={[stone.scale, 0.2, stone.scale]}
        >
          <cylinderGeometry args={[1, 1, 1, 8]} />
          <meshStandardMaterial
            color="#e8dcc6"      // Light beige stone
            roughness={0.9}
            metalness={0.05}
          />
        </mesh>
      ))}
      
      {/* Decorative pebbles along paths */}
      {Array.from({ length: 50 }, (_, i) => {
        const angle = Math.random() * Math.PI * 2
        const radius = 3 + Math.random() * 15
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <mesh
            key={`pebble-${i}`}
            position={[x, 2.1, z]}
            scale={[0.05 + Math.random() * 0.1, 0.05, 0.05 + Math.random() * 0.1]}
            rotation={[0, Math.random() * Math.PI, 0]}
          >
            <sphereGeometry args={[1, 6, 4]} />
            <meshStandardMaterial
              color="#d4c4b0"      // Beige pebbles
              roughness={0.95}
            />
          </mesh>
        )
      })}
      
      {/* Zen rake patterns in sand areas with custom shader */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 10 + Math.sin(i) * 3
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const rakeGeometry = new THREE.BoxGeometry(3, 0.02, 0.1)
        
        return (
          <StylizedSand
            key={`rake-${i}`}
            geometry={rakeGeometry}
            position={[x, 2.05, z]}
            rotation={[-Math.PI / 2, angle, 0]}
          />
        )
      })}
      
    </group>
  )
}
