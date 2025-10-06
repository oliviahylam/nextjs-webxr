// Bonsai Trees Component - Creates detailed miniature trees for the zen garden
// Authentic Japanese bonsai with intricate branching and foliage

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Individual Bonsai Tree
function BonsaiTree({ 
  position, 
  scale = 1,
  style = 'pine' 
}: { 
  position: [number, number, number]
  scale?: number
  style?: 'pine' | 'maple' | 'cherry'
}) {
  const treeRef = useRef<THREE.Group>(null!)
  
  // Gentle swaying animation
  useFrame(({ clock }) => {
    if (treeRef.current) {
      const time = clock.getElapsedTime()
      treeRef.current.rotation.z = Math.sin(time * 0.5 + position[0]) * 0.02
    }
  })

  // Create branch structure
  const branches = useMemo(() => {
    const branchData = []
    
    // Main trunk
    branchData.push({
      position: [0, 0.5, 0] as [number, number, number],
      scale: [0.1, 1, 0.1] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      color: '#8b4513' // Saddle brown
    })
    
    // Primary branches
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2
      const height = 0.3 + i * 0.15
      const length = 0.4 - i * 0.05
      
      branchData.push({
        position: [
          Math.cos(angle) * 0.05,
          height,
          Math.sin(angle) * 0.05
        ] as [number, number, number],
        scale: [0.05, length, 0.05] as [number, number, number],
        rotation: [
          Math.PI / 6,
          angle,
          Math.PI / 8
        ] as [number, number, number],
        color: '#654321' // Dark brown
      })
      
      // Secondary branches
      for (let j = 0; j < 3; j++) {
        const subAngle = angle + (j - 1) * 0.3
        const subLength = length * 0.6
        
        branchData.push({
          position: [
            Math.cos(angle) * length * 0.7,
            height + 0.1,
            Math.sin(angle) * length * 0.7
          ] as [number, number, number],
          scale: [0.02, subLength, 0.02] as [number, number, number],
          rotation: [
            Math.PI / 4,
            subAngle,
            Math.PI / 6
          ] as [number, number, number],
          color: '#8b7355' // Light brown
        })
      }
    }
    
    return branchData
  }, [])

  // Foliage clusters based on tree style
  const foliage = useMemo(() => {
    const leaves = []
    const leafColor = style === 'cherry' ? '#ffb6c1' : 
                     style === 'maple' ? '#ff6347' : '#228b22'
    
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 0.2 + Math.random() * 0.3
      const height = 0.6 + Math.random() * 0.4
      
      leaves.push({
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ] as [number, number, number],
        scale: 0.1 + Math.random() * 0.1,
        color: leafColor
      })
    }
    
    return leaves
  }, [style])

  return (
    <group ref={treeRef} position={position} scale={scale}>
      
      {/* Decorative pot */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.3, 0.25, 0.2, 8]} />
        <meshStandardMaterial
          color="#8b4513"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Soil in pot */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.05, 8]} />
        <meshStandardMaterial
          color="#654321"
          roughness={1.0}
        />
      </mesh>
      
      {/* Branch structure */}
      {branches.map((branch, i) => (
        <mesh
          key={`branch-${i}`}
          position={branch.position}
          rotation={branch.rotation}
          scale={branch.scale}
        >
          <cylinderGeometry args={[1, 1, 1, 6]} />
          <meshStandardMaterial
            color={branch.color}
            roughness={0.9}
          />
        </mesh>
      ))}
      
      {/* Foliage clusters */}
      {foliage.map((leaf, i) => (
        <mesh
          key={`leaf-${i}`}
          position={leaf.position}
          scale={leaf.scale}
        >
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial
            color={leaf.color}
            roughness={0.8}
            transparent={true}
            opacity={0.9}
          />
        </mesh>
      ))}
      
      {/* Small decorative stones around base */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2
        const radius = 0.35
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <mesh
            key={`stone-${i}`}
            position={[x, 0.02, z]}
            scale={[0.03, 0.02, 0.03]}
          >
            <sphereGeometry args={[1, 6, 4]} />
            <meshStandardMaterial
              color="#696969"
              roughness={1.0}
            />
          </mesh>
        )
      })}
      
    </group>
  )
}

// Main component with multiple bonsai trees
export function BonsaiTrees(props: React.ComponentProps<'group'>) {
  return (
    <group {...props}>
      
      {/* Pine bonsai - traditional style */}
      <BonsaiTree 
        position={[8, 2, 5]} 
        scale={1.2} 
        style="pine" 
      />
      
      <BonsaiTree 
        position={[-6, 2, 8]} 
        scale={1.0} 
        style="pine" 
      />
      
      <BonsaiTree 
        position={[12, 2, -3]} 
        scale={0.9} 
        style="pine" 
      />
      
      {/* Maple bonsai - autumn colors */}
      <BonsaiTree 
        position={[-10, 2, -5]} 
        scale={1.1} 
        style="maple" 
      />
      
      <BonsaiTree 
        position={[3, 2, -12]} 
        scale={0.8} 
        style="maple" 
      />
      
      {/* Cherry bonsai - delicate pink blossoms */}
      <BonsaiTree 
        position={[-8, 2, 12]} 
        scale={1.3} 
        style="cherry" 
      />
      
      <BonsaiTree 
        position={[15, 2, 8]} 
        scale={1.0} 
        style="cherry" 
      />
      
      <BonsaiTree 
        position={[-12, 2, 2]} 
        scale={0.9} 
        style="cherry" 
      />
      
    </group>
  )
}
