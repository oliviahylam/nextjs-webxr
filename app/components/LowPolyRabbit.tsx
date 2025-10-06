// Low-Poly Rabbit Component - Stylized rabbit sculptures with ceramic surface
// Meditative poses with gentle idle animations for the zen garden

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Create low-poly rabbit geometry
function createLowPolyRabbitGeometry() {
  const geometry = new THREE.BufferGeometry()
  
  // Define vertices for a stylized, low-poly rabbit in sitting meditation pose
  const vertices = new Float32Array([
    // Body (sitting position) - octagonal prism
    -0.3, 0.0, -0.2,   0.3, 0.0, -0.2,   0.4, 0.2, 0.0,   // Bottom triangle 1
    -0.3, 0.0, -0.2,   0.4, 0.2, 0.0,   -0.4, 0.2, 0.0,   // Bottom triangle 2
    -0.4, 0.2, 0.0,   0.4, 0.2, 0.0,   0.3, 0.4, 0.2,    // Mid triangle 1
    -0.4, 0.2, 0.0,   0.3, 0.4, 0.2,   -0.3, 0.4, 0.2,   // Mid triangle 2
    -0.3, 0.4, 0.2,   0.3, 0.4, 0.2,   0.2, 0.6, 0.1,    // Upper triangle 1
    -0.3, 0.4, 0.2,   0.2, 0.6, 0.1,   -0.2, 0.6, 0.1,   // Upper triangle 2
    
    // Head - simplified sphere
    -0.15, 0.6, 0.1,   0.15, 0.6, 0.1,   0.0, 0.8, 0.25,  // Front face
    -0.15, 0.6, 0.1,   0.0, 0.8, 0.25,   0.0, 0.8, -0.05, // Left side
    0.15, 0.6, 0.1,    0.0, 0.8, -0.05,  0.0, 0.8, 0.25,  // Right side
    -0.15, 0.6, 0.1,   0.0, 0.8, -0.05,  0.15, 0.6, 0.1,  // Back face
    
    // Left ear
    -0.08, 0.8, 0.1,   -0.12, 1.0, 0.15,  -0.04, 1.0, 0.15, // Ear triangle 1
    -0.08, 0.8, 0.1,   -0.04, 1.0, 0.15,  -0.06, 0.85, 0.05, // Ear triangle 2
    
    // Right ear  
    0.08, 0.8, 0.1,    0.04, 1.0, 0.15,   0.12, 1.0, 0.15,  // Ear triangle 1
    0.08, 0.8, 0.1,    0.06, 0.85, 0.05,  0.04, 1.0, 0.15,  // Ear triangle 2
    
    // Front paws (folded in meditation)
    -0.15, 0.1, 0.3,   -0.05, 0.1, 0.35,  -0.1, 0.25, 0.3,  // Left paw
    0.15, 0.1, 0.3,    0.1, 0.25, 0.3,    0.05, 0.1, 0.35,  // Right paw
    
    // Tail (small, tucked)
    0.0, 0.15, -0.25,  0.05, 0.2, -0.3,   -0.05, 0.2, -0.3, // Tail triangle
  ])
  
  // Calculate normals for proper lighting
  const normals = new Float32Array(vertices.length)
  for (let i = 0; i < vertices.length; i += 9) {
    // Get three vertices of triangle
    const v1 = new THREE.Vector3(vertices[i], vertices[i+1], vertices[i+2])
    const v2 = new THREE.Vector3(vertices[i+3], vertices[i+4], vertices[i+5])
    const v3 = new THREE.Vector3(vertices[i+6], vertices[i+7], vertices[i+8])
    
    // Calculate normal
    const normal = new THREE.Vector3()
    const edge1 = v2.clone().sub(v1)
    const edge2 = v3.clone().sub(v1)
    normal.crossVectors(edge1, edge2).normalize()
    
    // Apply normal to all three vertices
    for (let j = 0; j < 3; j++) {
      normals[i + j*3] = normal.x
      normals[i + j*3 + 1] = normal.y
      normals[i + j*3 + 2] = normal.z
    }
  }
  
  // Create UV coordinates for texture mapping
  const uvs = new Float32Array(vertices.length / 3 * 2)
  for (let i = 0; i < uvs.length; i += 2) {
    uvs[i] = (vertices[i/2*3] + 0.5) // Map X to U
    uvs[i+1] = (vertices[i/2*3 + 1]) // Map Y to V
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  
  return geometry
}

// Ceramic/Sandstone shader material
const ceramicVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vUv = uv;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const ceramicFragmentShader = `
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uAccentColor;
  uniform float uRoughness;
  uniform float uMetalness;
  uniform vec3 uLightDirection;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(uLightDirection);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 halfDir = normalize(lightDir + viewDir);
    
    // Diffuse lighting
    float lightDot = max(dot(normal, lightDir), 0.0);
    
    // Specular reflection (ceramic shine)
    float specular = pow(max(dot(normal, halfDir), 0.0), 32.0) * (1.0 - uRoughness);
    
    // Fresnel effect for ceramic surface
    float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 2.0);
    
    // Subtle surface variation
    float surfaceNoise = sin(vUv.x * 20.0) * cos(vUv.y * 15.0) * 0.02;
    
    // Combine colors
    vec3 baseColor = mix(uBaseColor, uAccentColor, fresnel * 0.3 + surfaceNoise);
    vec3 finalColor = baseColor * (lightDot * 0.8 + 0.2); // Soft lighting
    finalColor += vec3(1.0, 0.95, 0.9) * specular * 0.3; // Ceramic shine
    
    // Add subtle ambient reflection
    finalColor += baseColor * 0.1;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`

// Ceramic shader material component
function CeramicMaterial() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!)
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uBaseColor: { value: new THREE.Color(0.9, 0.85, 0.75) },    // Warm sandstone
    uAccentColor: { value: new THREE.Color(0.95, 0.9, 0.8) },   // Lighter ceramic
    uRoughness: { value: 0.3 },                                 // Smooth ceramic
    uMetalness: { value: 0.1 },                                 // Slight reflection
    uLightDirection: { value: new THREE.Vector3(1, 1, 0.5) }
  }), [])
  
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
  })
  
  return (
    <shaderMaterial
      ref={materialRef}
      uniforms={uniforms}
      vertexShader={ceramicVertexShader}
      fragmentShader={ceramicFragmentShader}
    />
  )
}

