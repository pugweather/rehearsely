'use client'

import { DraftLine } from '@/app/types'
import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk'

interface MicTranscriberProps {
  line: DraftLine | null
  listening: boolean
  setSpokenText: React.Dispatch<React.SetStateAction<string | null>>
  onLineSpoken: () => void
}

export default function MicTranscriberFixed({ line, listening, setSpokenText, onLineSpoken }: MicTranscriberProps) {
  const [transcript, setTranscript] = useState('')
  const [spokenWordCount, setSpokenWordCount] = useState(0)
  const [expectedWords, setExpectedWords] = useState<string[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const [error, setError] = useState<string | null>(null)

  // Refs for managing connections
  const connectionRef = useRef<any>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const isCleanupRef = useRef(false)

  // Clean up function
  const cleanup = useCallback(() => {
    isCleanupRef.current = true
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    mediaRecorderRef.current = null

    if (connectionRef.current) {
      connectionRef.current.finish()
      connectionRef.current = null
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    setConnectionStatus('disconnected')
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
      console.log('✅ Microphone access granted')
      return stream
    } catch (error) {
      console.error('Failed to access microphone:', error)
      setError('Failed to access microphone. Please check permissions.')
      throw error
    }
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

  // Setup media recorder for Deepgram connection
  const setupMediaRecorder = useCallback((stream: MediaStream, connection: any) => {
    try {
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0 && connection) {
          console.log(`📤 Sending audio chunk: ${event.data.size} bytes`)
          connection.send(event.data)
        }
      }

      recorder.onerror = (error) => {
        console.error('MediaRecorder error:', error)
        setError('Audio recording failed')
      }

      recorder.onstart = () => {
        console.log('🎙️ Recording started')
      }

      recorder.onstop = () => {
        console.log('⏹️ Recording stopped')
      }

      mediaRecorderRef.current = recorder
      return recorder
    } catch (error) {
      console.error('Failed to create MediaRecorder:', error)
      setError('Failed to initialize audio recording')
      throw error
    }
  }, [])

  // Initialize Deepgram connection
  const initializeConnection = useCallback(async () => {
    if (isCleanupRef.current) return

    try {
      setConnectionStatus('connecting')
      setError(null)

      // Get microphone access
      const stream = await initializeMicrophone()

      // Create Deepgram client
      const deepgram = createClient(process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY!)

      // Create live transcription connection
      const connection = deepgram.listen.live({
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        interim_results: true,
        endpointing: 300,
        vad_events: true
      })

      connectionRef.current = connection

      // Set up event listeners
      connection.on(LiveTranscriptionEvents.Open, () => {
        console.log('✅ Deepgram connection opened')
        setConnectionStatus('connected')
        setError(null)

        // Setup media recorder after connection is open
        setupMediaRecorder(stream, connection)
      })

      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        const transcript = data.channel?.alternatives?.[0]?.transcript
        if (transcript && transcript.trim()) {
          console.log('🎤 Transcript:', transcript, '| Final:', data.is_final)
          
          // Update spoken text for real-time feedback
          setSpokenText(transcript)
          
          // Handle transcript updates
          if (data.is_final) {
            setTranscript(prev => prev + transcript + ' ')
            processTranscript(transcript)
          } else {
            // Show interim results
            setTranscript(prev => {
              const finalPart = prev.substring(0, prev.lastIndexOf(' ') + 1)
              return finalPart + transcript
            })
          }
        }
      })

      connection.on(LiveTranscriptionEvents.Close, () => {
        console.log('🔌 Deepgram connection closed')
        setConnectionStatus('disconnected')
      })

      connection.on(LiveTranscriptionEvents.Error, (error) => {
        console.error('❌ Deepgram error:', error)
        setConnectionStatus('error')
        setError('Deepgram connection failed')
      })

      connection.on(LiveTranscriptionEvents.Metadata, (data) => {
        console.log('📊 Metadata:', data)
      })

      console.log('🎉 Deepgram connection initialized')
    } catch (error) {
      console.error('Failed to initialize connection:', error)
      setConnectionStatus('error')
      setError(error instanceof Error ? error.message : 'Connection failed')
    }
  }, [initializeMicrophone, setupMediaRecorder, processTranscript, setSpokenText])

  // Initialize connection on mount
  useEffect(() => {
    isCleanupRef.current = false
    initializeConnection()
    return cleanup
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

  // Handle listening state changes
  useEffect(() => {
    const recorder = mediaRecorderRef.current

    if (!recorder) {
      return
    }

    if (listening) {
      if (recorder.state === 'inactive') {
        console.log('🎤 Starting recording...')
        recorder.start(100) // Send data every 100ms
      }
    } else {
      if (recorder.state === 'recording') {
        console.log('⏸️ Stopping recording...')
        recorder.stop()
      }
    }
  }, [listening])

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
        <h2 className="text-lg font-semibold">🎤 Speak Your Line (SDK Version)</h2>
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
