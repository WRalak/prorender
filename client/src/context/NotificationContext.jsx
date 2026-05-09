import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { userAPI } from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);

  // Check if user is authenticated by checking token
  const isAuthenticated = !!localStorage.getItem('token');

  // Fetch notifications only if user is authenticated
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: userAPI.getNotifications,
    enabled: isAuthenticated, // Only run query if user is authenticated
    onSuccess: (data) => {
      const unread = data.notifications?.filter(n => !n.read).length || 0;
      setUnreadCount(unread);
    },
    onError: () => {
      // If notifications fail, clear token and set user to null
      localStorage.removeItem('token');
      setUnreadCount(0);
    },
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => userAPI.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setUnreadCount(prev => Math.max(0, prev - 1));
    },
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: userAPI.markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    },
    onError: () => {
      toast.error('Failed to mark notifications as read');
    },
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId) => userAPI.deleteNotification(notificationId),
    onSuccess: (_, notificationId) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      const notification = notifications?.notifications?.find(n => n._id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Notification deleted');
    },
    onError: () => {
      toast.error('Failed to delete notification');
    },
  });

  // Listen for new notifications via socket
  useEffect(() => {
    const handleNewNotification = (notification) => {
      // Update query cache
      queryClient.setQueryData({ queryKey: ['notifications'] }, (oldData) => {
        if (oldData) {
          return {
            ...oldData,
            notifications: [notification, ...(oldData.notifications || [])],
          };
        }
        return oldData;
      });

      // Update unread count
      if (!notification.read) {
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        toast(notification.message, {
          duration: 5000,
          icon: '🔔',
        });
      }
    };

    const handleNotificationRead = (notificationId) => {
      // Update query cache
      queryClient.setQueryData({ queryKey: ['notifications'] }, (oldData) => {
        if (oldData) {
          return {
            ...oldData,
            notifications: oldData.notifications?.map(n =>
              n._id === notificationId ? { ...n, read: true } : n
            ) || [],
          };
        }
        return oldData;
      });

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleAllNotificationsRead = () => {
      // Update query cache
      queryClient.setQueryData({ queryKey: ['notifications'] }, (oldData) => {
        if (oldData) {
          return {
            ...oldData,
            notifications: oldData.notifications?.map(n => ({ ...n, read: true })) || [],
          };
        }
        return oldData;
      });

      // Reset unread count
      setUnreadCount(0);
    };

    // Add socket listeners if socket is available
    if (window.socket) {
      window.socket.on('notification:new', handleNewNotification);
      window.socket.on('notification:read', handleNotificationRead);
      window.socket.on('notifications:read-all', handleAllNotificationsRead);
    }

    // Cleanup
    return () => {
      if (window.socket) {
        window.socket.off('notification:new', handleNewNotification);
        window.socket.off('notification:read', handleNotificationRead);
        window.socket.off('notifications:read-all', handleAllNotificationsRead);
      }
    };
  }, [queryClient]);

  const markAsRead = (notificationId) => {
    markAsReadMutation.mutate(notificationId);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const deleteNotification = (notificationId) => {
    deleteNotificationMutation.mutate(notificationId);
  };

  const getUnreadNotifications = () => {
    return notifications?.notifications?.filter(n => !n.read) || [];
  };

  const getReadNotifications = () => {
    return notifications?.notifications?.filter(n => n.read) || [];
  };

  const value = {
    notifications: notifications?.notifications || [],
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadNotifications,
    getReadNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;