// Individual rabbit sculpture with animations
function LowPolyRabbit({ 
  position, 
  rotation = [0, 0, 0],
  scale = 1,
  animationOffset = 0 
}: { 
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  animationOffset?: number
}) {
  const rabbitRef = useRef<THREE.Group>(null!)
  const leftEarRef = useRef<THREE.Group>(null!)
  const rightEarRef = useRef<THREE.Group>(null!)
  
  // Create the low-poly geometry
  const rabbitGeometry = useMemo(() => createLowPolyRabbitGeometry(), [])
  
  // Gentle idle animations
  useFrame(({ clock }) => {
    if (rabbitRef.current) {
      const time = clock.getElapsedTime() + animationOffset
      
      // Gentle breathing animation
      const breathe = 1 + Math.sin(time * 0.8) * 0.02
      rabbitRef.current.scale.setScalar(scale * breathe)
      
      // Subtle body sway
      rabbitRef.current.rotation.z = Math.sin(time * 0.3) * 0.01
    }
    
    // Ear movements
    if (leftEarRef.current && rightEarRef.current) {
      const time = clock.getElapsedTime() + animationOffset
      
      // Occasional ear twitches
      const earTwitch = Math.sin(time * 2.1) > 0.95 ? Math.sin(time * 20) * 0.1 : 0
      leftEarRef.current.rotation.z = earTwitch
      rightEarRef.current.rotation.z = -earTwitch * 0.8
      
      // Gentle ear sway
      leftEarRef.current.rotation.x = Math.sin(time * 0.4) * 0.05
      rightEarRef.current.rotation.x = Math.cos(time * 0.35) * 0.05
    }
  })
  
  return (
    <group ref={rabbitRef} position={position} rotation={rotation} scale={scale}>
      
      {/* Main rabbit body */}
      <mesh geometry={rabbitGeometry}>
        <CeramicMaterial />
      </mesh>
      
      {/* Animated ears (separate for individual animation) */}
      <group ref={leftEarRef} position={[-0.08, 0.8, 0.1]}>
        <mesh>
          <coneGeometry args={[0.04, 0.2, 6]} />
          <CeramicMaterial />
        </mesh>
      </group>
      
      <group ref={rightEarRef} position={[0.08, 0.8, 0.1]}>
        <mesh>
          <coneGeometry args={[0.04, 0.2, 6]} />
          <CeramicMaterial />
        </mesh>
      </group>
      
      {/* Simple eyes */}
      <mesh position={[-0.05, 0.75, 0.22]}>
        <sphereGeometry args={[0.015, 8, 6]} />
        <meshBasicMaterial color="#2f4f4f" />
      </mesh>
      
      <mesh position={[0.05, 0.75, 0.22]}>
        <sphereGeometry args={[0.015, 8, 6]} />
        <meshBasicMaterial color="#2f4f4f" />
      </mesh>
      
      {/* Small nose */}
      <mesh position={[0, 0.72, 0.24]}>
        <sphereGeometry args={[0.008, 6, 4]} />
        <meshBasicMaterial color="#8b7355" />
      </mesh>
      
      {/* Meditation base/cushion */}
      <mesh position={[0, -0.05, 0]} scale={[1.2, 0.1, 1.2]}>
        <cylinderGeometry args={[0.4, 0.45, 0.1, 12]} />
        <meshStandardMaterial
          color="#d2b48c"
          roughness={0.8}
        />
      </mesh>
      
    </group>
  )
}

// Main component with three positioned rabbits
export function MeditativeRabbits(props: React.ComponentProps<'group'>) {
  return (
    <group {...props}>
      
      {/* Rabbit 1: Facing the stream, contemplating the water */}
      <LowPolyRabbit 
        position={[2, 2, 1.5]} 
        rotation={[0, -0.3, 0]}
        scale={0.8}
        animationOffset={0}
      />
      
      {/* Rabbit 2: Facing toward the bonsai trees */}
      <LowPolyRabbit 
        position={[-3, 2, 2]} 
        rotation={[0, 1.2, 0]}
        scale={0.9}
        animationOffset={2.1}
      />
      
      {/* Rabbit 3: Facing the path, welcoming visitors */}
      <LowPolyRabbit 
        position={[1, 2, -2.5]} 
        rotation={[0, 2.8, 0]}
        scale={0.7}
        animationOffset={4.3}
      />
      
    </group>
  )
}
