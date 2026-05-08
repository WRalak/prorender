const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

module.exports = (io) => {
  const userSockets = new Map();
  
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('user-connected', (userId) => {
      userSockets.set(userId, socket.id);
      socket.join(`user-${userId}`);
      console.log(`User ${userId} connected with socket ${socket.id}`);
    });
    
    socket.on('join-conversation', (conversationId) => {
      socket.join(`conv-${conversationId}`);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });
    
    socket.on('send-message', async (data) => {
      try {
        const { conversationId, content, attachments, userId } = data;
        
        // Create message
        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          content,
          attachments,
          readBy: [userId]
        });
        
        // Update conversation
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          lastMessageAt: new Date(),
          updatedAt: new Date()
        });
        
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name profile');
        
        // Emit to conversation room
        io.to(`conv-${conversationId}`).emit('new-message', populatedMessage);
        
        // Get all participants
        const conversation = await Conversation.findById(conversationId);
        const participants = conversation.participants;
        
        // Send notifications to offline users
        for (const participant of participants) {
          if (participant.toString() !== userId) {
            const userSocketId = userSockets.get(participant.toString());
            if (!userSocketId) {
              // User is offline - send email/push notification
              const user = await User.findById(participant);
              if (user && user.profile.notifications?.email) {
                const { sendMessageNotification } = require('../services/emailService');
                await sendMessageNotification(user.email, conversation, message);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message-error', { error: error.message });
      }
    });
    
    socket.on('typing-start', ({ conversationId, userId, userName }) => {
      socket.to(`conv-${conversationId}`).emit('user-typing', { userId, userName });
    });
    
    socket.on('typing-stop', ({ conversationId, userId }) => {
      socket.to(`conv-${conversationId}`).emit('user-stop-typing', { userId });
    });
    
    socket.on('mark-read', async ({ conversationId, userId }) => {
      try {
        await Message.updateMany(
          { conversation: conversationId, sender: { $ne: userId }, 'readBy': { $ne: userId } },
          { $addToSet: { readBy: userId } }
        );
        
        io.to(`conv-${conversationId}`).emit('messages-read', { conversationId, userId });
      } catch (error) {
        console.error('Error marking read:', error);
      }
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });
  });
};