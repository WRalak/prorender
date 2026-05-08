import React, { useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
} from '@heroicons/react/24/outline';

const MessageList = ({ messages, conversationId, onSendMessage }) => {
  const { user } = useAuth();
  const { sendMessage, markMessageAsRead } = useSocket();
  const messagesEndRef = useRef(null);
  const [newMessage, setNewMessage] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [typingUsers, setTypingUsers] = React.useState(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when they become visible
    messages.forEach((message) => {
      if (!message.readBy?.some((read) => read.user === user.id) && message.sender !== user.id) {
        markMessageAsRead(message._id);
      }
    });
  }, [messages, user.id, markMessageAsRead]);

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(conversationId, newMessage.trim());
      onSendMessage(newMessage.trim());
      setNewMessage('');
      setIsTyping(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      // Emit typing event
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isOwnMessage = (message) => {
    return message.sender === user.id;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <PaperAirplaneIcon className="h-6 w-6 text-gray-600" />
            </div>
            <p className="text-gray-500">Start the conversation with a message</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message._id || index}
              className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwnMessage(message)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div className="flex items-center justify-between mt-1">
                  <p
                    className={`text-xs ${
                      isOwnMessage(message) ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </p>
                  {isOwnMessage(message) && (
                    <span className="ml-2">
                      {message.readBy?.some((read) => read.user !== user.id) ? (
                        <span className="text-xs text-blue-100">✓✓</span>
                      ) : (
                        <span className="text-xs text-blue-100">✓</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {typingUsers.size > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
              <p className="text-sm italic">
                {Array.from(typingUsers).join(', ')} is typing...
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <PaperClipIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <FaceSmileIcon className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageList;
