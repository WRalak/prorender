const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const AppError = require('../middleware/errorHandler');
const { catchAsync } = require('../middleware/errorHandler');

exports.getConversations = catchAsync(async (req, res, next) => {
  const conversations = await Conversation.find({
    participants: req.user.id
  })
    .populate('participants', 'name email avatar')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

  res.json({
    success: true,
    conversations
  });
});

exports.getConversation = catchAsync(async (req, res, next) => {
  const { conversationId } = req.params;
  
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user.id
  })
  .populate('participants', 'name email avatar')
  .populate({
    path: 'messages',
    populate: {
      path: 'sender',
      select: 'name email avatar'
    }
  });

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  res.json({
    success: true,
    conversation
  });
});

exports.createConversation = catchAsync(async (req, res, next) => {
  const { participantId, initialMessage } = req.body;

  const conversation = await Conversation.create({
    participants: [req.user.id, participantId],
    messages: initialMessage ? [{
      sender: req.user.id,
      content: initialMessage,
      type: 'text',
      createdAt: new Date()
    }] : []
  });

  const populatedConversation = await Conversation.findById(conversation._id)
    .populate('participants', 'name email avatar');

  res.status(201).json({
    success: true,
    conversation: populatedConversation
  });
});

exports.sendMessage = catchAsync(async (req, res, next) => {
  const { conversationId } = req.params;
  const { content, type = 'text' } = req.body;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user.id
  });

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: req.user.id,
    content,
    type,
    createdAt: new Date()
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name email avatar');

  // Emit to socket.io
  const io = req.app.get('io');
  io.to(`conversation_${conversationId}`).emit('newMessage', populatedMessage);

  res.status(201).json({
    success: true,
    message: populatedMessage
  });
});

exports.markMessagesAsRead = catchAsync(async (req, res, next) => {
  const { conversationId } = req.params;
  const { messageIds } = req.body;

  await Message.updateMany(
    {
      _id: { $in: messageIds },
      conversation: conversationId,
      sender: { $ne: req.user.id }
    },
    { read: true }
  );

  res.json({
    success: true,
    message: 'Messages marked as read'
  });
});

exports.deleteMessage = catchAsync(async (req, res, next) => {
  const { conversationId, messageId } = req.params;

  const message = await Message.findOne({
    _id: messageId,
    conversation: conversationId,
    sender: req.user.id
  });

  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  await Message.deleteOne({ _id: messageId });

  res.json({
    success: true,
    message: 'Message deleted'
  });
});

// Add missing methods that routes expect
exports.archiveConversation = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const conversation = await Conversation.findOne({
    _id: id,
    participants: req.user.id
  });

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  conversation.archived = true;
  conversation.archivedAt = new Date();
  await conversation.save();

  res.json({
    success: true,
    message: 'Conversation archived'
  });
});

exports.deleteConversation = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const conversation = await Conversation.findOne({
    _id: id,
    participants: req.user.id
  });

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  await Conversation.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Conversation deleted'
  });
});

exports.getMessages = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { page = 1, limit = 50 } = req.query;
  
  const conversation = await Conversation.findOne({
    _id: id,
    participants: req.user.id
  });

  if (!conversation) {
    return next(new AppError('Conversation not found', 404));
  }

  const messages = await Message.find({ conversation: id })
    .populate('sender', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  res.json({
    success: true,
    messages
  });
});

exports.markMessageAsRead = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  await Message.findByIdAndUpdate(id, { read: true });

  res.json({
    success: true,
    message: 'Message marked as read'
  });
});

exports.editMessage = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;
  
  const message = await Message.findOne({
    _id: id,
    sender: req.user.id
  });

  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  message.content = content;
  message.edited = true;
  message.editedAt = new Date();
  await message.save();

  res.json({
    success: true,
    message
  });
});

exports.setTyping = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Emit to socket.io
  const io = req.app.get('io');
  io.to(`conversation_${id}`).emit('userTyping', {
    userId: req.user.id,
    typing: true
  });

  res.json({ success: true });
});

exports.clearTyping = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Emit to socket.io
  const io = req.app.get('io');
  io.to(`conversation_${id}`).emit('userTyping', {
    userId: req.user.id,
    typing: false
  });

  res.json({ success: true });
});

// Methods are already exported with exports syntax