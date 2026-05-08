import React from 'react';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { formatRelativeTime } from '../../utils/formatCurrency';

const MessageBubble = ({ message, isOwn, showAvatar = true }) => {
  const { sender, content, type, read, createdAt, file } = message;

  const renderContent = () => {
    if (type === 'file' && file) {
      return (
        <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-md">
          <div className="flex-shrink-0">
            {file.type.startsWith('image/') ? (
              <img
                src={file.url}
                alt={file.name}
                className="h-16 w-16 object-cover rounded"
              />
            ) : (
              <div className="h-16 w-16 bg-gray-300 rounded flex items-center justify-center">
                <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{file.size}</p>
          </div>
        </div>
      );
    }

    return (
      <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
        {content}
      </p>
    );
  };

  return (
    <div className={`flex items-end space-x-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
            {sender?.profile?.avatar ? (
              <img
                src={sender.profile.avatar}
                alt={sender.name?.first}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium text-gray-600">
                {sender?.name?.first?.[0] || 'U'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Message Bubble */}
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isOwn ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-2 rounded-lg ${
            isOwn
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {/* Sender Name (for group messages) */}
          {!isOwn && showAvatar && (
            <p className="text-xs font-medium mb-1 opacity-75">
              {sender?.name?.first} {sender?.name?.last}
            </p>
          )}

          {/* Message Content */}
          {renderContent()}

          {/* Message Footer */}
          <div className={`flex items-center justify-between mt-1 text-xs ${
            isOwn ? 'text-blue-100' : 'text-gray-500'
          }`}>
            <span>{formatRelativeTime(createdAt)}</span>
            
            {/* Read Status */}
            {isOwn && (
              <div className="flex items-center space-x-1">
                {read ? (
                  <CheckCircleIcon className="h-3 w-3" />
                ) : (
                  <ClockIcon className="h-3 w-3" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;