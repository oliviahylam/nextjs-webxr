// Atmospheric Effects Component - Creates dust particles and light rays for the dome
// Adds floating dust motes and visible light beams streaming through the skylight

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function AtmosphericEffects(props: React.ComponentProps<'group'>) {
  const dustRef = useRef<THREE.Points>(null!)
  const lightRaysRef = useRef<THREE.Group>(null!)
  
  // Create floating dust particles
  const dustGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(200 * 3) // 200 dust particles
    const velocities = new Float32Array(200 * 3) // Movement speeds
    
    for (let i = 0; i < 200; i++) {
      // Distribute particles throughout the dome space
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 80     // X position
      positions[i3 + 1] = Math.random() * 40 + 5     // Y position (above ground)
      positions[i3 + 2] = (Math.random() - 0.5) * 80 // Z position
      
      // Random slow movement
      velocities[i3] = (Math.random() - 0.5) * 0.02     // X velocity
      velocities[i3 + 1] = Math.random() * 0.01 + 0.005 // Y velocity (slight upward drift)
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02 // Z velocity
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
    
    return geometry
  }, [])
  
  // Create dust particle material
  const dustMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: '#f5f0e8',
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      vertexColors: false,
    })
  }, [])
  
  // Create light ray geometries
  const lightRays = useMemo(() => {
    const rays = []
    
    // Create 8 light rays streaming down from skylight
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const radius = 5 + Math.random() * 8
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      
      // Create a cone geometry for each light ray
      const rayGeometry = new THREE.ConeGeometry(
        0.5 + Math.random() * 0.3, // Top radius (narrow)
        35,                         // Height (from skylight to ground)
        8,                          // Radial segments
        1,                          // Height segments
        true                        // Open ended
      )
      
      rays.push({
        geometry: rayGeometry,
        position: [x, 25, z] as [number, number, number],
        rotation: [0, angle, 0] as [number, number, number],
        opacity: 0.1 + Math.random() * 0.05
      })
    }
    
    return rays
  }, [])
  
  // Animate dust particles
  useFrame((state, delta) => {
    if (dustRef.current) {
      const positions = dustRef.current.geometry.attributes.position.array as Float32Array
      const velocities = dustRef.current.geometry.attributes.velocity.array as Float32Array
      
      for (let i = 0; i < positions.length; i += 3) {
        // Update positions based on velocities
        positions[i] += velocities[i]
        positions[i + 1] += velocities[i + 1]
        positions[i + 2] += velocities[i + 2]
        
        // Reset particles that float too high or drift too far
        if (positions[i + 1] > 45) {
          positions[i + 1] = 5
        }
        if (Math.abs(positions[i]) > 40) {
          positions[i] = (Math.random() - 0.5) * 80
        }
        if (Math.abs(positions[i + 2]) > 40) {
          positions[i + 2] = (Math.random() - 0.5) * 80
        }
      }
      
      dustRef.current.geometry.attributes.position.needsUpdate = true
    }
    
    // Gently rotate light rays for subtle movement
    if (lightRaysRef.current) {
      lightRaysRef.current.rotation.y += delta * 0.02
    }
  })
  
  return (
    <group {...props}>
      
      {/* Floating dust particles */}
      <points
        ref={dustRef}
        geometry={dustGeometry}
        material={dustMaterial}
      />
      
      {/* Visible light rays streaming through skylight */}
      <group ref={lightRaysRef}>
        {lightRays.map((ray, i) => (
          <mesh
            key={`light-ray-${i}`}
            geometry={ray.geometry}
            position={ray.position}
            rotation={ray.rotation}
          >
            <meshBasicMaterial
              color="#fff8e1"
              transparent={true}
              opacity={ray.opacity}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
      
      {/* Additional atmospheric glow around skylight opening */}
      <mesh position={[0, 35, 0]} scale={[15, 1, 15]}>
        <cylinderGeometry args={[1, 1, 0.1, 32]} />
        <meshBasicMaterial
          color="#fff9e6"
          transparent={true}
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
    </group>
  )
}
