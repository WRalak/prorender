'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useSocket } from '../../contexts/SocketContext'
import { Conversation, Message } from '../../lib/types'
import { 
  ChatBubbleLeftRightIcon, 
  UserIcon, 
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline'

export default function MessagesPage() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchConversations()
  }, [user])

  useEffect(() => {
    if (socket) {
      socket.on('new_message', handleNewMessage)
      socket.on('message_read', handleMessageRead)
      socket.on('user_typing', handleUserTyping)
      socket.on('user_stop_typing', handleUserStopTyping)

      return () => {
        socket.off('new_message')
        socket.off('message_read')
        socket.off('user_typing')
        socket.off('user_stop_typing')
      }
    }
  }, [socket, selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/messages/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
        markMessagesAsRead(conversationId)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    fetchMessages(conversation.id)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: newMessage.trim(),
          type: 'text'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, data.message])
        setNewMessage('')
        
        // Emit via socket for real-time
        if (socket) {
          socket.emit('send_message', {
            conversationId: selectedConversation.id,
            message: data.message
          })
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedConversation) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('conversationId', selectedConversation.id)

      const token = localStorage.getItem('token')
      const response = await fetch('/api/messages/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, data.message])
        
        if (socket) {
          socket.emit('send_message', {
            conversationId: selectedConversation.id,
            message: data.message
          })
        }
      }
    } catch (error) {
      console.error('Failed to upload file:', error)
    }
  }

  const handleTyping = () => {
    if (socket && selectedConversation) {
      socket.emit('typing', {
        conversationId: selectedConversation.id,
        userId: user?.id
      })
    }
  }

  const handleStopTyping = () => {
    if (socket && selectedConversation) {
      socket.emit('stop_typing', {
        conversationId: selectedConversation.id,
        userId: user?.id
      })
    }
  }

  const handleNewMessage = (data: any) => {
    if (selectedConversation && data.conversationId === selectedConversation.id) {
      setMessages(prev => [...prev, data.message])
    } else {
      // Update conversation list
      setConversations(prev => prev.map(conv => 
        conv.id === data.conversationId 
          ? { ...conv, lastMessage: data.message, unreadCount: conv.unreadCount + 1 }
          : conv
      ))
    }
  }

  const handleMessageRead = (data: any) => {
    setConversations(prev => prev.map(conv => 
      conv.id === data.conversationId 
        ? { ...conv, unreadCount: 0 }
        : conv
    ))
  }

  const handleUserTyping = (data: any) => {
    if (data.userId !== user?.id) {
      setTypingUsers(prev => new Set(prev).add(data.userId))
    }
  }

  const handleUserStopTyping = (data: any) => {
    setTypingUsers(prev => {
      const newSet = new Set(prev)
      newSet.delete(data.userId)
      return newSet
    })
  }

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/messages/conversations/${conversationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const filteredConversations = conversations.filter(conv =>
    conv.participants.some(p => 
      p.name.first.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.last.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== user?.id)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    )
  }

  return (
      <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-8rem)]">
        <div className="bg-white rounded-lg shadow-md h-full flex">
          {/* Conversations List */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => {
                  const otherUser = getOtherParticipant(conversation)
                  return (
                    <div
                      key={conversation.id}
                      onClick={() => selectConversation(conversation)}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                        selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0">
                          {otherUser?.profile?.avatar ? (
                            <img
                              src={otherUser.profile.avatar}
                              alt={otherUser.name.first}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-900 truncate">
                              {otherUser?.name.first} {otherUser?.name.last}
                            </h3>
                            <span className="text-xs text-gray-500 ml-2">
                              {conversation.lastMessage && formatTime(conversation.lastMessage.createdAt)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage?.content || 'No messages yet'}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full ml-2">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Messages Area */}
          {selectedConversation ? (
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center">
                  {getOtherParticipant(selectedConversation)?.profile?.avatar ? (
                    <img
                      src={getOtherParticipant(selectedConversation)?.profile?.avatar}
                      alt={getOtherParticipant(selectedConversation)?.name.first}
                      className="h-8 w-8 rounded-full mr-3"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                      <UserIcon className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {getOtherParticipant(selectedConversation)?.name.first} {getOtherParticipant(selectedConversation)?.name.last}
                    </h3>
                    {selectedConversation.property && (
                      <p className="text-sm text-gray-500">
                        About: {selectedConversation.property.title}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === user?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      {message.type === 'file' ? (
                        <div>
                          <a
                            href={message.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2"
                          >
                            <PaperClipIcon className="h-4 w-4" />
                            <span>{message.fileName}</span>
                          </a>
                        </div>
                      ) : (
                        <p>{message.content}</p>
                      )}
                      <p className={`text-xs mt-1 ${
                        message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {typingUsers.size > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <PaperClipIcon className="h-5 w-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    onFocus={handleTyping}
                    onBlur={handleStopTyping}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
}
