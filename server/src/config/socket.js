const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name.first} ${socket.user.name.last}`);

    // Join user to their personal room
    socket.join(`user_${socket.user._id}`);

    // Join user to their role-based rooms
    socket.join(`role_${socket.user.role}`);

    // Handle joining conversations
    socket.on('join_conversation', async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Check if user is participant
        const isParticipant = conversation.participants.some(
          participant => participant.toString() === socket.user._id.toString()
        );

        if (!isParticipant) {
          socket.emit('error', { message: 'Not authorized to join this conversation' });
          return;
        }

        socket.join(`conversation_${conversationId}`);
        
        // Notify other participants
        socket.to(`conversation_${conversationId}`).emit('user_joined', {
          userId: socket.user._id,
          userName: `${socket.user.name.first} ${socket.user.name.last}`
        });

      } catch (error) {
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Handle leaving conversations
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      socket.to(`conversation_${conversationId}`).emit('user_left', {
        userId: socket.user._id,
        userName: `${socket.user.name.first} ${socket.user.name.last}`
      });
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, type = 'text' } = data;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Check if user is participant
        const isParticipant = conversation.participants.some(
          participant => participant.toString() === socket.user._id.toString()
        );

        if (!isParticipant) {
          socket.emit('error', { message: 'Not authorized to send messages' });
          return;
        }

        // Create message
        const message = await Message.create({
          conversation: conversationId,
          sender: socket.user._id,
          content,
          type,
          readBy: [socket.user._id] // Sender has read the message
        });

        // Populate message details
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name email avatar')
          .populate('conversation', 'title');

        // Update conversation's last message
        conversation.lastMessage = message._id;
        conversation.lastActivity = new Date();
        await conversation.save();

        // Send message to all participants in the conversation
        io.to(`conversation_${conversationId}`).emit('new_message', populatedMessage);

        // Send notification to other participants (excluding sender)
        conversation.participants.forEach(participant => {
          if (participant.toString() !== socket.user._id.toString()) {
            io.to(`user_${participant}`).emit('new_message_notification', {
              conversationId,
              message: populatedMessage,
              sender: socket.user
            });
          }
        });

      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle marking messages as read
    socket.on('mark_messages_read', async (conversationId) => {
      try {
        await Message.updateMany(
          {
            conversation: conversationId,
            sender: { $ne: socket.user._id },
            'readBy': { $ne: socket.user._id }
          },
          {
            $push: { readBy: socket.user._id }
          }
        );

        // Notify other participants that messages were read
        socket.to(`conversation_${conversationId}`).emit('messages_read', {
          userId: socket.user._id,
          conversationId
        });

      } catch (error) {
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (conversationId) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.user._id,
        userName: `${socket.user.name.first} ${socket.user.name.last}`,
        isTyping: true
      });
    });

    socket.on('typing_stop', (conversationId) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.user._id,
        userName: `${socket.user.name.first} ${socket.user.name.last}`,
        isTyping: false
      });
    });

    // Handle online status
    socket.on('update_status', async (status) => {
      try {
        await User.findByIdAndUpdate(socket.user._id, { 
          onlineStatus: status,
          lastSeen: new Date()
        });

        // Broadcast status change to relevant users
        socket.broadcast.emit('user_status_update', {
          userId: socket.user._id,
          status
        });

      } catch (error) {
        socket.emit('error', { message: 'Failed to update status' });
      }
    });

    // Handle notifications
    socket.on('get_notifications', async () => {
      try {
        const Notification = require('../models/Notification');
        const notifications = await Notification.find({
          user: socket.user._id,
          read: false
        })
        .sort({ createdAt: -1 })
        .limit(50);

        socket.emit('notifications_list', notifications);
      } catch (error) {
        socket.emit('error', { message: 'Failed to fetch notifications' });
      }
    });

    socket.on('mark_notification_read', async (notificationId) => {
      try {
        const Notification = require('../models/Notification');
        await Notification.findByIdAndUpdate(notificationId, { read: true });
        
        socket.emit('notification_read', { notificationId });
      } catch (error) {
        socket.emit('error', { message: 'Failed to mark notification as read' });
      }
    });

    // Handle maintenance request updates (for agents/admins)
    socket.on('maintenance_update', async (data) => {
      try {
        const { requestId, status, note } = data;
        const MaintenanceRequest = require('../models/MaintenanceRequest');

        const request = await MaintenanceRequest.findById(requestId)
          .populate('property', 'title')
          .populate('tenant', 'name email');

        if (!request) {
          socket.emit('error', { message: 'Maintenance request not found' });
          return;
        }

        // Check authorization
        if (socket.user.role !== 'admin' && socket.user.role !== 'super_admin' && 
            request.property.agent.toString() !== socket.user._id.toString()) {
          socket.emit('error', { message: 'Not authorized to update this request' });
          return;
        }

        request.status = status;
        if (note) {
          request.notes.push({
            content: note,
            addedBy: socket.user._id,
            addedAt: new Date()
          });
        }
        await request.save();

        // Notify tenant
        io.to(`user_${request.tenant._id}`).emit('maintenance_request_updated', {
          requestId: request._id,
          status,
          note,
          updatedBy: socket.user
        });

        // Notify agents/admins
        socket.to('role_admin').emit('maintenance_request_updated', {
          requestId: request._id,
          status,
          note,
          updatedBy: socket.user
        });

        socket.to('role_super_admin').emit('maintenance_request_updated', {
          requestId: request._id,
          status,
          note,
          updatedBy: socket.user
        });

      } catch (error) {
        socket.emit('error', { message: 'Failed to update maintenance request' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.name.first} ${socket.user.name.last}`);
      
      try {
        // Update user's online status
        await User.findByIdAndUpdate(socket.user._id, {
          onlineStatus: 'offline',
          lastSeen: new Date()
        });

        // Notify other users about disconnection
        socket.broadcast.emit('user_status_update', {
          userId: socket.user._id,
          status: 'offline'
        });

      } catch (error) {
        console.error('Error handling disconnection:', error);
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};

// Helper function to send notifications to specific users
const sendNotificationToUser = (userId, notificationData) => {
  if (io) {
    io.to(`user_${userId}`).emit('notification', notificationData);
  }
};

// Helper function to send notifications to roles
const sendNotificationToRole = (role, notificationData) => {
  if (io) {
    io.to(`role_${role}`).emit('notification', notificationData);
  }
};

// Helper function to broadcast to all connected users
const broadcastToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  sendNotificationToUser,
  sendNotificationToRole,
  broadcastToAll,
  getIO: () => io
};