const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');

const notificationSocket = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected for notifications`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle notification read status
    socket.on('notification:read', async (notificationId) => {
      try {
        await Notification.findByIdAndUpdate(notificationId, {
          read: true,
          readAt: new Date()
        });

        // Broadcast to all user's devices
        socket.to(`user_${socket.userId}`).emit('notification:read', notificationId);
      } catch (error) {
        socket.emit('error', { message: 'Failed to mark notification as read' });
      }
    });

    // Handle marking all notifications as read
    socket.on('notifications:read-all', async () => {
      try {
        await Notification.updateMany(
          { recipient: socket.userId, read: false },
          { read: true, readAt: new Date() }
        );

        socket.to(`user_${socket.userId}`).emit('notifications:read-all');
      } catch (error) {
        socket.emit('error', { message: 'Failed to mark notifications as read' });
      }
    });

    // Handle notification preferences
    socket.on('notification:preferences', async (preferences) => {
      try {
        await User.findByIdAndUpdate(socket.userId, {
          'notificationPreferences': preferences
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to update notification preferences' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected from notifications`);
    });
  });

  // Function to send notification to specific user
  const sendNotificationToUser = (userId, notification) => {
    io.to(`user_${userId}`).emit('notification:new', notification);
  };

  // Function to send notification to multiple users
  const sendNotificationToUsers = (userIds, notification) => {
    userIds.forEach(userId => {
      io.to(`user_${userId}`).emit('notification:new', notification);
    });
  };

  // Function to send notification to all agents
  const sendNotificationToAgents = (notification) => {
    io.emit('notification:agents', notification);
  };

  // Function to send notification to all admins
  const sendNotificationToAdmins = (notification) => {
    io.emit('notification:admins', notification);
  };

  // Make these functions available globally
  global.sendNotificationToUser = sendNotificationToUser;
  global.sendNotificationToUsers = sendNotificationToUsers;
  global.sendNotificationToAgents = sendNotificationToAgents;
  global.sendNotificationToAdmins = sendNotificationToAdmins;
};

module.exports = notificationSocket;