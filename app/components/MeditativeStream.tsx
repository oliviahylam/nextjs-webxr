// Meditative Stream Component - Advanced flowing water with realistic effects
// Natural curved stream with reflections, caustics, and gentle flow animation

import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Advanced water shader with reflections and caustics
const waterVertexShader = `
  uniform float uTime;
  uniform float uFlowSpeed;
  uniform float uWaveHeight;
  uniform float uWaveFrequency;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec4 vScreenPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    // Create gentle water surface waves
    vec3 pos = position;
    float wave1 = sin(pos.x * uWaveFrequency + uTime * uFlowSpeed) * uWaveHeight;
    float wave2 = cos(pos.z * uWaveFrequency * 0.7 + uTime * uFlowSpeed * 0.8) * uWaveHeight * 0.6;
    float wave3 = sin((pos.x + pos.z) * uWaveFrequency * 1.3 + uTime * uFlowSpeed * 1.2) * uWaveHeight * 0.3;
    
    pos.y += wave1 + wave2 + wave3;
    
    // Calculate normal for lighting
    float offset = 0.1;
    vec3 posL = vec3(pos.x - offset, pos.y, pos.z);
    vec3 posR = vec3(pos.x + offset, pos.y, pos.z);
    vec3 posU = vec3(pos.x, pos.y, pos.z + offset);
    vec3 posD = vec3(pos.x, pos.y, pos.z - offset);
    
    posL.y += sin(posL.x * uWaveFrequency + uTime * uFlowSpeed) * uWaveHeight;
    posR.y += sin(posR.x * uWaveFrequency + uTime * uFlowSpeed) * uWaveHeight;
    posU.y += sin(posU.z * uWaveFrequency * 0.7 + uTime * uFlowSpeed * 0.8) * uWaveHeight * 0.6;
    posD.y += sin(posD.z * uWaveFrequency * 0.7 + uTime * uFlowSpeed * 0.8) * uWaveHeight * 0.6;
    
    vec3 tangent = normalize(posR - posL);
    vec3 bitangent = normalize(posU - posD);
    vNormal = normalize(cross(tangent, bitangent));
    
    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPosition.xyz;
    vScreenPosition = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    
    gl_Position = vScreenPosition;
  }
`

const waterFragmentShader = `
  uniform float uTime;
  uniform vec3 uWaterColor;
  uniform vec3 uDeepWaterColor;
  uniform float uTransparency;
  uniform float uReflectionStrength;
  uniform float uFlowSpeed;
  uniform vec3 uSunDirection;
  uniform samplerCube uEnvironmentMap;
  uniform sampler2D uCausticsTexture;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec4 vScreenPosition;
  
  // Noise function for water distortion
  float noise(vec2 uv) {
    return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  // Generate caustics pattern
  float caustics(vec2 uv, float time) {
    vec2 p = uv * 8.0;
    float c = 0.0;
    
    // Multiple layers of caustics
    for(int i = 0; i < 3; i++) {
      float f = float(i);
      vec2 offset = vec2(sin(time * 0.3 + f), cos(time * 0.4 + f)) * 0.5;
      p += offset;
      
      float n1 = noise(p + time * 0.1);
      float n2 = noise(p * 2.0 - time * 0.15);
      c += pow(max(0.0, sin(n1 * 6.28) * sin(n2 * 6.28)), 2.0) * (1.0 / (f + 1.0));
    }
    
    return c * 0.5;
  }
  
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    
    // UV scrolling for flow effect
    vec2 flowUv1 = vUv + vec2(uTime * uFlowSpeed * 0.02, uTime * uFlowSpeed * 0.01);
    vec2 flowUv2 = vUv + vec2(-uTime * uFlowSpeed * 0.015, uTime * uFlowSpeed * 0.025);
    
    // Distort UVs for water movement
    float distortion1 = noise(flowUv1 * 4.0) * 0.02;
    float distortion2 = noise(flowUv2 * 6.0) * 0.015;
    vec2 distortedUv = vUv + vec2(distortion1, distortion2);
    
    // Fresnel effect for realistic water reflection
    float fresnel = pow(1.0 - max(dot(viewDirection, normal), 0.0), 2.0);
    
    // Environment reflection
    vec3 reflectionDir = reflect(-viewDirection, normal);
    vec3 envReflection = textureCube(uEnvironmentMap, reflectionDir).rgb;
    
    // Water depth effect
    float depth = length(vWorldPosition - cameraPosition) * 0.1;
    float depthFactor = 1.0 - exp(-depth);
    
    // Base water color with depth variation
    vec3 waterColor = mix(uWaterColor, uDeepWaterColor, depthFactor * 0.7);
    
    // Caustics effect
    float causticsPattern = caustics(distortedUv, uTime);
    vec3 causticColor = vec3(0.8, 0.9, 1.0) * causticsPattern * 0.3;
    
    // Sun reflection on water
    vec3 sunReflection = reflect(-normalize(uSunDirection), normal);
    float sunDot = max(dot(viewDirection, sunReflection), 0.0);
    float sunHighlight = pow(sunDot, 128.0) * 0.5;
    
    // Combine all effects
    vec3 finalColor = waterColor;
    finalColor = mix(finalColor, envReflection, fresnel * uReflectionStrength);
    finalColor += causticColor;
    finalColor += vec3(1.0, 0.95, 0.8) * sunHighlight;
    
    // Add subtle foam/bubbles near edges
    float edgeFoam = smoothstep(0.0, 0.1, abs(vPosition.x)) * 0.1;
    finalColor += vec3(0.9, 0.95, 1.0) * edgeFoam;
    
    gl_FragColor = vec4(finalColor, uTransparency);
  }
`

