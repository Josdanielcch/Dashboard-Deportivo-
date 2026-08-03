'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface Notification {
  id: any
  customer_name: string
  court_name: string
  start_time: string
  end_time: string
  created_at: string
  [key: string]: any
}

interface SocketContextType {
  socket: Socket | null
  connected: boolean
  notifications: Notification[]
  clearNotification: (id: any) => void
  clearAllNotifications: () => void
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  notifications: [],
  clearNotification: () => {},
  clearAllNotifications: () => {},
})

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://aplication-backend-production-82c0.up.railway.app'

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const notificationsRef = useRef<Notification[]>([])

  useEffect(() => {
    console.log('[Socket] Conectando a:', SOCKET_URL)
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    })

    socketInstance.on('connect', () => {
      console.log('[Socket] Conectado:', socketInstance.id)
      setConnected(true)
      socketInstance.emit('join-dashboard')
    })

    socketInstance.on('disconnect', () => {
      console.log('[Socket] Desconectado')
      setConnected(false)
    })

    socketInstance.on('connect_error', (err) => {
      console.error('[Socket] Error de conexión:', err.message)
    })

    socketInstance.on('new-booking', (data: Notification) => {
      console.log('[Socket] Nueva reserva recibida:', data)
      setNotifications(prev => {
        const exists = prev.find(n => n.id === data.id)
        if (exists) return prev
        return [data, ...prev].slice(0, 50)
      })
    })

    socketInstance.on('booking-status-changed', (data) => {
      console.log('[Socket] Estado cambiado:', data)
    })

    setSocket(socketInstance)

    return () => {
      console.log('[Socket] Limpiando conexión')
      socketInstance.disconnect()
    }
  }, [])

  const clearNotification = useCallback((id: any) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <SocketContext.Provider value={{ socket, connected, notifications, clearNotification, clearAllNotifications }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
