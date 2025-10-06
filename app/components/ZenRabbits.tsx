// Zen Rabbits Component - Creates peaceful rabbit sculptures for the garden
// Serene stone rabbits positioned thoughtfully near water features

import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Individual Rabbit Sculpture
function RabbitSculpture({ 
  position, 
  scale = 1,
  pose = 'sitting' 
}: { 
  position: [number, number, number]
  scale?: number
  pose?: 'sitting' | 'drinking' | 'alert'
}) {
  const rabbitRef = useRef<THREE.Group>(null!)
  
  // Very subtle breathing animation
  useFrame(({ clock }) => {
    if (rabbitRef.current) {
      const time = clock.getElapsedTime()
      const breathe = 1 + Math.sin(time * 0.8) * 0.02
      rabbitRef.current.scale.setScalar(scale * breathe)
    }
  })

  // Adjust pose based on type
  const poseRotation = pose === 'drinking' ? [-Math.PI / 6, 0, 0] :
                      pose === 'alert' ? [0, 0, 0] :
                      [0, 0, 0] // sitting default

  return (
    <group ref={rabbitRef} position={position} scale={scale}>
      
      {/* Rabbit body */}
      <mesh position={[0, 0.3, 0]} rotation={poseRotation}>
        <sphereGeometry args={[0.4, 12, 8]} />
        <meshStandardMaterial
          color="#f5f5dc"        // Beige stone color
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Rabbit head */}
      <mesh 
        position={pose === 'drinking' ? [0, 0.5, 0.3] : [0, 0.7, 0]} 
        rotation={poseRotation}
        scale={[0.8, 0.9, 0.8]}
      >
        <sphereGeometry args={[0.25, 12, 8]} />
        <meshStandardMaterial
          color="#f5f5dc"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Rabbit ears */}
      <mesh 
        position={pose === 'alert' ? [-0.1, 0.95, -0.05] : [-0.1, 0.85, -0.05]}
        rotation={pose === 'alert' ? [0, 0, -0.2] : [0.3, 0, -0.2]}
        scale={[0.08, 0.3, 0.12]}
      >
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial
          color="#f5f5dc"
          roughness={0.8}
        />
      </mesh>
      
      <mesh 
        position={pose === 'alert' ? [0.1, 0.95, -0.05] : [0.1, 0.85, -0.05]}
        rotation={pose === 'alert' ? [0, 0, 0.2] : [0.3, 0, 0.2]}
        scale={[0.08, 0.3, 0.12]}
      >
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial
          color="#f5f5dc"
          roughness={0.8}
        />
      </mesh>
      
      {/* Rabbit tail */}
      <mesh position={[0, 0.25, -0.35]} scale={[0.12, 0.12, 0.08]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial
          color="#ffffff"        // White fluffy tail
          roughness={0.9}
        />
      </mesh>
      
      {/* Front paws */}
      <mesh position={[-0.15, 0.1, 0.2]} scale={[0.08, 0.15, 0.08]}>
        <sphereGeometry args={[1, 6, 4]} />
        <meshStandardMaterial
          color="#f5f5dc"
          roughness={0.8}
        />
      </mesh>
      
      <mesh position={[0.15, 0.1, 0.2]} scale={[0.08, 0.15, 0.08]}>
        <sphereGeometry args={[1, 6, 4]} />
        <meshStandardMaterial
          color="#f5f5dc"
          roughness={0.8}
        />
      </mesh>
      
      {/* Back paws (sitting position) */}
      {pose === 'sitting' && (
        <>
          <mesh position={[-0.2, 0.05, -0.1]} scale={[0.12, 0.08, 0.15]}>
            <sphereGeometry args={[1, 6, 4]} />
            <meshStandardMaterial
              color="#f5f5dc"
              roughness={0.8}
            />
          </mesh>
          
          <mesh position={[0.2, 0.05, -0.1]} scale={[0.12, 0.08, 0.15]}>
            <sphereGeometry args={[1, 6, 4]} />
            <meshStandardMaterial
              color="#f5f5dc"
              roughness={0.8}
            />
          </mesh>
        </>
      )}
      
      {/* Simple facial features */}
      {/* Eyes */}
      <mesh position={[-0.08, 0.75, 0.2]} scale={[0.03, 0.03, 0.02]}>
        <sphereGeometry args={[1, 6, 4]} />
        <meshBasicMaterial color="#2f4f4f" />
      </mesh>
      
      <mesh position={[0.08, 0.75, 0.2]} scale={[0.03, 0.03, 0.02]}>
        <sphereGeometry args={[1, 6, 4]} />
        <meshBasicMaterial color="#2f4f4f" />
      </mesh>
      
      {/* Nose */}
      <mesh position={[0, 0.7, 0.23]} scale={[0.02, 0.02, 0.02]}>
        <sphereGeometry args={[1, 6, 4]} />
        <meshBasicMaterial color="#696969" />
      </mesh>
      
      {/* Small stone base */}
      <mesh position={[0, -0.05, 0]} scale={[0.6, 0.1, 0.6]}>
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshStandardMaterial
          color="#d2b48c"
          roughness={0.9}
        />
      </mesh>
      
    </group>
  )
}

// Main component with multiple rabbit sculptures
export function ZenRabbits(props: React.ComponentProps<'group'>) {
  return (
    <group {...props}>
      
      {/* Rabbits near the central stream */}
      <RabbitSculpture 
        position={[2, 2, 1]} 
        scale={0.8} 
        pose="drinking" 
      />
      
      <RabbitSculpture 
        position={[-3, 2, 2]} 
        scale={0.9} 
        pose="sitting" 
      />
      
      <RabbitSculpture 
        position={[1, 2, -2]} 
        scale={0.7} 
        pose="alert" 
      />
      
      {/* Rabbits near bonsai trees */}
      <RabbitSculpture 
        position={[6, 2, 3]} 
        scale={0.6} 
        pose="sitting" 
      />
      
      <RabbitSculpture 
        position={[-8, 2, 6]} 
        scale={0.8} 
        pose="drinking" 
      />
      
      {/* Rabbits along the pathways */}
      <RabbitSculpture 
        position={[10, 2, -1]} 
        scale={0.7} 
        pose="alert" 
      />
      
      <RabbitSculpture 
        position={[-5, 2, -8]} 
        scale={0.9} 
        pose="sitting" 
      />
      
      <RabbitSculpture 
        position={[-12, 2, 4]} 
        scale={0.6} 
        pose="drinking" 
      />
      
      {/* Small rabbit family group */}
      <RabbitSculpture 
        position={[8, 2, 8]} 
        scale={0.9} 
        pose="sitting" 
      />
      
      <RabbitSculpture 
        position={[7.5, 2, 7]} 
        scale={0.5} 
        pose="alert" 
      />
      
      <RabbitSculpture 
        position={[8.5, 2, 7.2]} 
        scale={0.4} 
        pose="sitting" 
      />
      
    </group>
  )
}
