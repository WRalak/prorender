import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(process.env.REACT_APP_SERVER_URL, {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        newSocket.emit('user:online', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      newSocket.on('users:online', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('notification:new', (notification) => {
        toast(notification.message, {
          icon: '🔔',
          duration: 5000,
        });
      });

      newSocket.on('message:new', (message) => {
        // Handle new message notification
        if (message.sender !== user.id) {
          toast(`New message from ${message.senderName}`, {
            icon: '💬',
            duration: 3000,
          });
        }
      });

      newSocket.on('application:status', (data) => {
        const { status, propertyTitle } = data;
        let message = '';
        
        switch (status) {
          case 'approved':
            message = `Your application for ${propertyTitle} has been approved!`;
            toast.success(message);
            break;
          case 'rejected':
            message = `Your application for ${propertyTitle} has been rejected.`;
            toast.error(message);
            break;
          default:
            message = `Application status updated for ${propertyTitle}`;
            toast(message);
        }
      });

      newSocket.on('payment:reminder', (data) => {
        const { amount, dueDate, propertyName } = data;
        toast(`Payment reminder: $${amount} due for ${propertyName} on ${new Date(dueDate).toLocaleDateString()}`, {
          icon: '💳',
          duration: 6000,
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const sendMessage = (conversationId, content) => {
    if (socket) {
      socket.emit('message:send', {
        conversationId,
        content,
        senderId: user.id
      });
    }
  };

  const markMessageAsRead = (messageId) => {
    if (socket) {
      socket.emit('message:read', {
        messageId,
        userId: user.id
      });
    }
  };

  const joinConversation = (conversationId) => {
    if (socket) {
      socket.emit('conversation:join', conversationId);
    }
  };

  const leaveConversation = (conversationId) => {
    if (socket) {
      socket.emit('conversation:leave', conversationId);
    }
  };

  const value = {
    socket,
    onlineUsers,
    sendMessage,
    markMessageAsRead,
    joinConversation,
    leaveConversation,
    isConnected: socket?.connected || false
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;