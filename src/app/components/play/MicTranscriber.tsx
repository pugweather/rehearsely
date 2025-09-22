'use client'

import { DraftLine } from '@/app/types'
import { useEffect, useRef, useState, useCallback } from 'react'

interface MicTranscriberProps {
  line: DraftLine | null
  listening: boolean
  setSpokenText: React.Dispatch<React.SetStateAction<string | null>>
  onLineSpoken: () => void
}

interface DeepgramResponse {
  channel: {
    alternatives: Array<{
      transcript: string
      confidence: number
    }>
  }
  is_final: boolean
  speech_final: boolean
}

export default function MicTranscriber({ line, listening, setSpokenText, onLineSpoken }: MicTranscriberProps) {
  const [transcript, setTranscript] = useState('')
  const [spokenWordCount, setSpokenWordCount] = useState(0)
  const [expectedWords, setExpectedWords] = useState<string[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const [error, setError] = useState<string | null>(null)

  // Refs for managing connections
  const socketRef = useRef<WebSocket | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const isCleanupRef = useRef(false)

  const MAX_RECONNECT_ATTEMPTS = 5
  const RECONNECT_DELAY = 2000

  // Clean up function
  const cleanup = useCallback(() => {
    console.log('🧹 Starting cleanup...')
    isCleanupRef.current = true
    
    if (mediaRecorderRef.current) {
      console.log('🎙️ Stopping MediaRecorder and removing event listeners')
      
      // Remove ALL event listeners first (this is the key!)
      mediaRecorderRef.current.ondataavailable = null
      mediaRecorderRef.current.onerror = null
      mediaRecorderRef.current.onstart = null
      mediaRecorderRef.current.onstop = null
      
      // Then stop if still recording
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
    mediaRecorderRef.current = null

    if (socketRef.current) {
      console.log('🔌 Closing WebSocket')
      socketRef.current.close(1000, 'Component cleanup')
      socketRef.current = null
    }

    if (mediaStreamRef.current) {
      console.log('📱 Stopping media stream tracks')
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    if (reconnectTimeoutRef.current) {
      console.log('⏰ Clearing reconnect timeout')
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    setConnectionStatus('disconnected')
    setError(null)
    setTranscript('')
    setSpokenWordCount(0)
    console.log('✅ Cleanup complete')
  }, [])

  // Initialize microphone
  const initializeMicrophone = useCallback(async (): Promise<MediaStream> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1
        }
      })
      
      mediaStreamRef.current = stream
      return stream
    } catch (error) {
      console.error('Failed to access microphone:', error)
      setError('Failed to access microphone. Please check permissions.')
      throw error
    }
  }, [])

  // Create WebSocket connection to Deepgram
  const createWebSocketConnection = useCallback((): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY
      if (!apiKey) {
        reject(new Error('Deepgram API key not found'))
        return
      }

      // Use modern WebSocket connection with proper headers
      const socket = new WebSocket('wss://api.deepgram.com/v1/listen', ['token', apiKey])
      
      const connectTimeout = setTimeout(() => {
        socket.close()
        reject(new Error('Connection timeout'))
      }, 10000)

      socket.onopen = () => {
        clearTimeout(connectTimeout)
        console.log('✅ Deepgram WebSocket connected')
        setConnectionStatus('connected')
        setError(null)
        reconnectAttemptsRef.current = 0
        
        // Send configuration message
        socket.send(JSON.stringify({
          type: 'Configure',
          processors: {
            vad: {
              silence_threshold: 0.5
            }
          }
        }))
        
        resolve(socket)
      }

      socket.onerror = (error) => {
        clearTimeout(connectTimeout)
        console.error('❌ Deepgram WebSocket error:', error)
        setConnectionStatus('error')
        setError('WebSocket connection failed')
        reject(error)
      }

      socket.onclose = (event) => {
        clearTimeout(connectTimeout)
        console.log('🔌 Deepgram WebSocket closed:', event.code, event.reason)
        
        if (!isCleanupRef.current && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          setConnectionStatus('connecting')
          reconnectAttemptsRef.current++
          console.log(`🔄 Attempting to reconnect... (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            initializeConnection()
          }, RECONNECT_DELAY)
        } else {
          setConnectionStatus('disconnected')
          if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
            setError('Failed to reconnect after multiple attempts')
          }
        }
      }

      socket.onmessage = (event) => {
        try {
            console.log("hey")
          const data: DeepgramResponse = JSON.parse(event.data)
          
          if (data.channel?.alternatives?.[0]?.transcript) {
            const transcriptText = data.channel.alternatives[0].transcript
            
            if (transcriptText.trim()) {
              console.log('🎤 Transcript:', transcriptText, '| Final:', data.is_final)
              
              // Update spoken text for real-time feedback
              setSpokenText(transcriptText)
              
              // Handle transcript updates - fix duplication issue
              if (data.is_final) {
                // Only add final results to permanent transcript
                setTranscript(prev => {
                  // Don't add if it's already there (prevents duplication)
                  if (prev.trim().endsWith(transcriptText.trim())) {
                    return prev
                  }
                  return prev + transcriptText + ' '
                })
                processTranscript(transcriptText)
              } else {
                // Show interim results without adding to permanent transcript
                // This is just for live feedback, don't accumulate
                console.log('📝 Interim result:', transcriptText)
              }
            }
          }
        } catch (error) {
          console.error('Error parsing Deepgram response:', error)
        }
      }

      socketRef.current = socket
    })
  }, [])

  // Process final transcript for line matching
  const processTranscript = useCallback((transcriptText: string) => {
    if (!expectedWords.length) return

    const spokenWords = transcriptText
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim()
      .split(/\s+/)

    let matchCount = 0
    for (let i = 0; i < Math.min(spokenWords.length, expectedWords.length); i++) {
      if (expectedWords[i] === spokenWords[i]) {
        matchCount++
      } else {
        break
      }
    }

    setSpokenWordCount(matchCount)

    // Check if line is complete
    if (matchCount >= expectedWords.length && expectedWords.length > 0) {
      console.log('✅ Line completed!')
      onLineSpoken()
    }
  }, [expectedWords, onLineSpoken])

  // Setup media recorder
  const setupMediaRecorder = useCallback((stream: MediaStream, socket: WebSocket) => {
    try {
      // Try different MIME types for better compatibility
      let mimeType = 'audio/webm;codecs=opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm'
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4'
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = '' // Let browser choose
          }
        }
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
        audioBitsPerSecond: 16000
      })

      recorder.ondataavailable = (event) => {
        console.log(`🎵 Audio data available: ${event.data.size} bytes, type: ${event.data.type}`)
        if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
          console.log(`📤 Actually sending ${event.data.size} bytes to Deepgram`)
          socket.send(event.data)
          console.log(`✅ Send completed`)
        } else {
          console.log(`❌ Cannot send: size=${event.data.size}, socketState=${socket.readyState}`)
        }
      }

      recorder.onerror = (error) => {
        console.error('MediaRecorder error:', error)
        setError('Audio recording failed')
      }

      mediaRecorderRef.current = recorder
      return recorder
    } catch (error) {
      console.error('Failed to create MediaRecorder:', error)
      setError('Failed to initialize audio recording')
      throw error
    }
  }, [])

  // Initialize complete connection
  const initializeConnection = useCallback(async () => {
    if (isCleanupRef.current) return

    try {
      setConnectionStatus('connecting')
      setError(null)

      const stream = await initializeMicrophone()
      const socket = await createWebSocketConnection()
      setupMediaRecorder(stream, socket)

      console.log('🎉 Deepgram connection fully initialized')
    } catch (error) {
      console.error('Failed to initialize connection:', error)
      setConnectionStatus('error')
      setError(error instanceof Error ? error.message : 'Connection failed')
    }
  }, [initializeMicrophone, createWebSocketConnection, setupMediaRecorder])

  // Initialize connection on mount and cleanup on unmount
  useEffect(() => {
    console.log('🎬 MicTranscriber component mounted - initializing connection')
    isCleanupRef.current = false
    initializeConnection()
    
    // This cleanup runs when component unmounts (switching back to editor)
    return () => {
      console.log('🎬 MicTranscriber component unmounting - running cleanup')
      cleanup()
    }
  }, [initializeConnection, cleanup])

  // Update expected words when line changes
  useEffect(() => {
    if (!line?.text) {
      setExpectedWords([])
      return
    }

    const cleanWords = line.text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)

    setExpectedWords(cleanWords)
    setTranscript('')
    setSpokenWordCount(0)
    console.log('📝 Expected words:', cleanWords)
  }, [line])

  // Handle listening state changes - with proper timing
  useEffect(() => {
    const startRecordingWhenReady = () => {
      const recorder = mediaRecorderRef.current
      const socket = socketRef.current

      console.log(`🎛️ Listening state changed: ${listening}`)
      console.log(`🎙️ Recorder state: ${recorder?.state || 'null'}`)
      console.log(`🔌 Socket state: ${socket?.readyState || 'null'}`)
      console.log(`🔗 Connection status: ${connectionStatus}`)

      if (listening) {
        if (!recorder || !socket || socket.readyState !== WebSocket.OPEN) {
          console.log(`⏳ Waiting for connection... recorder=${!!recorder}, socket=${!!socket}, socketReady=${socket?.readyState === WebSocket.OPEN}`)
          
          // If connection isn't ready yet, wait and try again
          if (connectionStatus === 'connecting') {
            setTimeout(startRecordingWhenReady, 100)
            return
          } else {
            console.log(`❌ Cannot start recording: connection not ready`)
            return
          }
        }

        if (recorder.state === 'inactive') {
          console.log('🎤 Starting recording with 100ms chunks...')
          recorder.start(100) // Send data every 100ms
          console.log(`🎤 Recording started, state is now: ${recorder.state}`)
        } else {
          console.log(`🎤 Recorder already in state: ${recorder.state}`)
        }
      } else {
        // When listening stops, stop recording but keep connection for potential restart
        if (recorder && recorder.state === 'recording') {
          console.log('⏸️ Stopping recording...')
          recorder.stop()
        }
      }
    }

    startRecordingWhenReady()
  }, [listening, connectionStatus])

  // Get status color
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600'
      case 'connecting': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // Get status text
  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '🟢 Connected'
      case 'connecting': return '🟡 Connecting...'
      case 'error': return '🔴 Error'
      default: return '⚫ Disconnected'
    }
  }

  return (
    <div className="p-4 border rounded-lg max-w-lg bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">🎤 Speak Your Line</h2>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <div className="mb-3">
        <p className="text-gray-600 mb-1 text-sm">Your line:</p>
        <p className="text-lg leading-relaxed">
          {expectedWords.map((word, i) => (
            <span
              key={i}
              className={`transition-colors duration-200 ${
                i < spokenWordCount 
                  ? 'font-bold text-green-600 bg-green-50 px-1 rounded' 
                  : 'text-gray-400'
              }`}
            >
              {word}{' '}
            </span>
          ))}
        </p>
      </div>

      <hr className="my-3 border-gray-200" />
      
      <div className="space-y-2">
        <p className="text-gray-500 text-sm">
          Progress: <span className="font-medium">{spokenWordCount}/{expectedWords.length} words</span>
        </p>
        <p className="text-gray-500 text-sm">
          Live transcript: 
          <span className="font-mono text-xs ml-2 p-1 bg-gray-50 rounded">
            {transcript || 'Waiting for speech...'}
          </span>
        </p>
      </div>

      {connectionStatus === 'error' && (
        <button
          onClick={initializeConnection}
          className="mt-3 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
        >
          Retry Connection
        </button>
      )}
    </div>
  )
}
