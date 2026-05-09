const Property = require('../models/Property');
const User = require('../models/User');
const Message = require('../models/Message');
const AppError = require('../middleware/errorHandler');
const { catchAsync } = require('../middleware/errorHandler');

class AIModerationService {
  // Content moderation using AI/ML
  static async moderateContent(content) {
    const moderationResult = {
      approved: true,
      flagged: false,
      categories: [],
      confidence: 0.95,
      processedAt: new Date()
    };

    // Check for inappropriate content
    const inappropriateWords = ['spam', 'scam', 'fraud', 'inappropriate', 'offensive'];
    const foundWords = inappropriateWords.filter(word => 
      content.toLowerCase().includes(word.toLowerCase())
    );

    if (foundWords.length > 0) {
      moderationResult.approved = false;
      moderationResult.flagged = true;
      moderationResult.categories = ['inappropriate_content'];
      moderationResult.confidence = 0.9;
    }

    // Check for contact information sharing
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    
    if (emailRegex.test(content) || phoneRegex.test(content)) {
      moderationResult.approved = false;
      moderationResult.flagged = true;
      moderationResult.categories.push('personal_info_sharing');
      moderationResult.confidence = 0.85;
    }

    return moderationResult;
  }

  // Property listing moderation
  static async moderateProperty(propertyData) {
    const moderation = await this.moderateContent(
      `${propertyData.title} ${propertyData.description} ${propertyData.description}`
    );

    // Additional property-specific checks
    const suspiciousPatterns = [
      /too good to be true/gi,
      /urgent sale/gi,
      /wire transfer/gi,
      /western union/gi
    ];

    const foundPatterns = suspiciousPatterns.filter(pattern => 
      pattern.test(propertyData.title) || pattern.test(propertyData.description)
    );

    if (foundPatterns.length > 0) {
      moderation.flagged = true;
      moderation.categories.push('suspicious_listing');
      moderation.confidence = Math.max(moderation.confidence, 0.8);
    }

    return moderation;
  }

  // Message moderation
  static async moderateMessage(messageContent, senderId, receiverId) {
    const moderation = await this.moderateContent(messageContent);

    // Check for harassment patterns
    const harassmentPatterns = [
      /threat/i,
      /harass/i,
      /bully/i,
      /stalker/i
    ];

    const foundHarassment = harassmentPatterns.filter(pattern => 
      pattern.test(messageContent)
    );

    if (foundHarassment.length > 0) {
      moderation.flagged = true;
      moderation.categories.push('harassment');
      moderation.confidence = Math.max(moderation.confidence, 0.9);
    }

    // Log moderation result
    console.log(`Message moderated: ${moderation.flagged ? 'FLAGGED' : 'APPROVED'}`);

    return moderation;
  }

  // User profile moderation
  static async moderateUser(userData) {
    const profileContent = `${userData.bio || ''} ${userData.name?.first || ''} ${userData.name?.last || ''}`;
    const moderation = await this.moderateContent(profileContent);

    // Check for fake profile indicators
    const fakeProfileIndicators = [
      /stock photo/gi,
      /model/gi,
      /celebrity/gi,
      /too perfect/gi
    ];

    const foundIndicators = fakeProfileIndicators.filter(indicator => 
      indicator.test(userData.bio || '') || 
      indicator.test(userData.name?.first + ' ' + userData.name?.last || '')
    );

    if (foundIndicators.length > 0) {
      moderation.flagged = true;
      moderation.categories.push('fake_profile');
      moderation.confidence = Math.max(moderation.confidence, 0.85);
    }

    return moderation;
  }

  // Bulk moderation for multiple items
  static async moderateBulk(items, itemType = 'content') {
    const results = [];
    
    for (const item of items) {
      let moderation;
      
      switch (itemType) {
        case 'property':
          moderation = await this.moderateProperty(item);
          break;
        case 'message':
          moderation = await this.moderateMessage(item.content, item.senderId, item.receiverId);
          break;
        case 'user':
          moderation = await this.moderateUser(item);
          break;
        default:
          moderation = await this.moderateContent(item.content || item);
          break;
      }
      
      results.push({
        id: item._id || item.id,
        type: itemType,
        moderation
      });
    }

    return results;
  }

  // Get moderation statistics
  static async getModerationStats(timeRange = '24h') {
    const stats = {
      totalModerated: 0,
      flagged: 0,
      approved: 0,
      categories: {},
      timeRange
    };

    // In a real implementation, you would query your moderation logs
    // For now, return mock data
    stats.totalModerated = 1250;
    stats.flagged = 87;
    stats.approved = 1163;
    stats.categories = {
      inappropriate_content: 45,
      personal_info_sharing: 23,
      suspicious_listing: 12,
      harassment: 7
    };

    return stats;
  }

  // Review flagged content
  static async reviewFlaggedContent(contentId, action, reviewerId) {
    const review = {
      contentId,
      action, // 'approve', 'reject', 'escalate'
      reviewerId,
      reviewedAt: new Date(),
      status: action === 'approve' ? 'approved' : 'rejected'
    };

    // In a real implementation, you would update your database
    console.log(`Content reviewed: ${contentId} - ${action}`);

    return review;
  }

  // Auto-moderation rules management
  static async updateModerationRules(rules) {
    // In a real implementation, you would update your moderation rules
    console.log('Moderation rules updated:', rules);
    
    return {
      success: true,
      message: 'Moderation rules updated successfully'
    };
  }

  // Content filtering for specific categories
  static async filterContent(filters) {
    const { categories, confidence, dateRange } = filters;
    
    // In a real implementation, you would query your moderation database
    const filteredContent = [];
    
    return {
      success: true,
      content: filteredContent,
      filters: {
        applied: filters,
        count: filteredContent.length
      }
    };
  }
}

module.exports = AIModerationService;