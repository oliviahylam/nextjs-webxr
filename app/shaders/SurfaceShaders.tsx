// Surface Shaders - Moss and sand materials with normal maps and light response
// Advanced materials that respond to lighting direction with realistic depth

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Vertex shader for surface materials
const surfaceVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vTangent;
  varying vec3 vBitangent;
  
  attribute vec3 tangent;
  
  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    
    // Calculate tangent space for normal mapping
    vTangent = normalize(normalMatrix * tangent);
    vBitangent = cross(vNormal, vTangent);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Fragment shader for moss material
const mossFragmentShader = `
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uAccentColor;
  uniform vec3 uLightDirection;
  uniform float uRoughness;
  uniform float uNormalStrength;
  uniform float uDetailScale;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vTangent;
  varying vec3 vBitangent;
  
  // Procedural noise function for texture generation
  float noise(vec2 uv) {
    return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  // Generate procedural normal map for moss texture
  vec3 generateMossNormal(vec2 uv) {
    float scale = uDetailScale;
    vec2 scaledUv = uv * scale;
    
    // Create moss-like bumpy texture
    float n1 = noise(scaledUv);
    float n2 = noise(scaledUv * 2.0 + vec2(0.5));
    float n3 = noise(scaledUv * 4.0 + vec2(0.25));
    
    // Combine noise for moss detail
    float height = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
    
    // Calculate normal from height
    float offset = 0.01;
    float heightL = noise((scaledUv + vec2(-offset, 0.0)) * scale);
    float heightR = noise((scaledUv + vec2(offset, 0.0)) * scale);
    float heightU = noise((scaledUv + vec2(0.0, offset)) * scale);
    float heightD = noise((scaledUv + vec2(0.0, -offset)) * scale);
    
    vec3 normal = normalize(vec3(
      (heightL - heightR) * uNormalStrength,
      (heightD - heightU) * uNormalStrength,
      1.0
    ));
    
    return normal;
  }
  
  void main() {
    // Generate procedural normal map
    vec3 localNormal = generateMossNormal(vUv);
    
    // Transform normal to world space
    mat3 tbn = mat3(vTangent, vBitangent, vNormal);
    vec3 worldNormal = normalize(tbn * localNormal);
    
    // Calculate lighting
    vec3 lightDir = normalize(uLightDirection);
    float lightDot = max(dot(worldNormal, lightDir), 0.0);
    
    // Add ambient occlusion based on surface detail
    float ao = 1.0 - (localNormal.z - 0.5) * 0.3;
    
    // Create color variation for moss
    vec2 colorUv = vUv * uDetailScale * 0.5;
    float colorNoise = noise(colorUv) * 0.3 + noise(colorUv * 2.0) * 0.2;
    vec3 finalColor = mix(uBaseColor, uAccentColor, colorNoise);
    
    // Apply lighting and ambient occlusion
    finalColor *= lightDot * 0.8 + 0.2; // Soft lighting
    finalColor *= ao;
    
    // Add subtle subsurface scattering effect
    float subsurface = pow(max(dot(worldNormal, lightDir), 0.0), 0.5) * 0.2;
    finalColor += uAccentColor * subsurface;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`

