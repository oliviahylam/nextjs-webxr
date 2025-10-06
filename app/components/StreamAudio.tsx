// Stream Audio Component - Gentle flowing water sounds for the meditative stream
// Spatial audio that responds to user position and creates immersive water ambiance

'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

export function StreamAudio() {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRefs = useRef<{
    streamSource?: AudioBufferSourceNode
    bubblesSource?: AudioBufferSourceNode
    gentleFlowSource?: AudioBufferSourceNode
    gainNode?: GainNode
  }>({})

  // Initialize audio context
  useEffect(() => {
    const initAudio = async () => {
      if (!audioContext) {
        const ctx = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        setAudioContext(ctx)
        
        // Create gain node for volume control
        const gainNode = ctx.createGain()
        gainNode.gain.setValueAtTime(0.4, ctx.currentTime) // Gentle volume
        gainNode.connect(ctx.destination)
        audioRefs.current.gainNode = gainNode
      }
    }
    
    initAudio()
    
    return () => {
      if (audioContext) {
        audioContext.close()
      }
    }
  }, [audioContext])

  // Create gentle stream flow sound
  const createStreamSound = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 8 // 8 seconds of audio
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    
    // Generate flowing water sound using filtered noise
    for (let i = 0; i < bufferSize; i++) {
      // Base water flow - filtered white noise
      const whiteNoise = Math.random() * 2 - 1
      
      // Add flowing patterns
      const flowPattern1 = Math.sin(i * 0.001) * 0.3
      const flowPattern2 = Math.cos(i * 0.0015) * 0.2
      const flowPattern3 = Math.sin(i * 0.002) * Math.random() * 0.1
      
      // Combine for realistic water flow
      data[i] = (whiteNoise * 0.4 + flowPattern1 + flowPattern2 + flowPattern3) * 0.3
    }
    
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    
    // Filter for water-like sound
    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.setValueAtTime(1200, ctx.currentTime)
    lowpass.Q.setValueAtTime(0.5, ctx.currentTime)
    
    const highpass = ctx.createBiquadFilter()
    highpass.type = 'highpass'
    highpass.frequency.setValueAtTime(80, ctx.currentTime)
    
    source.connect(lowpass)
    lowpass.connect(highpass)
    highpass.connect(audioRefs.current.gainNode!)
    
    return source
  }

  // Create gentle bubbling sounds
  const createBubbleSound = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 6 // 6 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    
    // Generate subtle bubble sounds
    for (let i = 0; i < bufferSize; i++) {
      let sample = 0
      
      // Occasional gentle bubbles
      if (Math.random() > 0.9995) {
        const freq = 200 + Math.random() * 400 // Bubble frequency range
        const decay = Math.exp(-i * 0.0001) // Decay envelope
        sample = Math.sin(2 * Math.PI * freq * i / ctx.sampleRate) * decay * 0.05
      }
      
      data[i] = sample
    }
    
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    
    // Filter for bubble effect
    const bandpass = ctx.createBiquadFilter()
    bandpass.type = 'bandpass'
    bandpass.frequency.setValueAtTime(300, ctx.currentTime)
    bandpass.Q.setValueAtTime(2, ctx.currentTime)
    
    source.connect(bandpass)
    bandpass.connect(audioRefs.current.gainNode!)
    
    return source
  }

  // Create very gentle flow ambiance
  const createGentleFlowSound = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 10 // 10 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    
    // Generate very subtle flow ambiance
    for (let i = 0; i < bufferSize; i++) {
      // Very low frequency flow sound
      const flow1 = Math.sin(i * 0.0001) * 0.1
      const flow2 = Math.cos(i * 0.00015) * 0.08
      const flow3 = Math.sin(i * 0.0002) * 0.06
      
      data[i] = flow1 + flow2 + flow3
    }
    
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    
    // Very heavy low-pass filtering for ambient flow
    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.setValueAtTime(150, ctx.currentTime)
    lowpass.Q.setValueAtTime(1, ctx.currentTime)
    
    source.connect(lowpass)
    lowpass.connect(audioRefs.current.gainNode!)
    
    return source
  }

  // Start stream audio
  const startStreamAudio = useCallback(() => {
    if (!audioContext || isPlaying) return
    
    try {
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        audioContext.resume()
      }
      
      // Create and start all water sound sources
      audioRefs.current.streamSource = createStreamSound(audioContext)
      audioRefs.current.bubblesSource = createBubbleSound(audioContext)
      audioRefs.current.gentleFlowSource = createGentleFlowSound(audioContext)
      
      audioRefs.current.streamSource.start()
      audioRefs.current.bubblesSource.start()
      audioRefs.current.gentleFlowSource.start()
      
      setIsPlaying(true)
    } catch (error) {
      console.log('Could not start stream audio:', error)
    }
  }, [audioContext, isPlaying])

  // Stop stream audio
  const stopStreamAudio = () => {
    if (audioRefs.current.streamSource) audioRefs.current.streamSource.stop()
    if (audioRefs.current.bubblesSource) audioRefs.current.bubblesSource.stop()
    if (audioRefs.current.gentleFlowSource) audioRefs.current.gentleFlowSource.stop()
    
    setIsPlaying(false)
  }

  // Auto-start audio
  useEffect(() => {
    const handleInteraction = () => {
      startStreamAudio()
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }
    
    // Try to start immediately, or wait for user interaction
    startStreamAudio()
    document.addEventListener('click', handleInteraction)
    document.addEventListener('touchstart', handleInteraction)
    
    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
      stopStreamAudio()
    }
  }, [audioContext, startStreamAudio])

  // This component doesn't render visually
  return null
}
