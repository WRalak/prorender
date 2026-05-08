import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import {
  ChatBubbleLeftRightIcon,
  UserIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

const ConversationList = ({ conversations, activeConversationId }) => {
  const { unreadCount } = useNotifications();

  const getConversationIcon = (type) => {
    switch (type) {
      case 'property_inquiry':
        return <BuildingOfficeIcon className="h-5 w-5" />;
      default:
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMs = now - messageDate;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return messageDate.toLocaleDateString();
  };

  return (
    <div className="space-y-2">
      {conversations.length === 0 ? (
        <div className="text-center py-8">
          <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-gray-500">Start a conversation by browsing properties and contacting agents</p>
          <Link
            to="/properties"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
          >
            Browse Properties
          </Link>
        </div>
      ) : (
        conversations.map((conversation) => {
          const otherParticipant = conversation.participants.find(
            (p) => p.user._id !== localStorage.getItem('userId')
          );
          const unreadMessages = conversation.unreadCounts.find(
            (uc) => uc.user === localStorage.getItem('userId')
          );

          return (
            <Link
              key={conversation._id}
              to={`/messages/${conversation._id}`}
              className={`block p-4 rounded-lg border transition-colors ${
                activeConversationId === conversation._id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {otherParticipant?.user?.profile?.avatar ? (
                    <img
                      src={otherParticipant.user.profile.avatar}
                      alt={otherParticipant.user.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {otherParticipant?.user?.name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTime(conversation.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center mt-1">
                    {getConversationIcon(conversation.type)}
                    <p className="ml-2 text-sm text-gray-600 truncate">
                      {conversation.metadata.subject || conversation.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                  {unreadMessages?.count > 0 && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">
                        {unreadMessages.count} unread
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
};

export default ConversationList;
