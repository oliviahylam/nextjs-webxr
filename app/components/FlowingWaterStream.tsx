// Flowing Water Stream Component - Based on the provided water shader example
// Creates realistic flowing water with UV scrolling and caustic effects

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function FlowingWaterStream(props: React.ComponentProps<'group'>) {
  const waterRef = useRef<THREE.Mesh>(null!)
  
  // Water shader - vertex shader with visible ripples
  const waterVertexShader = `
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    
    void main() {
      vUv = uv;
      vec3 pos = position;

      // More visible flowing ripples
      float wave1 = sin((pos.x * 4.0 + uTime * 2.0)) * 0.02;
      float wave2 = sin((pos.z * 6.0 + uTime * 1.5)) * 0.015;
      float wave3 = sin((pos.x * 8.0 - pos.z * 4.0 + uTime * 3.0)) * 0.01;
      
      // Combine waves for natural water movement
      pos.y += wave1 + wave2 + wave3;
      
      vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `
  
  // Water shader - fragment shader with flowing UV and caustics
  const waterFragmentShader = `
    precision highp float;
    uniform float uTime;
    uniform vec3  uDeep;
    uniform vec3  uShallow;
    uniform float uOpacity;
    varying vec2 vUv;

    // Create flowing effect by offsetting UVs over time
    vec2 flowUV(vec2 uv, float speed, vec2 direction) {
      return uv + direction * uTime * speed;
    }

    // Noise function for more realistic water patterns
    float noise(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
      // Multiple flow layers for realistic water movement
      vec2 uv1 = flowUV(vUv, 0.08, vec2(1.0, 0.2));   // Main flow
      vec2 uv2 = flowUV(vUv, 0.05, vec2(-0.5, 1.0));  // Counter flow
      
      // Animated caustic patterns
      float caustic1 = sin(uv1.x * 15.0 + uTime * 2.0) * sin(uv1.y * 12.0 + uTime * 1.5);
      float caustic2 = sin(uv2.x * 18.0 + uTime * 1.8) * sin(uv2.y * 14.0 + uTime * 2.2);
      
      // Combine caustics for complex water patterns
      float caustics = (caustic1 + caustic2) * 0.3 + 0.3;
      
      // Add flowing noise for texture
      float flowNoise = noise(uv1 * 20.0) * 0.2 + noise(uv2 * 15.0) * 0.15;
      
      // Create depth variation from center to edges
      float centerDist = length(vUv - vec2(0.5, 0.5));
      float depth = smoothstep(0.0, 0.4, centerDist);
      
      // Mix colors based on depth and caustics for sand appearance
      vec3 sandColor = mix(uShallow, uDeep, depth);
      sandColor += caustics * vec3(0.2, 0.15, 0.1);  // Warm sand caustic highlights
      sandColor += flowNoise * vec3(0.15, 0.1, 0.05);  // Sand texture variation
      
      // Add animated sand sparkles (like mica in sand)
      float sparkle = step(0.97, noise(uv1 * 80.0 + uTime * 2.0));
      sandColor += sparkle * vec3(0.3, 0.25, 0.15);
      
      // Subtle sand reflection (less than water)
      float fresnel = pow(1.0 - abs(dot(normalize(vec3(0.0, 1.0, 0.0)),
                                        normalize(vec3(0.3, 0.7, 0.6)))), 2.0);
      sandColor += fresnel * vec3(0.1, 0.08, 0.05);

      gl_FragColor = vec4(sandColor, uOpacity);
    }
  `
  
  // Shader uniforms
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uDeep: { value: new THREE.Color("#d4a574") },      // Deep sand color
    uShallow: { value: new THREE.Color("#f5e6d3") },   // Light sand color
    uOpacity: { value: 0.9 }
  }), [])
  
  // Create curved stream geometry
  const streamGeometry = useMemo(() => {
    // Create a wide, curved strip from subdivided plane
    const geo = new THREE.PlaneGeometry(3.2, 0.7, 300, 20)
    geo.rotateX(-Math.PI / 2)
    
    // Add gentle S-curve by moving vertices in X based on Z
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      pos.setX(i, x + Math.sin(z * 1.5) * 0.35) // Curve amount
    }
    pos.needsUpdate = true
    
    return geo
  }, [])
  
  // Create shader material
  const waterMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      transparent: true
    })
  }, [uniforms, waterVertexShader, waterFragmentShader])
  
  // Animate the water
  useFrame(({ clock }) => {
    if (waterMaterial) {
      waterMaterial.uniforms.uTime.value = clock.getElapsedTime()
    }
  })
  
  return (
    <group {...props}>
      
      {/* Main flowing water surface */}
      <mesh 
        ref={waterRef}
        geometry={streamGeometry}
        material={waterMaterial}
        position={[0, 2.02, 0]} // Slightly above the island surface
      />
      
      {/* Stream bed for depth */}
      <mesh 
        geometry={streamGeometry}
        position={[0, 1.98, 0]}
        scale={[1.1, 1, 1.1]}
      >
        <meshStandardMaterial
          color="#313630"      // Dark ground color
          roughness={0.95}
          metalness={0.0}
        />
      </mesh>
      
      {/* Rocks around the stream for reference */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const radius = 1.8 + Math.random() * 0.5
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <mesh
            key={i}
            position={[x, 2.06, z]}
            scale={THREE.MathUtils.randFloat(0.6, 1.2)}
          >
            <icosahedronGeometry args={[0.12, 1]} />
            <meshStandardMaterial
              color="#556055"    // Rock color
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
        )
      })}
      
      {/* Additional scattered pebbles */}
      {Array.from({ length: 20 }, (_, i) => {
        const x = (Math.random() - 0.5) * 6
        const z = (Math.random() - 0.5) * 2
        
        return (
          <mesh
            key={`pebble-${i}`}
            position={[x, 2.03, z]}
            scale={THREE.MathUtils.randFloat(0.3, 0.6)}
          >
            <sphereGeometry args={[0.08, 6, 4]} />
            <meshStandardMaterial
              color="#4a4a3a"
              roughness={0.9}
            />
          </mesh>
        )
      })}
      
    </group>
  )
}
