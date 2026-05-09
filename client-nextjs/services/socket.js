import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventListeners();
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      this.connected = true;
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Notification events
    this.socket.on('notification', (data) => {
      this.emit('notification', data);
    });

    // Chat events
    this.socket.on('new_message', (data) => {
      this.emit('new_message', data);
    });

    this.socket.on('message_read', (data) => {
      this.emit('message_read', data);
    });

    this.socket.on('typing_start', (data) => {
      this.emit('typing_start', data);
    });

    this.socket.on('typing_stop', (data) => {
      this.emit('typing_stop', data);
    });

    // Application events
    this.socket.on('application_status_update', (data) => {
      this.emit('application_status_update', data);
    });

    // Property events
    this.socket.on('property_status_update', (data) => {
      this.emit('property_status_update', data);
    });

    // Maintenance events
    this.socket.on('maintenance_status_update', (data) => {
      this.emit('maintenance_status_update', data);
    });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        callback(data);
      });
    }
  }

  // Chat methods
  sendMessage(message) {
    if (this.socket && this.connected) {
      this.socket.emit('send_message', message);
    }
  }

  markMessageAsRead(messageId) {
    if (this.socket && this.connected) {
      this.socket.emit('mark_message_read', { messageId });
    }
  }

  startTyping(conversationId) {
    if (this.socket && this.connected) {
      this.socket.emit('typing_start', { conversationId });
    }
  }

  stopTyping(conversationId) {
    if (this.socket && this.connected) {
      this.socket.emit('typing_stop', { conversationId });
    }
  }

  // Join/Leave rooms
  joinRoom(roomId) {
    if (this.socket && this.connected) {
      this.socket.emit('join_room', roomId);
    }
  }

  leaveRoom(roomId) {
    if (this.socket && this.connected) {
      this.socket.emit('leave_room', roomId);
    }
  }

  // Notification methods
  markNotificationAsRead(notificationId) {
    if (this.socket && this.connected) {
      this.socket.emit('mark_notification_read', { notificationId });
    }
  }

  // Connection status
  isConnected() {
    return this.connected;
  }

  getConnectionStatus() {
    if (this.socket) {
      return this.socket.connected ? 'connected' : 'disconnected';
    }
    return 'disconnected';
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;