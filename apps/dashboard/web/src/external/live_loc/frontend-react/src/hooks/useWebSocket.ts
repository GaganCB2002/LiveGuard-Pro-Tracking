import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuthStore } from '../store/authStore'

export function useWebSocket(endpoint: string) {
  const [lastMessage, setLastMessage] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const clientRef = useRef<Client | null>(null)
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`http://localhost:8080${endpoint}`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        setConnected(true)
        client.subscribe('/topic/gps/live', (message) => {
          setLastMessage(message.body)
        })
      },
      onDisconnect: () => setConnected(false),
      onStompError: (frame) => console.error('STOMP error:', frame),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })
    client.activate()
    clientRef.current = client
    return () => { client.deactivate() }
  }, [endpoint, token])

  const sendMessage = useCallback((destination: string, body: any) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({ destination, body: JSON.stringify(body) })
    }
  }, [])

  return { lastMessage, connected, sendMessage }
}