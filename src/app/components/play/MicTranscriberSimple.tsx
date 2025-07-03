// 'use client'

// import { useEffect, useRef, useState } from 'react'

// export default function MicTranscriberSimple() {
//   const [status, setStatus] = useState('Connecting...')
//   const [transcript, setTranscript] = useState('')

//   const socketRef = useRef<WebSocket | null>(null)
//   const streamRef = useRef<MediaStream | null>(null)
//   const recorderRef = useRef<MediaRecorder | null>(null)

//   useEffect(() => {
//     const start = async () => {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
//       const socket = new WebSocket(
//         'wss://api.deepgram.com/v1/listen',
//         ['token', process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY || '']
//       )

//       streamRef.current = stream
//       socketRef.current = socket

//       socket.onopen = () => {
//         console.log({ event: 'onopen' })
//         setStatus('Connected')

//         const recorder = new MediaRecorder(stream)
//         recorder.ondataavailable = (event) => {
//           if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
//             socket.send(event.data)
//           }
//         }
//         recorder.start(250)
//         recorderRef.current = recorder
//       }

//       socket.onmessage = (message) => {
//         console.log({ event: 'onmessage', message })
//         const received = JSON.parse(message.data)
//         const spoken = received.channel?.alternatives?.[0]?.transcript || ''
//         if (spoken && received.is_final) {
//           setTranscript(prev => prev + spoken + ' ')
//         }
//       }

//       socket.onclose = () => {
//         console.log({ event: 'onclose' })
//         setStatus('Disconnected')
//       }

//       socket.onerror = (error) => {
//         console.log({ event: 'onerror', error })
//         setStatus('Error')
//       }
//     }

//     start()

//     return () => {
//       recorderRef.current?.stop()
//       socketRef.current?.close()
//       streamRef.current?.getTracks().forEach(t => t.stop())
//     }
//   }, [])

//   return (
//     <div className="p-4 border rounded max-w-lg">
//       <h2 className="text-lg font-bold mb-2">🎙️ Deepgram Live Transcript</h2>
//       <p className="text-sm mb-2 text-gray-500">Status: {status}</p>
//       <div className="p-3 border rounded bg-gray-50 text-sm font-mono min-h-[80px]">
//         {transcript || 'Waiting for input...'}
//       </div>
//     </div>
//   )
// }
