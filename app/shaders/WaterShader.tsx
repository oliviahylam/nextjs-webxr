// Water Shader Component - Stylized water with glow and meditative ripples
// Custom shader material for the zen garden's glowing stream

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Vertex shader for water surface animation
const waterVertexShader = `
  uniform float uTime;
  uniform float uRippleSpeed;
  uniform float uRippleStrength;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normal;
    
    // Create gentle ripples with multiple wave frequencies
    vec3 pos = position;
    
    // Primary slow ripples - meditative pace
    float wave1 = sin(pos.x * 0.5 + uTime * uRippleSpeed) * uRippleStrength;
    float wave2 = cos(pos.z * 0.3 + uTime * uRippleSpeed * 0.7) * uRippleStrength * 0.8;
    
    // Secondary micro ripples for detail
    float wave3 = sin(pos.x * 2.0 + pos.z * 1.5 + uTime * uRippleSpeed * 2.0) * uRippleStrength * 0.3;
    float wave4 = cos(pos.x * 1.2 - pos.z * 0.8 + uTime * uRippleSpeed * 1.5) * uRippleStrength * 0.2;
    
    // Combine waves for natural water movement
    pos.y += wave1 + wave2 + wave3 + wave4;
    
    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

// Fragment shader for water appearance and glow
const waterFragmentShader = `
  uniform float uTime;
  uniform vec3 uWaterColor;
  uniform vec3 uGlowColor;
  uniform float uGlowIntensity;
  uniform float uTransparency;
  uniform vec3 uLightDirection;
  uniform float uFresnelPower;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  void main() {
    // Calculate fresnel effect for realistic water reflection
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - dot(viewDirection, vNormal), uFresnelPower);
    
    // Animate the glow intensity with gentle pulsing
    float glowPulse = 0.8 + 0.2 * sin(uTime * 0.5);
    float finalGlowIntensity = uGlowIntensity * glowPulse;
    
    // Create flowing patterns in the water
    vec2 flowUv = vUv + vec2(uTime * 0.02, uTime * 0.01);
    float flowPattern = sin(flowUv.x * 10.0) * cos(flowUv.y * 8.0) * 0.1 + 0.9;
    
    // Calculate lighting based on surface normal
    float lightDot = max(dot(vNormal, normalize(uLightDirection)), 0.0);
    vec3 lightColor = vec3(1.0, 0.95, 0.8) * lightDot * 0.5;
    
    // Combine water color with glow and lighting
    vec3 finalColor = mix(uWaterColor, uGlowColor, fresnel * 0.3);
    finalColor += uGlowColor * finalGlowIntensity * flowPattern;
    finalColor += lightColor;
    
    // Add depth-based color variation
    float depth = length(vWorldPosition - cameraPosition);
    float depthFactor = 1.0 - exp(-depth * 0.1);
    finalColor = mix(finalColor, uWaterColor * 0.7, depthFactor * 0.3);
    
    gl_FragColor = vec4(finalColor, uTransparency);
  }
`

// Water shader material component
export function WaterShaderMaterial() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!)
  
  // Shader uniforms
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uRippleSpeed: { value: 0.3 },        // Slow, meditative speed
    uRippleStrength: { value: 0.05 },    // Gentle ripples
    uWaterColor: { value: new THREE.Color(0.2, 0.4, 0.8) },     // Deep blue
    uGlowColor: { value: new THREE.Color(0.4, 0.7, 1.0) },      // Soft blue glow
    uGlowIntensity: { value: 0.3 },
    uTransparency: { value: 0.8 },
    uLightDirection: { value: new THREE.Vector3(1, 1, 0.5) },
    uFresnelPower: { value: 2.0 }
  }), [])
  
  // Animate the shader
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
  })
  
  return (
    <shaderMaterial
      ref={materialRef}
      uniforms={uniforms}
      vertexShader={waterVertexShader}
      fragmentShader={waterFragmentShader}
      transparent={true}
      side={THREE.DoubleSide}
    />
  )
}

// Enhanced water component using the custom shader
export function StylizedWater({ 
  geometry, 
  position = [0, 0, 0],
  ...props 
}: { 
  geometry: THREE.BufferGeometry
  position?: [number, number, number]
} & React.ComponentProps<'mesh'>) {
  
  return (
    <mesh geometry={geometry} position={position} {...props}>
      <WaterShaderMaterial />
    </mesh>
  )
}
