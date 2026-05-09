'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import io, { Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

interface SocketContextType {
  socket: Socket | null
  connected: boolean
  connect: () => void
  disconnect: () => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      connectSocket()
    }

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [user])

  const connectSocket = () => {
    const token = localStorage.getItem('token')
    if (!token) return

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token
      }
    })

    newSocket.on('connect', () => {
      console.log('Connected to socket server')
      setConnected(true)
      setSocket(newSocket)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server')
      setConnected(false)
      setSocket(null)
    })

    newSocket.on('error', (error) => {
      console.error('Socket error:', error)
      toast.error('Connection error')
    })

    newSocket.on('new_message', (data) => {
      // Handle new message
      toast.success('New message received')
    })

    newSocket.on('notification', (data) => {
      // Handle new notification
      toast.success(data.message)
    })

    newSocket.on('application_update', (data) => {
      // Handle application status update
      toast(`Application ${data.status}`, {
        icon: 'ℹ️',
      })
    })

    newSocket.on('payment_received', (data) => {
      // Handle payment confirmation
      toast.success('Payment received successfully')
    })
  }

  const disconnect = () => {
    if (socket) {
      socket.disconnect()
    }
  }

  const value: SocketContextType = {
    socket,
    connected,
    connect: connectSocket,
    disconnect
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
