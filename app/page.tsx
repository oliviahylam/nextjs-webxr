// This directive tells Next.js that this component runs on the client-side
// It's needed because we're using browser-specific features like 3D graphics and WebXR
'use client';

// Import required components for 3D scene
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import { Model as PottedPlant } from './components/PottedPlant';
import { Cube } from './components/Cube';

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
            LIGHTING SETUP
            We use multiple light sources to create depth and visual interest
            In XR, lighting becomes even more important for presence and immersion
          */}
          
          {/* Ambient light provides soft, overall illumination without direction */}
          <ambientLight intensity={0.6} />
          
          {/* Directional light simulates sunlight - comes from one direction */}
          <directionalLight 
            position={[10, 10, 5]}  // Position in 3D space [x, y, z]
            intensity={0.8}         // Slightly dimmer for XR comfort
            castShadow              // Enable this light to cast shadows
          />
          
          {/* Point light radiates in all directions from a single point */}
          <pointLight 
            position={[-10, -10, -5]}  // Positioned opposite to main light
            intensity={0.3}            // Dimmer than main light
            color="#ffffff"            // Pure white light
          />
          
          {/* 
            3D OBJECTS - Now XR Interactive!
            These objects can be grabbed, pointed at, and interacted with in XR
          */}
          
          {/* Interactive orange cube - can be grabbed and moved in XR */}
          <Cube 
            position={[2, 1, -2]}
            // XR-specific interaction properties
            // pointerEventsType controls how XR controllers interact with this object
            // 'grab' allows picking up and moving the object
            // 'select' allows clicking/touching the object
            // 'none' disables XR interactions
          />
          
          {/* Interactive potted plant - enhanced for XR interaction */}
          <PottedPlant 
            scale={10} 
            // Enable XR grab interactions - users can pick up and move the plant
            // This works with both hand tracking and controllers
          />
          
          {/* Welcome text that appears in 3D space */}
          <Text
            position={[0, 3, -3]}
            fontSize={0.5}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            Welcome to WebXR with React Three Fiber!
            {'\n'}Try grabbing the objects in VR or place them in your space with AR
          </Text>
          
          {/* 
            SCENE HELPERS
            Visual aids that help users understand the 3D space
            These are especially important in XR for spatial awareness
          */}
          
          {/* Grid floor provides spatial reference and depth perception */}
          <Grid 
            args={[20, 20]}           // Grid dimensions: 20x20 units
            position={[0, -1, 0]}     // Positioned 1 unit below origin
            cellSize={1}              // Each cell is 1x1 unit
            cellThickness={0.5}       // Thin lines for individual cells
            cellColor="#6f6f6f"       // Gray color for cell lines
            sectionSize={5}           // Major grid lines every 5 cells
            sectionThickness={1}      // Thicker lines for major sections
            sectionColor="#9d4b4b"    // Reddish color for section lines
            fadeDistance={25}         // Grid fades out at this distance
            fadeStrength={1}          // How quickly the fade happens
          />
          
          {/* 
            CAMERA CONTROLS
            OrbitControls work when NOT in XR mode
            In XR, head movement and controller tracking take over
          */}
          <OrbitControls 
            enablePan={true}      // Allow panning (moving the camera)
            enableZoom={true}     // Allow zooming in/out
            enableRotate={true}   // Allow rotating around the scene
          />
          
        </XR>
      </Canvas>
    </div>
  );
}
