// This directive tells Next.js that this component runs on the client-side
// It's needed because we're using browser-specific features like 3D graphics and WebXR
'use client';

// Import required components for 3D scene
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sky, Grid } from '@react-three/drei';
import { Model as PottedPlant } from './components/PottedPlant';
import { Cube } from './components/Cube';

// Import Japanese zen garden components
import { FloatingIsland } from './components/FloatingIsland';
import { StonePaths } from './components/StonePaths';
import { BonsaiTrees } from './components/BonsaiTrees';
import { ZenRabbits } from './components/ZenRabbits';
import { MeditativeRabbits } from './components/LowPolyRabbit';
import { GlowingStream } from './components/GlowingStream';
import { MeditativeStream } from './components/MeditativeStream';
import { SimpleStream } from './components/SimpleStream';
import { FlowingWaterStream } from './components/FlowingWaterStream';
import { ZenDome } from './components/ZenDome';
import { AtmosphericEffects } from './components/AtmosphericEffects';
import { StreamAudio } from './components/StreamAudio';
import { AtmosphericMist } from './components/AtmosphericMist';
import { AmbientSounds } from './components/AmbientSounds';

// Import custom shaders
import { GradientSky, VolumetricFog } from './shaders/SkyShader';

// Import WebXR components - these enable AR and VR functionality
import { XR, createXRStore, useXRStore } from '@react-three/xr';
import { useState, useEffect } from 'react';

// Create XR store outside of component to persist across re-renders
// This manages the WebXR session state and provides methods to enter/exit XR modes
const store = createXRStore();

// Main homepage component that renders our 3D scene with XR capabilities
export default function Home() {
  // State to track if XR session is active
  const [isXRActive, setIsXRActive] = useState(false);

  // Listen to XR store state changes
  useEffect(() => {
    // Subscribe to XR session changes
    const unsubscribe = store.subscribe((state) => {
      setIsXRActive(state.session !== null);
    });
    
    return unsubscribe;
  }, []);

  return (
    // Container div that takes up the full viewport (100% width and height)
    <div style={{ width: '100vw', height: '100vh' }}>
      
      {/* XR CONTROL BUTTONS - Only show when not in XR mode */}
      {!isXRActive && (
        <>
          {/* AR Entry Button */}
          <button 
            className="xr-button enter-ar-button"
            onClick={async () => {
              try {
                // Enter AR mode when clicked - this is async and might fail
                await store.enterAR();
              } catch (error) {
                console.log('AR not available:', error);
                alert('AR mode is not supported on this device or browser.');
              }
            }}
          >
            Enter AR
          </button>
          
          {/* VR Entry Button */}
          <button 
            className="xr-button enter-vr-button"
            onClick={async () => {
              try {
                // Enter VR mode when clicked - this is async and might fail
                await store.enterVR();
              } catch (error) {
                console.log('VR not available:', error);
                alert('VR mode is not supported on this device or browser.');
              }
            }}
          >
            Enter VR
          </button>
        </>
      )}
      
      {/* 
        Canvas is the main React Three Fiber component that creates a 3D scene
        It sets up WebGL context and handles rendering
        camera prop sets the initial camera position [x, y, z]
        XR requires WebGL2 context for optimal performance
      */}
      <Canvas 
        camera={{ position: [5, 5, 5] }}
        gl={{ alpha: true }} // Enable transparency for AR pass-through
      >
        
        {/* 
          XR WRAPPER - This enables WebXR functionality
          Everything inside this component becomes XR-capable
          The store prop connects to our XR state management
        */}
        <XR store={store}>
          
          {/* 
            MONUMENTAL ZEN DOME ENVIRONMENT
            Creates a massive architectural dome with dramatic skylight opening
          */}
          <ZenDome />
          
          {/* 
            ATMOSPHERIC EFFECTS
            Dust particles and light rays streaming through the skylight
          */}
          <AtmosphericEffects />
          
          {/* 
            MINIMAL SCENE LIGHTING
            The dome now provides the main lighting system
            Only subtle fill lights remain for balance
          */}
          
          {/* Minimal ambient fill to prevent pure black shadows */}
          <ambientLight intensity={0.1} color="#f8f5f0" />
        
        {/* 
            CUSTOM GRADIENT SKY
            Warm lavender to gold gradient with volumetric fog near horizon
          */}
          <GradientSky />
          
          {/* Enhanced volumetric fog layers */}
          <VolumetricFog />
          
          {/* Scene fog for depth */}
          <fog attach="fog" args={['#f5f0e8', 20, 80]} />

          {/* 
            JAPANESE ZEN GARDEN ELEMENTS
            Floating island sanctuary with natural beauty
          */}
          
          {/* Circular floating island foundation */}
          <FloatingIsland />
          
          {/* Curved stone pathways winding through the garden */}
          <StonePaths />
          
          {/* Authentic bonsai trees with detailed branches */}
          <BonsaiTrees />
          
          {/* Original stone rabbit sculptures */}
          <ZenRabbits />
          
          {/* New low-poly meditative rabbits with ceramic surface */}
          <MeditativeRabbits />
          
          {/* Original glowing stream with lily pads */}
          <GlowingStream />
          
          {/* Flowing water stream with proper shader effects */}
          <FlowingWaterStream position={[0, 0, 0]} />
          
          {/* Other streams commented out for now */}
          {/* <SimpleStream position={[0, 0, 0]} /> */}
          {/* <MeditativeStream position={[0, 0, 0]} /> */}
          
          {/* Dedicated stream audio for flowing water sounds */}
          <StreamAudio />
          
          {/* Light mist and atmospheric effects */}
          <AtmosphericMist />
          
          {/* Enhanced ambient nature sounds */}
          <AmbientSounds />

          {/* 
            INTERACTIVE ZEN ELEMENTS
            Peaceful objects that can be contemplated and moved in XR
          */}
          
          {/* Floating meditation stone - transformed cube */}
          <Cube 
            position={[5, 4, 2]}
            scale={0.6}
          />
          
          {/* Sacred bonsai in special position */}
          <PottedPlant 
            scale={6}
            position={[0, 2.2, 0]}
          />
          
          {/* Welcome message with zen garden theme */}
          <Text
            position={[0, 8, -20]}
            fontSize={0.6}
            color="#654321"         // Dark brown - earth tones
            anchorX="center"
            anchorY="middle"
            maxWidth={15}
            textAlign="center"
          >
            🌸 The Floating Zen Garden 🌸
            {'\n\n'}Where time flows like the gentle stream
            {'\n'}Listen to water dancing over smooth stones
            {'\n'}Ceramic rabbits sit in silent meditation
            {'\n'}Find peace in this sacred floating sanctuary
          </Text>
          
          {/* 
            SMOOTH CAMERA CONTROLS
            Gentle navigation perfect for contemplating the zen garden
            Slow, peaceful movement that matches the serene atmosphere
        */}
        <OrbitControls 
            enablePan={true}         // Allow panning around the floating island
            enableZoom={true}        // Allow zooming to see details
            enableRotate={true}      // Allow rotating around the garden
            autoRotate={true}        // Gentle automatic rotation
            autoRotateSpeed={0.2}    // Very slow, meditative rotation
            enableDamping={true}     // Smooth, fluid camera movement
            dampingFactor={0.05}     // Extra smooth damping
            minDistance={5}          // Don't get too close
            maxDistance={50}         // Don't get too far away
            maxPolarAngle={Math.PI / 2.2} // Prevent going under the island
          />
          
        </XR>
      </Canvas>
    </div>
  );
}
