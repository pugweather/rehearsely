'use client'

import { Line } from '@/app/types'
import { useEffect, useRef, useState } from 'react'

interface MicTranscriberProps {
  line: Line | null
  listening: boolean
  setSpokenText: React.Dispatch<React.SetStateAction<string | null>>;
  onLineSpoken: () => void
}

export default function MicTranscriber({ line, listening, setSpokenText, onLineSpoken }: MicTranscriberProps) {
  const [transcript, setTranscript] = useState('')
  const [spokenWordCount, setSpokenWordCount] = useState(0)
  const [expectedWords, setExpectedWords] = useState<string[]>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Setup socket + mic ONCE using legacy 'token' protocol
  useEffect(() => {
    console.log("stujfgiewsgjnsrgjdsrfiugjndrgb")
    const setup = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const socket = new WebSocket(
          'wss://api.deepgram.com/v1/listen',
          ['token', process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY || '']
        )

        streamRef.current = stream
        socketRef.current = socket

        socket.onopen = () => {
          console.log('✅ WebSocket opened (via protocol)')
        }

        socket.onmessage = (message) => {
          const data = JSON.parse(message.data)
          const transcriptText = data.channel?.alternatives?.[0]?.transcript || ''
          if (!transcriptText) return

          // console.log('You said:', transcriptText)
          setSpokenText(transcriptText)
          setTranscript(prev => (data.is_final ? prev + transcriptText + ' ' : transcriptText))

          const spokenWords = transcriptText.trim().split(/\s+/)
          let matchCount = 0

          for (let i = 0; i < spokenWords.length; i++) {
            const expected = expectedWords[i]
            const actual = spokenWords[i]?.toLowerCase().replace(/[^\w]/g, '')
            if (expected === actual) matchCount++
            else break
          }

          setSpokenWordCount(matchCount)

          if (matchCount >= expectedWords.length && expectedWords.length > 0 && data.is_final) {
            onLineSpoken()
          }
        }

        socket.onerror = (err) => console.error('WebSocket error:', err)
        socket.onclose = () => console.log('WebSocket closed')
      } catch (err) {
        console.error('Mic or socket setup failed:', err)
      }
    }

    setup()

    return () => {
      mediaRecorderRef.current?.stop()
      socketRef.current?.close()
      streamRef.current?.getTracks().forEach(track => track.stop())
    }
  }, [])

  // Update expected words each time the line changes
  useEffect(() => {
    if (!line?.text) return
    const cleanWords = line.text
      .split(' ')
      .map(word => word.toLowerCase().replace(/[^\w]/g, ''))
    setExpectedWords(cleanWords)
    setTranscript('')
    setSpokenWordCount(0)
  }, [line])

  // Start/stop sending audio when listening changes
  useEffect(() => {
    const socket = socketRef.current
    const stream = streamRef.current

    if (!socket || !stream) return

    if (listening) {
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000,
      })

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
          socket.send(event.data)
        }
      }

      recorder.start(250)
      mediaRecorderRef.current = recorder
    } else {
      mediaRecorderRef.current?.stop()
    }
  }, [listening])

  return (
    <div className="p-4 border rounded max-w-lg">
      <h2 className="text-lg font-semibold mb-3">🎤 Speak Your Line</h2>
      <p className="text-gray-600 mb-1">Your line:</p>
      <p className="text-lg">
        {expectedWords.map((word, i) => (
          <span
            key={i}
            className={i < spokenWordCount ? 'font-bold text-black' : 'text-gray-400'}
          >
            {word}{' '}
          </span>
        ))}
      </p>
      <hr className="my-4" />
      <p className="text-gray-500 text-sm">
        Transcript: <span className="font-mono">{transcript}</span>
      </p>
    </div>
  )
}
