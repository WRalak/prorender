import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, PaperClipIcon, FaceSmileIcon, PaperClipIcon as PaperClipIconSolid } from '@heroicons/react/24/outline';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import EmojiPicker from './EmojiPicker';
import FileAttachment from './FileAttachment';

const ChatWindow = ({ conversationId, recipient, onBack, onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileAttachment, setShowFileAttachment] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const { user } = useAuth();
  const { socket } = useSocket();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle socket events
  useEffect(() => {
    if (!socket || !conversationId) return;

    // Join conversation room
    socket.joinRoom(conversationId);

    // Listen for new messages
    const handleNewMessage = (data) => {
      if (data.conversationId === conversationId) {
        setMessages(prev => [...prev, data.message]);
        
        // Mark message as read if it's not from current user
        if (data.message.sender._id !== user._id) {
          socket.markMessageAsRead(data.message._id);
        }
      }
    };

    // Listen for typing indicators
    const handleTypingStart = (data) => {
      if (data.conversationId === conversationId && data.userId !== user._id) {
        setIsTyping(true);
      }
    };

    const handleTypingStop = (data) => {
      if (data.conversationId === conversationId && data.userId !== user._id) {
        setIsTyping(false);
      }
    };

    // Listen for message read receipts
    const handleMessageRead = (data) => {
      if (data.conversationId === conversationId) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === data.messageId 
              ? { ...msg, read: true }
              : msg
          )
        );
      }
    };

    // Listen for user online status
    const handleUserStatus = (data) => {
      if (data.userId === recipient?._id) {
        setIsOnline(data.isOnline);
        setLastSeen(data.lastSeen);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);
    socket.on('message_read', handleMessageRead);
    socket.on('user_status', handleUserStatus);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
      socket.off('message_read', handleMessageRead);
      socket.off('user_status', handleUserStatus);
      socket.leaveRoom(conversationId);
    };
  }, [socket, conversationId, user._id, recipient?._id]);

  // Focus input when chat window opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!message.trim() && !showFileAttachment) return;

    let messageData = {
      conversationId,
      content: message.trim(),
      type: 'text',
    };

    // Handle file attachment
    if (showFileAttachment && fileInputRef.current?.files.length > 0) {
      const file = fileInputRef.current.files[0];
      messageData = {
        ...messageData,
        type: 'file',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      };
    }

    // Send message
    socket.sendMessage(messageData);
    setMessage('');
    setShowFileAttachment(false);
    
    // Stop typing indicator
    socket.stopTyping(conversationId);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (e.target.value.length > 0 && !isTyping) {
      socket.startTyping(conversationId);
      setIsTyping(true);
    } else if (e.target.value.length === 0 && isTyping) {
      socket.stopTyping(conversationId);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleFileSelect = (files) => {
    if (files.length > 0) {
      const file = files[0];
      const fileName = file.name;
      const fileSize = (file.size / 1024 / 1024).toFixed(2); // Convert to MB
      
      // Validate file size (max 10MB)
      if (fileSize > 10) {
        alert('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!allowedTypes.includes(file.type)) {
        alert('File type not supported');
        return;
      }

      setShowFileAttachment(true);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 w-80">
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                {recipient?.profile?.avatar ? (
                  <img
                    src={recipient.profile.avatar}
                    alt={recipient?.name?.first}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium text-gray-600">
                    {recipient?.name?.first?.[0] || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {recipient?.name?.first} {recipient?.name?.last}
                </p>
              </div>
            </div>
            <button
              onClick={handleMaximize}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h8M4 8l8 0m-8 0v8m0 0h8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-4 z-50 w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              {recipient?.profile?.avatar ? (
                <img
                  src={recipient?.profile.avatar}
                  alt={recipient?.name?.first}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-xs font-medium text-gray-600">
                  {recipient?.name?.first?.[0] || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {recipient?.name?.first} {recipient?.name?.last}
              </p>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-xs text-gray-500">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleMinimize}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h8M4 8l8 0m-8 0v8m0 0h8" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12M11 11V6a3 3 0 01-3 3H6a3 3 0 01-3-3V4a3 3 0 013 3 3v1a3 3 0 013 3 3h6a3 3 0 013-3-3V4a3 3 0 013-3-3H6a3 3 0 01-3-3V4a3 3 0 013 3 3v1a3 3 0 013 3 3h6a3 3 0 013-3-3V4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-2">
        {messages.map((message, index) => (
          <MessageBubble
            key={message._id}
            message={message}
            isOwn={message.sender._id === user._id}
            showAvatar={index === 0 || messages[index - 1]?.sender._id !== messages[index]?.sender._id}
          />
        ))}
        
        {isTyping && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <TypingIndicator />
            <span>Someone is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      <div className="px-4 pb-2">
        {isTyping && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <TypingIndicator />
            <span>Someone is typing...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage}>
          <div className="flex items-end space-x-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FaceSmileIcon className="h-5 w-5 text-gray-600" />
            </button>
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <PaperClipIcon className="h-5 w-5 text-gray-600" />
            </button>
            
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-l-md rounded-r-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <button
              type="submit"
              disabled={!message.trim() && !showFileAttachment}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt"
            className="hidden"
          />
        </form>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
          </div>
        )}

        {/* File Attachment Preview */}
        {showFileAttachment && (
          <div className="absolute bottom-20 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <FileAttachment
              file={fileInputRef.current?.files[0]}
              onRemove={() => {
                fileInputRef.current.value = '';
                setShowFileAttachment(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;