// Stream bed geometry and materials
function StreamBed({ streamPath }: { streamPath: THREE.Vector3[] }) {
  const bedGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const vertices = []
    const indices = []
    const uvs = []
    
    // Create stream bed vertices
    for (let i = 0; i < streamPath.length; i++) {
      const point = streamPath[i]
      const width = 2.5 // Stream bed width
      
      // Left and right edges of stream bed
      vertices.push(point.x - width, point.y - 0.2, point.z - width * 0.3)
      vertices.push(point.x + width, point.y - 0.2, point.z + width * 0.3)
      
      // UV coordinates
      uvs.push(0, i / streamPath.length)
      uvs.push(1, i / streamPath.length)
      
      // Create triangles for stream bed
      if (i < streamPath.length - 1) {
        const base = i * 2
        indices.push(base, base + 1, base + 2)
        indices.push(base + 1, base + 3, base + 2)
      }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()
    
    return geometry
  }, [streamPath])
  
  return (
    <mesh geometry={bedGeometry} position={[0, 0, 0]}>
      <meshStandardMaterial
        color="#4a4a3a"
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  )
}

// Stream stones component
function StreamStones({ streamPath }: { streamPath: THREE.Vector3[] }) {
  const stones = useMemo(() => {
    const stoneData = []
    
    for (let i = 0; i < streamPath.length; i += 3) {
      const point = streamPath[i]
      
      // Add stones along the stream edges
      for (let side = 0; side < 2; side++) {
        const sideMultiplier = side === 0 ? -1 : 1
        const stoneCount = 2 + Math.floor(Math.random() * 3)
        
        for (let j = 0; j < stoneCount; j++) {
          stoneData.push({
            position: [
              point.x + sideMultiplier * (1.5 + Math.random() * 1.5),
              point.y + Math.random() * 0.1,
              point.z + sideMultiplier * (0.5 + Math.random() * 1.0)
            ] as [number, number, number],
            scale: 0.2 + Math.random() * 0.4,
            rotation: Math.random() * Math.PI * 2
          })
        }
      }
    }
    
    return stoneData
  }, [streamPath])
  
  return (
    <group>
      {stones.map((stone, i) => (
        <mesh
          key={i}
          position={stone.position}
          rotation={[0, stone.rotation, 0]}
          scale={stone.scale}
        >
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial
            color="#8a8a7a"
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  )
}

// Ripple effects where water meets stones
function WaterRipples({ streamPath }: { streamPath: THREE.Vector3[] }) {
  const ripplesRef = useRef<THREE.Group>(null!)
  
  useFrame(({ clock }) => {
    if (ripplesRef.current) {
      ripplesRef.current.children.forEach((child, i) => {
        const time = clock.getElapsedTime() + i * 0.5
        const scale = 1 + Math.sin(time * 2) * 0.3
        child.scale.setScalar(scale)
        
        if (child.material instanceof THREE.MeshBasicMaterial) {
          child.material.opacity = 0.3 * (1 - Math.abs(Math.sin(time * 2)))
        }
      })
    }
  })
  
  const ripplePositions = useMemo(() => {
    return streamPath.filter((_, i) => i % 4 === 0).map(point => [
      point.x + (Math.random() - 0.5) * 2,
      point.y + 0.01,
      point.z + (Math.random() - 0.5) * 2
    ] as [number, number, number])
  }, [streamPath])
  
  return (
    <group ref={ripplesRef}>
      {ripplePositions.map((pos, i) => (
        <mesh
          key={i}
          position={pos}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.1, 0.3, 16]} />
          <meshBasicMaterial
            color="#87ceeb"
            transparent={true}
            opacity={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

// Main meditative stream component
export function MeditativeStream(props: React.ComponentProps<'group'>) {
  const streamRef = useRef<THREE.Group>(null!)
  const waterMaterialRef = useRef<THREE.ShaderMaterial>(null!)
  const { scene } = useThree()
  
  // Create curved stream path
  const streamPath = useMemo(() => {
    const points = []
    const segments = 50
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const x = (t - 0.5) * 25 // Stream length
      const z = Math.sin(t * Math.PI * 2) * 6 + Math.cos(t * Math.PI * 3) * 2 // Natural curves
      const y = Math.sin(t * Math.PI * 4) * 0.1 // Gentle height variation
      
      points.push(new THREE.Vector3(x, y, z))
    }
    
    return points
  }, [])
  
  // Create stream geometry
  const streamGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const vertices = []
    const indices = []
    const uvs = []
    
    // Create stream surface vertices
    for (let i = 0; i < streamPath.length; i++) {
      const point = streamPath[i]
      const width = 1.8 // Stream width
      
      // Left and right edges of stream
      vertices.push(point.x - width, point.y, point.z - width * 0.2)
      vertices.push(point.x + width, point.y, point.z + width * 0.2)
      
      // UV coordinates for texture scrolling
      uvs.push(0, i / streamPath.length * 4) // Repeat texture along length
      uvs.push(1, i / streamPath.length * 4)
      
      // Create triangles for stream surface
      if (i < streamPath.length - 1) {
        const base = i * 2
        indices.push(base, base + 1, base + 2)
        indices.push(base + 1, base + 3, base + 2)
      }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()
    
    return geometry
  }, [streamPath])
  
  // Create environment map for reflections
  const envMap = useMemo(() => {
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256)
    const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget)
    scene.add(cubeCamera)
    return cubeRenderTarget.texture
  }, [scene])
  
  // Shader uniforms
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uFlowSpeed: { value: 0.5 },
    uWaveHeight: { value: 0.02 },
    uWaveFrequency: { value: 2.0 },
    uWaterColor: { value: new THREE.Color(0.2, 0.5, 0.8) },
    uDeepWaterColor: { value: new THREE.Color(0.1, 0.3, 0.6) },
    uTransparency: { value: 0.8 },
    uReflectionStrength: { value: 0.4 },
    uSunDirection: { value: new THREE.Vector3(1, 1, 0.5) },
    uEnvironmentMap: { value: envMap },
    uCausticsTexture: { value: null }
  }), [envMap])
  
  // Animate water
  useFrame(({ clock }) => {
    if (waterMaterialRef.current) {
      waterMaterialRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
  })
  
  return (
    <group ref={streamRef} {...props}>
      
      {/* Stream bed */}
      <StreamBed streamPath={streamPath} />
      
      {/* Water surface with advanced shader */}
      <mesh geometry={streamGeometry} position={[0, 0.05, 0]}>
        <shaderMaterial
          ref={waterMaterialRef}
          uniforms={uniforms}
          vertexShader={waterVertexShader}
          fragmentShader={waterFragmentShader}
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Stream stones and moss */}
      <StreamStones streamPath={streamPath} />
      
      {/* Water ripples */}
      <WaterRipples streamPath={streamPath} />
      
      {/* Moss patches along stream */}
      {streamPath.filter((_, i) => i % 6 === 0).map((point, i) => (
        <mesh
          key={`moss-${i}`}
          position={[
            point.x + (Math.random() - 0.5) * 4,
            point.y + 0.01,
            point.z + (Math.random() - 0.5) * 4
          ]}
          rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}
          scale={[0.5 + Math.random() * 0.5, 0.5 + Math.random() * 0.5, 1]}
        >
          <circleGeometry args={[0.8, 12]} />
          <meshStandardMaterial
            color="#4a5d23"
            roughness={1.0}
            transparent={true}
            opacity={0.8}
          />
        </mesh>
      ))}
      
    </group>
  )
}
