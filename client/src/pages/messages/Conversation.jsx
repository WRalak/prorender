import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { chatAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MessageBubble from '../../components/chat/MessageBubble';
import TypingIndicator from '../../components/chat/TypingIndicator';
import { formatDate } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const Conversation = () => {
  const { user } = useAuth();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const socket = useSocket();
  const messagesEndRef = useRef(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const { data: conversation, isLoading, error } = useQuery(
    ['conversation', conversationId],
    () => chatAPI.getConversation(conversationId),
    {
      enabled: !!conversationId,
      onError: () => {
        toast.error('Conversation not found');
        navigate('/messages');
      },
    }
  );

  const { data: messages, isLoading: messagesLoading } = useQuery(
    ['messages', conversationId],
    () => chatAPI.getMessages(conversationId),
    {
      enabled: !!conversationId,
    }
  );

  const sendMessageMutation = useMutation(
    ({ conversationId, content, type = 'text' }) => chatAPI.sendMessage(conversationId, content, type),
    {
      onSuccess: (newMessage) => {
        // Update messages cache
        queryClient.setQueryData(['messages', conversationId], (oldData) => {
          if (oldData) {
            return {
              ...oldData,
              data: [...(oldData.data || []), newMessage],
            };
          }
          return oldData;
        });
        setMessage('');
      },
      onError: () => {
        toast.error('Failed to send message');
      },
    }
  );

  const markAsReadMutation = useMutation(
    (conversationId) => chatAPI.markAsRead(conversationId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['conversations']);
        queryClient.invalidateQueries(['unreadCount']);
      },
    }
  );

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark conversation as read
  useEffect(() => {
    if (conversation && conversation.unreadCount > 0) {
      markAsReadMutation.mutate(conversationId);
    }
  }, [conversation, conversationId]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !conversationId) return;

    // Listen for new messages
    const handleNewMessage = (data) => {
      if (data.conversationId === conversationId) {
        queryClient.setQueryData(['messages', conversationId], (oldData) => {
          if (oldData) {
            return {
              ...oldData,
              data: [...(oldData.data || []), data.message],
            };
          }
          return oldData;
        });
      }
    };

    // Listen for typing indicators
    const handleTyping = (data) => {
      if (data.conversationId === conversationId && data.userId !== user.id) {
        setOtherUserTyping(true);
      }
    };

    const handleStopTyping = (data) => {
      if (data.conversationId === conversationId && data.userId !== user.id) {
        setOtherUserTyping(false);
      }
    };

    const handleMessageRead = (data) => {
      if (data.conversationId === conversationId) {
        queryClient.setQueryData(['messages', conversationId], (oldData) => {
          if (oldData) {
            return {
              ...oldData,
              data: oldData.data?.map(msg => 
                msg._id === data.messageId ? { ...msg, read: true } : msg
              ) || [],
            };
          }
          return oldData;
        });
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('typing:start', handleTyping);
    socket.on('typing:stop', handleStopTyping);
    socket.on('message:read', handleMessageRead);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('typing:start', handleTyping);
      socket.off('typing:stop', handleStopTyping);
      socket.off('message:read', handleMessageRead);
    };
  }, [socket, conversationId, user.id, queryClient]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      conversationId,
      content: message.trim(),
      type: 'text',
    });
  };

  const handleTypingStart = () => {
    if (!isTyping && socket) {
      setIsTyping(true);
      socket.emit('typing:start', { conversationId });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (socket) {
        socket.emit('typing:stop', { conversationId });
      }
    }, 1000);
  };

  const handleTypingStop = () => {
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (socket) {
      socket.emit('typing:stop', { conversationId });
    }
  };

  const getOtherUser = () => {
    if (!conversation || !user) return null;
    return conversation.participants.find(p => p._id !== user.id);
  };

  const formatLastMessage = (message) => {
    if (!message) return 'No messages yet';
    
    const text = message.content;
    if (text.length > 50) {
      return text.substring(0, 47) + '...';
    }
    return text;
  };

  if (isLoading || messagesLoading) {
    return <LoadingSpinner size="large" text="Loading conversation..." />;
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Conversation not found</h2>
          <p className="mt-2 text-gray-600">
            The conversation you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/messages">
            <Button className="mt-4">Back to Messages</Button>
          </Link>
        </div>
      </div>
    );
  }

  const otherUser = getOtherUser();
  const messageList = messages?.data || [];

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6">
        <div className="flex items-center">
          <Link to="/messages" className="mr-4">
            <ArrowLeftIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </Link>
          <div className="flex-shrink-0">
            {otherUser?.profile?.avatar ? (
              <img
                src={otherUser.profile.avatar}
                alt={otherUser.name}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-gray-600" />
              </div>
            )}
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center">
              <h3 className="text-sm font-medium text-gray-900">
                {otherUser?.name || 'Unknown User'}
              </h3>
              {otherUser?.isOnline && (
                <div className="ml-2 h-2 w-2 bg-green-400 rounded-full"></div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {otherUser?.isOnline ? 'Active now' : `Last seen ${formatDate(otherUser.lastSeen)}`}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        {messageList.length === 0 ? (
          <div className="text-center py-8">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start the conversation with a message
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messageList.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={message.sender._id === user.id}
                senderName={message.sender.name}
                senderAvatar={message.sender.profile?.avatar}
              />
            ))}
            {otherUserTyping && (
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {otherUser?.profile?.avatar ? (
                    <img
                      src={otherUser.profile.avatar}
                      alt={otherUser.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 sm:px-6">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="small"
            className="p-2"
          >
            <PaperClipIcon className="h-5 w-5 text-gray-400" />
          </Button>
          <div className="flex-1">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onInput={handleTypingStart}
              onBlur={handleTypingStop}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isLoading}
            className="p-2"
          >
            <PaperAirplaneIcon className="h-5 w-5 text-gray-400" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
