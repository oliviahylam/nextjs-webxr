// Sky Shader Component - Warm gradient sky from lavender to gold with volumetric fog
// Custom atmospheric shader for the zen garden's dreamy sky

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Vertex shader for sky dome
const skyVertexShader = `
  varying vec3 vWorldPosition;
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Fragment shader for gradient sky with volumetric fog
const skyFragmentShader = `
  uniform float uTime;
  uniform vec3 uTopColor;
  uniform vec3 uHorizonColor;
  uniform vec3 uBottomColor;
  uniform vec3 uSunPosition;
  uniform float uSunIntensity;
  uniform float uFogDensity;
  uniform float uFogHeight;
  uniform vec3 uFogColor;
  
  varying vec3 vWorldPosition;
  varying vec2 vUv;
  
  // Smooth step function for gradients
  float smootherstep(float edge0, float edge1, float x) {
    x = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
  }
  
  // Noise function for atmospheric variation
  float noise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
  }
  
  void main() {
    vec3 worldPos = normalize(vWorldPosition);
    
    // Calculate height factor (0 = horizon, 1 = zenith, -1 = nadir)
    float height = worldPos.y;
    
    // Create base gradient from lavender to gold
    vec3 skyColor;
    
    if (height > 0.0) {
      // Above horizon: lavender to gold gradient
      float t = smootherstep(0.0, 1.0, height);
      skyColor = mix(uHorizonColor, uTopColor, t);
    } else {
      // Below horizon: fade to bottom color
      float t = smootherstep(-0.3, 0.0, height);
      skyColor = mix(uBottomColor, uHorizonColor, t);
    }
    
    // Add sun glow effect
    vec3 sunDir = normalize(uSunPosition);
    float sunDot = max(dot(worldPos, sunDir), 0.0);
    float sunGlow = pow(sunDot, 8.0) * uSunIntensity;
    
    // Sun color - warm golden
    vec3 sunColor = vec3(1.0, 0.9, 0.7);
    skyColor += sunColor * sunGlow;
    
    // Add atmospheric scattering around sun
    float scattering = pow(sunDot, 2.0) * 0.3;
    skyColor += mix(uHorizonColor, sunColor, scattering);
    
    // Volumetric fog near horizon
    float fogFactor = 1.0;
    if (height < uFogHeight) {
      // Calculate fog density based on height and distance
      float fogAmount = smootherstep(uFogHeight, -0.1, height) * uFogDensity;
      
      // Add noise for realistic fog variation
      vec3 fogPos = vWorldPosition * 0.1 + vec3(uTime * 0.01, 0.0, uTime * 0.005);
      float fogNoise = noise(fogPos) * 0.3 + noise(fogPos * 2.0) * 0.2;
      fogAmount *= (0.8 + fogNoise);
      
      // Mix sky color with fog
      skyColor = mix(skyColor, uFogColor, fogAmount);
      fogFactor = 1.0 - fogAmount * 0.5;
    }
    
    // Add subtle time-based color variation
    float timeShift = sin(uTime * 0.1) * 0.05 + cos(uTime * 0.07) * 0.03;
    skyColor *= (1.0 + timeShift);
    
    // Add atmospheric perspective
    float distance = length(vWorldPosition);
    float atmosphere = 1.0 - exp(-distance * 0.00001);
    skyColor = mix(skyColor, uFogColor * 0.8, atmosphere * 0.1);
    
    gl_FragColor = vec4(skyColor, 1.0);
  }
`

// Sky shader material component
export function SkyShaderMaterial() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!)
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uTopColor: { value: new THREE.Color(0.6, 0.4, 0.8) },       // Lavender
    uHorizonColor: { value: new THREE.Color(1.0, 0.8, 0.4) },   // Gold
    uBottomColor: { value: new THREE.Color(0.8, 0.6, 0.9) },    // Light lavender
    uSunPosition: { value: new THREE.Vector3(0.3, 0.5, 0.8) },
    uSunIntensity: { value: 0.5 },
    uFogDensity: { value: 0.4 },
    uFogHeight: { value: 0.2 },
    uFogColor: { value: new THREE.Color(0.9, 0.85, 0.8) }       // Warm fog
  }), [])
  
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
      
      // Slowly animate sun position for dynamic lighting
      const time = clock.getElapsedTime() * 0.02
      materialRef.current.uniforms.uSunPosition.value.set(
        Math.sin(time) * 0.5 + 0.3,
        0.4 + Math.cos(time * 0.7) * 0.2,
        0.8
      )
    }
  })
  
  return (
    <shaderMaterial
      ref={materialRef}
      uniforms={uniforms}
      vertexShader={skyVertexShader}
      fragmentShader={skyFragmentShader}
      side={THREE.BackSide}
    />
  )
}

// Enhanced sky component
export function GradientSky({ 
  radius = 1000,
  ...props 
}: { 
  radius?: number
} & React.ComponentProps<'mesh'>) {
  
  const skyGeometry = useMemo(() => {
    return new THREE.SphereGeometry(radius, 32, 16)
  }, [radius])
  
  return (
    <mesh geometry={skyGeometry} {...props}>
      <SkyShaderMaterial />
    </mesh>
  )
}

// Volumetric fog component for additional atmosphere
export function VolumetricFog(props: React.ComponentProps<'group'>) {
  const fogRef = useRef<THREE.Group>(null!)
  
  useFrame(({ clock }) => {
    if (fogRef.current) {
      const time = clock.getElapsedTime()
      fogRef.current.rotation.y = time * 0.005 // Very slow rotation
    }
  })
  
  return (
    <group ref={fogRef} {...props}>
      {/* Multiple fog layers for depth */}
      {Array.from({ length: 8 }, (_, i) => {
        const height = i * 2 - 4
        const scale = 20 + i * 5
        const opacity = 0.02 - i * 0.002
        
        return (
          <mesh
            key={`fog-layer-${i}`}
            position={[0, height, 0]}
            rotation={[-Math.PI / 2, 0, i * 0.2]}
            scale={[scale, scale, 1]}
          >
            <planeGeometry />
            <meshBasicMaterial
              color="#f5f0e8"      // Warm fog color
              transparent={true}
              opacity={opacity}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
    </group>
  )
}
