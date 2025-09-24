# WebXR Setup with React Three Fiber

This project now includes WebXR support using the `@react-three/xr` library, allowing you to experience your 3D scene in both Augmented Reality (AR) and Virtual Reality (VR).

## Features Added

### 🥽 VR Support
- **Enter VR**: Click the "Enter VR" button to immerse yourself in the 3D world
- **Hand/Controller Tracking**: Use VR controllers or hand tracking to interact with objects
- **6DOF Movement**: Full head and hand position tracking

### 📱 AR Support  
- **Enter AR**: Click the "Enter AR" button to overlay 3D objects in your real world
- **Real-world Integration**: Place and move objects in your physical space
- **Passthrough**: See your real environment with virtual objects overlaid

### 🎯 Interactive Objects
- **Grab and Move**: Pick up the cube and potted plant in VR/AR
- **Natural Interaction**: Point, grab, and manipulate objects with hands or controllers
- **Position Persistence**: Objects maintain their positions across session changes

## Technical Implementation

### XR Store
```javascript
const store = createXRStore()
```
- Manages XR session state
- Provides methods to enter/exit AR and VR modes
- Handles browser compatibility

### XR Wrapper
```jsx
<XR store={store}>
  {/* Your 3D content here */}
</XR>
```
- Enables WebXR functionality for all child components
- Automatically handles controller/hand input
- Manages XR rendering pipeline

### Browser Support

| Feature | Chrome/Edge | Firefox | Safari |
|---------|-------------|---------|--------|
| WebXR VR | ✅ | ✅ | ❌ |
| WebXR AR | ✅ (Android) | ❌ | ❌ |

## Device Requirements

### VR Requirements
- **Desktop**: Oculus Rift, HTC Vive, Windows Mixed Reality headsets
- **Standalone**: Meta Quest 2/3/Pro, Pico 4, etc.
- **Browser**: Chrome, Edge, Firefox with WebXR enabled

### AR Requirements
- **Android**: Chrome browser with ARCore support
- **Device**: ARCore compatible Android device
- **Note**: iOS Safari does not support WebXR AR (use WebAR alternatives)

## Development Notes

### HTTPS Requirement
WebXR requires HTTPS in production. For local development:
- `localhost` works without HTTPS
- For network testing, use `npm run dev -- --experimental-https`

### Fallback Behavior
- If VR/AR is not supported, buttons will show appropriate error messages
- The 3D scene remains fully functional without XR capabilities
- OrbitControls provide fallback navigation

## Testing Your XR Implementation

1. **Local Testing**: Visit `http://localhost:3000`
2. **Desktop VR**: Connect VR headset and click "Enter VR"
3. **Mobile AR**: Open on ARCore-supported Android device and click "Enter AR"
4. **Interaction**: Try grabbing and moving the cube and plant objects

## Troubleshooting

### "VR not available" Error
- Ensure VR headset is connected and detected
- Check if browser supports WebXR
- Verify headset drivers are up to date

### "AR not available" Error
- Confirm device supports ARCore
- Check camera permissions
- Ensure you're using Chrome on Android

### Objects Not Interactive
- Objects inside `<XR>` wrapper automatically become interactive
- Some interactions require specific `pointerEventsType` props
- Check browser console for WebXR-related errors

## Next Steps

Consider exploring:
- **Hand Tracking**: Advanced gesture recognition
- **Hit Testing**: Place objects on real-world surfaces in AR
- **Anchors**: Persist object positions across AR sessions
- **Custom Controllers**: Create unique interaction patterns
- **Physics**: Add realistic object interactions with physics engines

## Resources

- [React Three XR Documentation](https://docs.pmnd.rs/xr)
- [WebXR Specification](https://www.w3.org/TR/webxr/)
- [Three.js WebXR Guide](https://threejs.org/docs/#manual/en/introduction/How-to-create-VR-content)