// Fragment shader for sand material
const sandFragmentShader = `
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uAccentColor;
  uniform vec3 uLightDirection;
  uniform float uRoughness;
  uniform float uNormalStrength;
  uniform float uDetailScale;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vTangent;
  varying vec3 vBitangent;
  
  // Procedural noise function
  float noise(vec2 uv) {
    return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  // Generate procedural normal map for sand texture
  vec3 generateSandNormal(vec2 uv) {
    float scale = uDetailScale;
    vec2 scaledUv = uv * scale;
    
    // Create sand grain texture with multiple octaves
    float n1 = noise(scaledUv) * 0.4;
    float n2 = noise(scaledUv * 3.0) * 0.3;
    float n3 = noise(scaledUv * 8.0) * 0.2;
    float n4 = noise(scaledUv * 16.0) * 0.1;
    
    float height = n1 + n2 + n3 + n4;
    
    // Calculate normal from height variations
    float offset = 0.005;
    float heightL = noise((scaledUv + vec2(-offset, 0.0)));
    float heightR = noise((scaledUv + vec2(offset, 0.0)));
    float heightU = noise((scaledUv + vec2(0.0, offset)));
    float heightD = noise((scaledUv + vec2(0.0, -offset)));
    
    vec3 normal = normalize(vec3(
      (heightL - heightR) * uNormalStrength,
      (heightD - heightU) * uNormalStrength,
      1.0
    ));
    
    return normal;
  }
  
  void main() {
    // Generate procedural normal map
    vec3 localNormal = generateSandNormal(vUv);
    
    // Transform normal to world space
    mat3 tbn = mat3(vTangent, vBitangent, vNormal);
    vec3 worldNormal = normalize(tbn * localNormal);
    
    // Calculate lighting with enhanced specular for sand sparkle
    vec3 lightDir = normalize(uLightDirection);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 halfDir = normalize(lightDir + viewDir);
    
    float lightDot = max(dot(worldNormal, lightDir), 0.0);
    float specular = pow(max(dot(worldNormal, halfDir), 0.0), 32.0) * 0.1;
    
    // Create color variation for sand grains
    vec2 colorUv = vUv * uDetailScale;
    float colorNoise = noise(colorUv) * 0.2 + noise(colorUv * 4.0) * 0.1;
    vec3 finalColor = mix(uBaseColor, uAccentColor, colorNoise);
    
    // Apply lighting
    finalColor *= lightDot * 0.9 + 0.1; // Slightly brighter than moss
    finalColor += specular; // Add sand sparkle
    
    // Add warm ambient reflection
    float ambient = 0.3;
    finalColor += uBaseColor * ambient;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`

// Moss shader material
export function MossShaderMaterial() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!)
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uBaseColor: { value: new THREE.Color(0.2, 0.4, 0.2) },      // Deep moss green
    uAccentColor: { value: new THREE.Color(0.4, 0.6, 0.3) },    // Lighter moss green
    uLightDirection: { value: new THREE.Vector3(1, 1, 0.5) },
    uRoughness: { value: 0.9 },
    uNormalStrength: { value: 1.5 },
    uDetailScale: { value: 20.0 }
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
      vertexShader={surfaceVertexShader}
      fragmentShader={mossFragmentShader}
    />
  )
}

// Sand shader material
export function SandShaderMaterial() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!)
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uBaseColor: { value: new THREE.Color(0.8, 0.7, 0.5) },      // Warm sand
    uAccentColor: { value: new THREE.Color(0.9, 0.8, 0.6) },    // Lighter sand
    uLightDirection: { value: new THREE.Vector3(1, 1, 0.5) },
    uRoughness: { value: 0.8 },
    uNormalStrength: { value: 0.8 },
    uDetailScale: { value: 50.0 }
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
      vertexShader={surfaceVertexShader}
      fragmentShader={sandFragmentShader}
    />
  )
}

// Enhanced surface components
export function StylizedMoss({ 
  geometry, 
  position = [0, 0, 0],
  ...props 
}: { 
  geometry: THREE.BufferGeometry
  position?: [number, number, number]
} & React.ComponentProps<'mesh'>) {
  
  return (
    <mesh geometry={geometry} position={position} {...props}>
      <MossShaderMaterial />
    </mesh>
  )
}

export function StylizedSand({ 
  geometry, 
  position = [0, 0, 0],
  ...props 
}: { 
  geometry: THREE.BufferGeometry
  position?: [number, number, number]
} & React.ComponentProps<'mesh'>) {
  
  return (
    <mesh geometry={geometry} position={position} {...props}>
      <SandShaderMaterial />
    </mesh>
  )
}
