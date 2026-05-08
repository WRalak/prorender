const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { validateMessage } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// Conversation routes
router.get('/conversations', chatController.getConversations);
router.get('/conversations/:id', chatController.getConversation);
router.post('/conversations', chatController.createConversation);
router.patch('/conversations/:id/archive', chatController.archiveConversation);
router.delete('/conversations/:id', chatController.deleteConversation);

// Message routes
router.get('/conversations/:id/messages', chatController.getMessages);
router.post('/conversations/:id/messages', validateMessage, chatController.sendMessage);
router.patch('/messages/:id/read', chatController.markMessageAsRead);
router.patch('/messages/:id', chatController.editMessage);
router.delete('/messages/:id', chatController.deleteMessage);

// Typing indicators
router.post('/conversations/:id/typing', chatController.setTyping);
router.delete('/conversations/:id/typing', chatController.clearTyping);

module.exports = router;