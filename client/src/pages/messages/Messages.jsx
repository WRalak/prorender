import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSocket } from '../../context/SocketContext';
import { chatAPI } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import ConversationList from '../../components/chat/ConversationList';
import MessageList from '../../components/chat/MessageList';
import TypingIndicator from '../../components/chat/TypingIndicator';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const { sendMessage, joinConversation, leaveConversation } = useSocket();
  const { unreadCount } = useNotifications();

  const {
    data: conversations,
    isLoading,
    error,
    refetch,
  } = useQuery('conversations', chatAPI.getConversations);

  const {
    data: messages,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useQuery(
    ['messages', selectedConversation],
    () => selectedConversation ? chatAPI.getMessages(selectedConversation) : { messages: [] },
    {
      enabled: !!selectedConversation,
    }
  );

  const handleSelectConversation = (conversationId) => {
    setSelectedConversation(conversationId);
    joinConversation(conversationId);
  };

  const handleSendMessage = (content) => {
    if (selectedConversation) {
      sendMessage(selectedConversation, content);
      refetchMessages();
    }
  };

  const handleBackToList = () => {
    leaveConversation(selectedConversation);
    setSelectedConversation(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" text="Loading conversations..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load conversations</h3>
        <p className="text-gray-600">Please try again later.</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Conversation List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="overflow-y-auto h-[calc(100vh-73px)]">
          <ConversationList
            conversations={conversations || []}
            activeConversationId={selectedConversation}
          />
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {conversations?.find(c => c._id === selectedConversation)?.metadata?.subject || 'Conversation'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {conversations?.find(c => c._id === selectedConversation)?.participants
                      .find(p => p.user._id !== localStorage.getItem('userId'))
                      ?.user?.name}
                  </p>
                </div>
                <button
                  onClick={handleBackToList}
                  className="md:hidden px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  Back to list
                </button>
              </div>
            </div>

            {/* Messages */}
            <MessageList
              messages={messages?.messages || []}
              conversationId={selectedConversation}
              onSendMessage={handleSendMessage}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8a9.009 9.009 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
