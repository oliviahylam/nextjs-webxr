// Zen Dome Component - Creates a dome structure with an open ceiling skylight
// This component creates an immersive dome environment for the zen garden

import React, { useMemo } from 'react'
import * as THREE from 'three'

export function ZenDome(props: React.ComponentProps<'group'>) {
  
  // Create monumental dome geometry with large skylight opening
  const domeGeometry = useMemo(() => {
    // Create a massive sphere and remove the top portion for skylight
    const geometry = new THREE.SphereGeometry(
      50,    // radius - monumental scale to fully surround the garden
      64,    // widthSegments - very smooth curves for architectural quality
      32,    // heightSegments - detailed geometry
      0,     // phiStart - start angle
      Math.PI * 2, // phiLength - full circle
      0,     // thetaStart - start from top
      Math.PI * 0.75 // thetaLength - 75% down (creates large skylight opening)
    )
    
    // Flip normals to face inward (we're inside the dome)
    geometry.scale(-1, 1, 1)
    
    return geometry
  }, [])
  
  // Create architectural dome material with subtle reflectivity
  const domeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#f2ebe0',        // Light stone/concrete color
      roughness: 0.7,          // Slightly reflective like polished concrete
      metalness: 0.05,         // Very subtle metallic quality
      transparent: false,      // Solid material for architectural feel
      side: THREE.DoubleSide,  // Render both sides
      envMapIntensity: 0.3,    // Subtle environmental reflections
    })
  }, [])
  
  // Decorative arches - currently unused but kept for future enhancement
  // const archGeometry = useMemo(() => {
  //   const arches = new THREE.Group()
  //   
  //   // Create 8 arches around the dome perimeter
  //   for (let i = 0; i < 8; i++) {
  //     const angle = (i / 8) * Math.PI * 2
  //     
  //     // Arch geometry - torus section
  //     const archGeo = new THREE.TorusGeometry(
  //       2.5,   // radius
  //       0.3,   // tube thickness
  //       8,     // radialSegments
  //       16,    // tubularSegments
  //       Math.PI // arc - half circle for arch shape
  //     )
  //     
  //     // Position arch around dome perimeter
  //     const x = Math.cos(angle) * 12
  //     const z = Math.sin(angle) * 12
  //     
  //     archGeo.translate(x, 3, z)
  //     archGeo.rotateY(angle + Math.PI / 2) // Face inward
  //     
  //     arches.add(new THREE.Mesh(archGeo))
  //   }
  //   
  //   return arches
  // }, [])
  
  // Create monumental architectural columns
  const createColumns = useMemo(() => {
    const columns = []
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const x = Math.cos(angle) * 35  // Positioned near dome edge
      const z = Math.sin(angle) * 35
      
      columns.push(
        <mesh
          key={`column-${i}`}
          position={[x, 15, z]}  // Taller columns for monumental scale
        >
          <cylinderGeometry args={[1.2, 1.5, 30, 16]} />  {/* Larger, more detailed columns */}
          <meshStandardMaterial
            color="#ede3d3"      // Light stone columns
            roughness={0.8}
            metalness={0.02}
          />
        </mesh>
      )
    }
    
    return columns
  }, [])
  
  return (
    <group {...props}>
      
      {/* Main dome structure */}
      <mesh 
        geometry={domeGeometry}
        material={domeMaterial}
        position={[0, 0, 0]}
      />
      
      {/* Decorative columns around the perimeter */}
      {createColumns}
      
      {/* Decorative arches (commented out for now - can be added later) */}
      {/* 
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const x = Math.cos(angle) * 12
        const z = Math.sin(angle) * 12
        
        return (
          <mesh
            key={`arch-${i}`}
            position={[x, 3, z]}
            rotation={[0, angle + Math.PI / 2, 0]}
          >
            <torusGeometry args={[2.5, 0.3, 8, 16, Math.PI]} />
            <meshStandardMaterial
              color="#e8e0d6"
              roughness={0.8}
              metalness={0.0}
            />
          </mesh>
        )
      })}
      */}
      
      {/* Monumental dome base - circular floor */}
      <mesh
        position={[0, 0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[40, 48, 128]} />  {/* Much larger floor ring */}
        <meshStandardMaterial
          color="#ebe1d6"      // Light stone floor
          roughness={0.8}
          metalness={0.02}
        />
      </mesh>
      
      {/* Dramatic skylight lighting system */}
      
      {/* Ambient light from skylight opening */}
      <hemisphereLight
        skyColor="#fff9e6"     // Bright warm sky light
        groundColor="#f2ebe0"  // Reflected light from dome walls
        intensity={0.6}
        position={[0, 40, 0]}
      />
      
      {/* Main sunlight beam through skylight - perfectly centered */}
      <directionalLight
        color="#fff8e1"
        intensity={1.2}
        position={[0, 45, 0]}    // Directly above through skylight opening
        target-position={[0, 0, 0]}  // Aimed at center of floating disk
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={100}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-bias={-0.0001}
      />
      
      {/* Secondary angled sunlight for depth and atmosphere */}
      <directionalLight
        color="#ffefd6"
        intensity={0.4}
        position={[8, 35, 5]}    // Angled through skylight
        castShadow={false}       // No shadows for this fill light
      />
      
      {/* Soft fill light to prevent harsh shadows */}
      <pointLight
        color="#f5f0e8"
        intensity={0.3}
        position={[0, 25, 0]}
        distance={80}
        decay={2}
      />
      
    </group>
  )
}
