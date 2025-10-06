// Ambient Sounds Component - Creates peaceful audio atmosphere
// This component adds the sounds of flowing water, birds, and gentle breeze

'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

export function AmbientSounds() {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRefs = useRef<{
    waterSource?: AudioBufferSourceNode
    birdsSource?: AudioBufferSourceNode
    breezeSource?: AudioBufferSourceNode
    gainNode?: GainNode
  }>({})

  // Initialize audio context and create synthetic sounds
  useEffect(() => {
    const initAudio = async () => {
      if (!audioContext) {
        const ctx = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        setAudioContext(ctx)
        
        // Create a gain node for volume control
        const gainNode = ctx.createGain()
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime) // Set volume to 30%
        gainNode.connect(ctx.destination)
        audioRefs.current.gainNode = gainNode
      }
    }
    
    initAudio()
    
    return () => {
      // Cleanup audio on component unmount
      if (audioContext) {
        audioContext.close()
      }
    }
  }, [audioContext])

  // Create synthetic water sound using oscillators and noise
  const createWaterSound = (ctx: AudioContext) => {
    // Create white noise for water base
    const bufferSize = ctx.sampleRate * 4 // 4 seconds of audio
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    
    // Generate flowing water-like noise
    for (let i = 0; i < bufferSize; i++) {
      // Combine different noise patterns for realistic water sound
      const whiteNoise = Math.random() * 2 - 1
      const flowPattern = Math.sin(i * 0.001) * 0.3
      const bubbleEffect = Math.sin(i * 0.01) * Math.random() * 0.2
      
      data[i] = (whiteNoise * 0.5 + flowPattern + bubbleEffect) * 0.3
    }
    
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    
    // Add filtering to make it sound more like water
    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.setValueAtTime(800, ctx.currentTime) // Filter high frequencies
    
    const highpass = ctx.createBiquadFilter()
    highpass.type = 'highpass'
    highpass.frequency.setValueAtTime(100, ctx.currentTime) // Remove very low frequencies
    
    source.connect(lowpass)
    lowpass.connect(highpass)
    highpass.connect(audioRefs.current.gainNode!)
    
    return source
  }

  // Create synthetic bird chirping sounds
  const createBirdSound = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 6 // 6 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    
    // Generate bird-like chirping patterns
    for (let i = 0; i < bufferSize; i++) {
      let sample = 0
      
      // Create chirping patterns with random timing
      if (Math.random() > 0.999) { // Occasional chirps
        const freq = 800 + Math.random() * 1200 // Bird frequency range
        const decay = Math.exp(-i * 0.0001) // Decay envelope
        sample = Math.sin(2 * Math.PI * freq * i / ctx.sampleRate) * decay * 0.1
      }
      
      data[i] = sample
    }
    
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    
    source.connect(audioRefs.current.gainNode!)
    return source
  }

  // Create gentle breeze sound
  const createBreezeSound = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 8 // 8 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    
    // Generate wind-like sound
    for (let i = 0; i < bufferSize; i++) {
      // Low-frequency noise for wind
      const windNoise = (Math.random() * 2 - 1) * 0.1
      const windPattern = Math.sin(i * 0.0001) * 0.05
      
      data[i] = windNoise + windPattern
    }
    
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    
    // Heavy low-pass filtering for wind effect
    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.setValueAtTime(200, ctx.currentTime)
    
    source.connect(lowpass)
    lowpass.connect(audioRefs.current.gainNode!)
    
    return source
  }

  // Start playing ambient sounds
  const startAmbientSounds = useCallback(() => {
    if (!audioContext || isPlaying) return
    
    try {
      // Resume audio context if suspended (browser requirement)
      if (audioContext.state === 'suspended') {
        audioContext.resume()
      }
      
      // Create and start all sound sources
      audioRefs.current.waterSource = createWaterSound(audioContext)
      audioRefs.current.birdsSource = createBirdSound(audioContext)
      audioRefs.current.breezeSource = createBreezeSound(audioContext)
      
      audioRefs.current.waterSource.start()
      audioRefs.current.birdsSource.start()
      audioRefs.current.breezeSource.start()
      
      setIsPlaying(true)
    } catch (error) {
      console.log('Could not start ambient sounds:', error)
    }
  }, [audioContext, isPlaying])

  // Stop ambient sounds
  const stopAmbientSounds = () => {
    if (audioRefs.current.waterSource) audioRefs.current.waterSource.stop()
    if (audioRefs.current.birdsSource) audioRefs.current.birdsSource.stop()
    if (audioRefs.current.breezeSource) audioRefs.current.breezeSource.stop()
    
    setIsPlaying(false)
  }

  // Auto-start sounds when component mounts (some browsers require user interaction)
  useEffect(() => {
    const handleInteraction = () => {
      startAmbientSounds()
      // Remove listener after first interaction
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }
    
    // Try to start immediately, or wait for user interaction
    startAmbientSounds()
    document.addEventListener('click', handleInteraction)
    document.addEventListener('touchstart', handleInteraction)
    
    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
      stopAmbientSounds()
    }
  }, [audioContext, startAmbientSounds])

  // This component doesn't render any visible elements, just manages audio
  return null
}
