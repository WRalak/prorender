const Application = require('../models/Application');
const Property = require('../models/Property');
const User = require('../models/User');
const Lease = require('../models/Lease');
const Notification = require('../models/Notification');

exports.getApplications = async (req, res, next) => {
  try {
    const { status, property, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (property) query.property = property;
    
    // Filter based on user role
    if (req.user.role === 'tenant') {
      query.tenant = req.user.id;
    } else if (req.user.role === 'agent') {
      query.agent = req.user.id;
    }
    
    const applications = await Application.find(query)
      .populate('property', 'title address')
      .populate('tenant', 'name email')
      .populate('agent', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Application.countDocuments(query);
    
    res.json({
      success: true,
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('property')
      .populate('tenant')
      .populate('agent');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Check permissions
    if (req.user.role === 'tenant' && application.tenant._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }
    
    if (req.user.role === 'agent' && application.agent._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }
    
    res.json({
      success: true,
      application
    });
  } catch (error) {
    next(error);
  }
};

exports.createApplication = async (req, res, next) => {
  try {
    const { propertyId, personalInfo, employmentInfo, rentalHistory, references, notes } = req.body;
    
    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Check if user already applied
    const existingApplication = await Application.findOne({
      property: propertyId,
      tenant: req.user.id
    });
    
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this property'
      });
    }
    
    const application = await Application.create({
      property: propertyId,
      tenant: req.user.id,
      agent: property.agent,
      personalInfo,
      employmentInfo,
      rentalHistory,
      references,
      notes
    });
    
    // Send notification to agent
    await Notification.create({
      recipient: property.agent,
      type: 'application_received',
      title: 'New Application Received',
      message: `You have received a new application for ${property.title}`,
      data: {
        propertyId: propertyId,
        applicationId: application._id
      }
    });
    
    const populatedApplication = await Application.findById(application._id)
      .populate('property', 'title address')
      .populate('tenant', 'name email')
      .populate('agent', 'name email');
    
    res.status(201).json({
      success: true,
      application: populatedApplication
    });
  } catch (error) {
    next(error);
  }
};

exports.updateApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Check permissions
    if (req.user.role === 'tenant' && application.tenant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }
    
    // Tenants can only update their own info, agents can update status
    if (req.user.role === 'tenant') {
      const allowedUpdates = ['personalInfo', 'employmentInfo', 'rentalHistory', 'references', 'notes'];
      const updates = {};
      
      allowedUpdates.forEach(field => {
        if (req.body[field]) updates[field] = req.body[field];
      });
      
      Object.assign(application, updates);
    } else if (req.user.role === 'agent') {
      const { status, rejectionReason } = req.body;
      
      if (status) {
        application.status = status;
        application.reviewedAt = Date.now();
        application.reviewedBy = req.user.id;
        
        if (status === 'rejected' && rejectionReason) {
          application.rejectionReason = rejectionReason;
        }
        
        if (status === 'approved') {
          application.approvedAt = Date.now();
          
          // Send notification to tenant
          await Notification.create({
            recipient: application.tenant,
            type: 'application_approved',
            title: 'Application Approved',
            message: `Your application for ${application.property} has been approved`,
            data: {
              propertyId: application.property,
              applicationId: application._id
            }
          });
        } else if (status === 'rejected') {
          // Send notification to tenant
          await Notification.create({
            recipient: application.tenant,
            type: 'application_rejected',
            title: 'Application Rejected',
            message: `Your application for ${application.property} has been rejected`,
            data: {
              propertyId: application.property,
              applicationId: application._id
            }
          });
        }
      }
    }
    
    await application.save();
    
    const updatedApplication = await Application.findById(application._id)
      .populate('property', 'title address')
      .populate('tenant', 'name email')
      .populate('agent', 'name email');
    
    res.json({
      success: true,
      application: updatedApplication
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadDocument = async (req, res, next) => {
  try {
    const { type } = req.body;
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Check permissions
    if (application.tenant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload documents to this application'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    application.documents.push({
      type,
      url: req.file.path,
      publicId: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
    
    await application.save();
    
    res.json({
      success: true,
      document: application.documents[application.documents.length - 1]
    });
  } catch (error) {
    next(error);
  }
};

exports.withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Check permissions - only tenant can withdraw
    if (application.tenant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application'
      });
    }
    
    application.status = 'withdrawn';
    await application.save();
    
    // Send notification to agent
    await Notification.create({
      recipient: application.agent,
      type: 'application_status',
      title: 'Application Withdrawn',
      message: `An application for ${application.property} has been withdrawn`,
      data: {
        propertyId: application.property,
        applicationId: application._id
      }
    });
    
    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    next(error);
  }
};