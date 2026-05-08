const typingSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected for typing indicators`);

    // Join conversation room
    socket.on('conversation:join', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
    });

    // Leave conversation room
    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
    });

    // Handle typing start
    socket.on('typing:start', (data) => {
      const { conversationId, userName } = data;
      
      // Broadcast to all users in conversation except sender
      socket.to(`conversation_${conversationId}`).emit('typing:started', {
        userId: socket.userId,
        userName,
        conversationId
      });
    });

    // Handle typing stop
    socket.on('typing:stop', (data) => {
      const { conversationId } = data;
      
      // Broadcast to all users in conversation except sender
      socket.to(`conversation_${conversationId}`).emit('typing:stopped', {
        userId: socket.userId,
        conversationId
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected from typing indicators`);
    });
  });
};

module.exports = typingSocket;