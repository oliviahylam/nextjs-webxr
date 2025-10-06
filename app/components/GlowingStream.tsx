// Glowing Stream Component - Creates a flowing stream with gentle luminescence
// Central water feature that glows softly and reflects ambient light
// Now enhanced with custom water shader for stylized appearance

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { StylizedWater } from '../shaders/WaterShader'

export function GlowingStream(props: React.ComponentProps<'group'>) {
  const streamRef = useRef<THREE.Group>(null!)
  const waterMaterialRef = useRef<THREE.MeshStandardMaterial>(null!)
  
  // Create meandering stream path
  const streamGeometry = useMemo(() => {
    const points = []
    
    // Create S-curve through the center of the island
    for (let i = 0; i <= 50; i++) {
      const t = i / 50
      const x = (t - 0.5) * 20 // Span across island
      const z = Math.sin(t * Math.PI * 2) * 8 // S-curve pattern
      const y = Math.sin(t * Math.PI * 4) * 0.1 // Gentle height variation
      
      points.push(new THREE.Vector3(x, y, z))
    }
    
    const curve = new THREE.CatmullRomCurve3(points)
    const geometry = new THREE.TubeGeometry(curve, 50, 1.5, 8, false)
    
    return geometry
  }, [])
  
  // Create stream bed geometry (slightly wider and lower)
  const streamBedGeometry = useMemo(() => {
    const points = []
    
    for (let i = 0; i <= 50; i++) {
      const t = i / 50
      const x = (t - 0.5) * 20
      const z = Math.sin(t * Math.PI * 2) * 8
      const y = Math.sin(t * Math.PI * 4) * 0.1 - 0.2 // Lower than water surface
      
      points.push(new THREE.Vector3(x, y, z))
    }
    
    const curve = new THREE.CatmullRomCurve3(points)
    const geometry = new THREE.TubeGeometry(curve, 50, 2, 8, false)
    
    return geometry
  }, [])

  // Animate the water flow and glow
  useFrame(({ clock }) => {
    if (waterMaterialRef.current) {
      const time = clock.getElapsedTime()
      
      // Animate water color for flowing effect
      const flowPhase = Math.sin(time * 0.5) * 0.1 + 0.9
      waterMaterialRef.current.color.setRGB(
        0.3 * flowPhase,  // Blue component
        0.6 * flowPhase,  // Green component  
        0.9 * flowPhase   // Blue component
      )
      
      // Animate emissive glow
      const glowIntensity = 0.1 + Math.sin(time * 0.8) * 0.05
      waterMaterialRef.current.emissiveIntensity = glowIntensity
      
      // Subtle opacity variation
      waterMaterialRef.current.opacity = 0.8 + Math.sin(time * 0.3) * 0.1
    }
  })

  return (
    <group ref={streamRef} {...props}>
      
      {/* Stream bed - darker stone */}
      <mesh geometry={streamBedGeometry} position={[0, 1.8, 0]}>
        <meshStandardMaterial
          color="#4a4a4a"        // Dark gray stone
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Main water surface with custom shader */}
      <StylizedWater 
        geometry={streamGeometry} 
        position={[0, 2, 0]}
      />
      
      {/* Floating lily pads */}
      {Array.from({ length: 8 }, (_, i) => {
        const t = (i + 1) / 9 // Position along stream
        const x = (t - 0.5) * 18
        const z = Math.sin(t * Math.PI * 2) * 7
        const y = 2.1 // Just above water surface
        
        return (
          <mesh
            key={`lily-${i}`}
            position={[x, y, z]}
            rotation={[-Math.PI / 2, Math.random() * Math.PI, 0]}
            scale={[0.3 + Math.random() * 0.2, 0.3 + Math.random() * 0.2, 1]}
          >
            <circleGeometry args={[1, 8]} />
            <meshStandardMaterial
              color="#228b22"      // Forest green
              roughness={0.8}
              transparent={true}
              opacity={0.9}
            />
          </mesh>
        )
      })}
      
      {/* Small lotus flowers */}
      {Array.from({ length: 4 }, (_, i) => {
        const t = (i * 2 + 1) / 8
        const x = (t - 0.5) * 16
        const z = Math.sin(t * Math.PI * 2) * 6
        const y = 2.15
        
        return (
          <mesh
            key={`lotus-${i}`}
            position={[x, y, z]}
            scale={[0.1, 0.1, 0.1]}
          >
            <sphereGeometry args={[1, 8, 6]} />
            <meshBasicMaterial
              color="#ffb6c1"      // Light pink
              emissive="#ffb6c1"
              emissiveIntensity={0.2}
            />
          </mesh>
        )
      })}
      
      {/* Gentle mist particles above water */}
      {Array.from({ length: 15 }, (_, i) => {
        const t = Math.random()
        const x = (t - 0.5) * 18 + (Math.random() - 0.5) * 4
        const z = Math.sin(t * Math.PI * 2) * 7 + (Math.random() - 0.5) * 2
        const y = 2.3 + Math.random() * 0.5
        
        return (
          <mesh
            key={`mist-${i}`}
            position={[x, y, z]}
            scale={[0.05, 0.05, 0.05]}
          >
            <sphereGeometry args={[1, 6, 4]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent={true}
              opacity={0.2 + Math.random() * 0.2}
            />
          </mesh>
        )
      })}
      
      {/* Underwater glow effect */}
      <mesh geometry={streamGeometry} position={[0, 1.9, 0]} scale={[1.2, 1, 1.2]}>
        <meshBasicMaterial
          color="#87ceeb"
          transparent={true}
          opacity={0.1}
        />
      </mesh>
      
      {/* Stream source - small spring */}
      <mesh position={[-10, 2.1, 0]}>
        <sphereGeometry args={[0.5, 16, 12]} />
        <meshStandardMaterial
          color="#4682b4"
          transparent={true}
          opacity={0.6}
          emissive="#87ceeb"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Stream end - small pool */}
      <mesh position={[10, 2, 0]}>
        <cylinderGeometry args={[2, 2, 0.2, 16]} />
        <meshStandardMaterial
          color="#4682b4"
          transparent={true}
          opacity={0.7}
          emissive="#87ceeb"
          emissiveIntensity={0.15}
        />
      </mesh>
      
    </group>
  )
}
