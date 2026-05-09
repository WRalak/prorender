import { API_BASE_URL } from '../api';

class ChatAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Get conversations
  async getConversations() {
    const response = await fetch(`${this.baseURL}/chat/conversations`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get conversations');
    }

    return response.json();
  }

  // Get conversation by ID
  async getConversation(conversationId) {
    const response = await fetch(`${this.baseURL}/chat/conversations/${conversationId}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get conversation');
    }

    return response.json();
  }

  // Create new conversation
  async createConversation(participantId) {
    const response = await fetch(`${this.baseURL}/chat/conversations`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ participantId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create conversation');
    }

    return response.json();
  }

  // Get messages in conversation
  async getMessages(conversationId, page = 1, limit = 50) {
    const response = await fetch(
      `${this.baseURL}/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
      {
        headers: this.getAuthHeader(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get messages');
    }

    return response.json();
  }

  // Send message
  async sendMessage(conversationId, content, type = 'text', file = null) {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('type', type);
    
    if (file) {
      formData.append('file', file);
    }

    const response = await fetch(
      `${this.baseURL}/chat/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send message');
    }

    return response.json();
  }

  // Mark message as read
  async markMessageAsRead(messageId) {
    const response = await fetch(`${this.baseURL}/chat/messages/${messageId}/read`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to mark message as read');
    }

    return response.json();
  }

  // Mark all messages in conversation as read
  async markConversationAsRead(conversationId) {
    const response = await fetch(`${this.baseURL}/chat/conversations/${conversationId}/read`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to mark conversation as read');
    }

    return response.json();
  }

  // Delete message
  async deleteMessage(messageId) {
    const response = await fetch(`${this.baseURL}/chat/messages/${messageId}`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete message');
    }

    return response.json();
  }

  // Edit message
  async editMessage(messageId, content) {
    const response = await fetch(`${this.baseURL}/chat/messages/${messageId}`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to edit message');
    }

    return response.json();
  }

  // Search messages
  async searchMessages(query, conversationId = null) {
    const params = new URLSearchParams({ query });
    if (conversationId) {
      params.append('conversationId', conversationId);
    }

    const response = await fetch(`${this.baseURL}/chat/messages/search?${params}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to search messages');
    }

    return response.json();
  }

  // Get online users
  async getOnlineUsers() {
    const response = await fetch(`${this.baseURL}/chat/users/online`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get online users');
    }

    return response.json();
  }

  // Get user typing status
  async getTypingStatus(conversationId) {
    const response = await fetch(`${this.baseURL}/chat/conversations/${conversationId}/typing`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get typing status');
    }

    return response.json();
  }

  // Set typing status
  async setTypingStatus(conversationId, isTyping) {
    const response = await fetch(`${this.baseURL}/chat/conversations/${conversationId}/typing`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isTyping }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to set typing status');
    }

    return response.json();
  }

  // Block user
  async blockUser(userId) {
    const response = await fetch(`${this.baseURL}/chat/users/${userId}/block`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to block user');
    }

    return response.json();
  }

  // Unblock user
  async unblockUser(userId) {
    const response = await fetch(`${this.baseURL}/chat/users/${userId}/unblock`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to unblock user');
    }

    return response.json();
  }

  // Get blocked users
  async getBlockedUsers() {
    const response = await fetch(`${this.baseURL}/chat/users/blocked`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get blocked users');
    }

    return response.json();
  }

  // Report message
  async reportMessage(messageId, reason) {
    const response = await fetch(`${this.baseURL}/chat/messages/${messageId}/report`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to report message');
    }

    return response.json();
  }

  // Mute conversation
  async muteConversation(conversationId, duration) {
    const response = await fetch(`${this.baseURL}/chat/conversations/${conversationId}/mute`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ duration }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to mute conversation');
    }

    return response.json();
  }

  // Unmute conversation
  async unmuteConversation(conversationId) {
    const response = await fetch(`${this.baseURL}/chat/conversations/${conversationId}/unmute`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to unmute conversation');
    }

    return response.json();
  }

  // Archive conversation
  async archiveConversation(conversationId) {
    const response = await fetch(`${this.baseURL}/chat/conversations/${conversationId}/archive`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to archive conversation');
    }

    return response.json();
  }

  // Unarchive conversation
  async unarchiveConversation(conversationId) {
    const response = await fetch(`${this.baseURL}/chat/conversations/${conversationId}/unarchive`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to unarchive conversation');
    }

    return response.json();
  }

  // Get unread message count
  async getUnreadCount() {
    const response = await fetch(`${this.baseURL}/chat/unread-count`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get unread count');
    }

    return response.json();
  }

  // Clear chat history
  async clearChatHistory(conversationId) {
    const response = await fetch(`${this.baseURL}/chat/conversations/${conversationId}/clear`, {
      method: 'DELETE',
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to clear chat history');
    }

    return response.json();
  }
}

export default new ChatAPI();