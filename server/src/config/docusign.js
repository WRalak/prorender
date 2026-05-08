const docusign = require('docusign-esign');
const fs = require('fs');
const path = require('path');

// DocuSign configuration
const docusignApi = docusign.ApiClient.getInstance();

// Initialize DocuSign client
const initializeDocuSign = () => {
  try {
    // Set OAuth configuration
    docusignApi.setOAuthBasePath(process.env.DOCUSIGN_BASE_PATH || 'account-d.docusign.com');
    
    // Integration key (client ID)
    const integratorKey = process.env.DOCUSIGN_INTEGRATOR_KEY;
    
    // User ID and key for JWT authentication
    const userId = process.env.DOCUSIGN_USER_ID;
    const rsaKey = fs.readFileSync(
      path.join(process.cwd(), 'config', 'docusign-private-key.txt'),
      'utf8'
    );

    return {
      apiClient: docusignApi,
      integratorKey,
      userId,
      rsaKey,
      basePath: process.env.DOCUSIGN_BASE_PATH || 'account-d.docusign.com'
    };
  } catch (error) {
    console.error('Failed to initialize DocuSign:', error);
    return null;
  }
};

// Get OAuth access token
const getAccessToken = async () => {
  try {
    const config = initializeDocuSign();
    if (!config) {
      throw new Error('DocuSign not properly configured');
    }

    const oauth = docusign.ApiClient.OAuth;
    
    const response = await oauth.postToken(
      config.integratorKey,
      'signature',
      config.userId,
      3600,
      config.rsaKey
    );

    return response.body.access_token;
  } catch (error) {
    console.error('Failed to get DocuSign access token:', error);
    throw error;
  }
};

// Create envelope for document signing
const createEnvelope = async (documentData, signers, accessToken) => {
  try {
    const config = initializeDocuSign();
    docusignApi.addDefaultHeader('Authorization', `Bearer ${accessToken}`);
    
    // Get account info
    const accountsApi = new docusign.AccountsApi(docusignApi);
    const accountInfo = await accountsApi.getAccountInformation(config.basePath);
    const accountId = accountInfo.accountId;

    // Create envelope definition
    const env = docusign.EnvelopeDefinition.constructFromObject({
      emailSubject: documentData.subject || 'Please sign this document',
      documents: [
        {
          documentBase64: documentData.base64,
          name: documentData.name || 'Document',
          fileExtension: documentData.extension || 'pdf',
          documentId: '1'
        }
      ],
      recipients: {
        signers: signers.map((signer, index) => ({
          email: signer.email,
          name: signer.name,
          recipientId: index + 1,
          routingOrder: index + 1,
          tabs: {
            signHereTabs: signer.tabs || [
              {
                anchorString: 'Signature:',
                anchorYOffset: '10',
                anchorUnits: 'pixels',
                anchorXOffset: '20'
              }
            ]
          }
        }))
      },
      status: 'sent'
    });

    // Create envelope
    const envelopesApi = new docusign.EnvelopesApi(docusignApi);
    const envelopeResult = await envelopesApi.createEnvelope(accountId, env);
    
    return {
      envelopeId: envelopeResult.envelopeId,
      status: envelopeResult.status,
      uri: envelopeResult.uri
    };
  } catch (error) {
    console.error('Failed to create DocuSign envelope:', error);
    throw error;
  }
};

// Get envelope status
const getEnvelopeStatus = async (envelopeId, accessToken) => {
  try {
    const config = initializeDocuSign();
    docusignApi.addDefaultHeader('Authorization', `Bearer ${accessToken}`);
    
    const accountsApi = new docusign.AccountsApi(docusignApi);
    const accountInfo = await accountsApi.getAccountInformation(config.basePath);
    const accountId = accountInfo.accountId;

    const envelopesApi = new docusign.EnvelopesApi(docusignApi);
    const envelope = await envelopesApi.getEnvelope(accountId, envelopeId);
    
    return {
      envelopeId: envelope.envelopeId,
      status: envelope.status,
      createdDateTime: envelope.createdDateTime,
      sentDateTime: envelope.sentDateTime,
      completedDateTime: envelope.completedDateTime,
      recipients: envelope.recipients
    };
  } catch (error) {
    console.error('Failed to get envelope status:', error);
    throw error;
  }
};

// Get recipient view URL for embedded signing
const getRecipientView = async (envelopeId, signerEmail, signerName, returnUrl, accessToken) => {
  try {
    const config = initializeDocuSign();
    docusignApi.addDefaultHeader('Authorization', `Bearer ${accessToken}`);
    
    const accountsApi = new docusign.AccountsApi(docusignApi);
    const accountInfo = await accountsApi.getAccountInformation(config.basePath);
    const accountId = accountInfo.accountId;

    const envelopesApi = new docusign.EnvelopesApi(docusignApi);
    
    const viewRequest = docusign.RecipientViewRequest.constructFromObject({
      authenticationMethod: 'email',
      userId: config.userId,
      email: signerEmail,
      userName: signerName,
      recipientId: '1',
      returnUrl: returnUrl,
      pingFrequency: 600,
      pingUrl: `${process.env.CLIENT_URL}/api/docusign/ping`
    });

    const recipientView = await envelopesApi.createRecipientView(
      accountId,
      envelopeId,
      viewRequest
    );
    
    return {
      url: recipientView.url
    };
  } catch (error) {
    console.error('Failed to get recipient view:', error);
    throw error;
  }
};

// Download signed documents
const downloadDocuments = async (envelopeId, accessToken) => {
  try {
    const config = initializeDocuSign();
    docusignApi.addDefaultHeader('Authorization', `Bearer ${accessToken}`);
    
    const accountsApi = new docusign.AccountsApi(docusignApi);
    const accountInfo = await accountsApi.getAccountInformation(config.basePath);
    const accountId = accountInfo.accountId;

    const envelopesApi = new docusign.EnvelopesApi(docusignApi);
    
    // Get envelope documents
    const documents = await envelopesApi.listDocuments(accountId, envelopeId);
    
    const downloadedDocs = [];
    
    for (const doc of documents.envelopeDocuments) {
      const docData = await envelopesApi.getDocument(
        accountId,
        envelopeId,
        doc.documentId
      );
      
      downloadedDocs.push({
        name: doc.name,
        type: doc.type,
        documentId: doc.documentId,
        data: docData
      });
    }
    
    return downloadedDocs;
  } catch (error) {
    console.error('Failed to download documents:', error);
    throw error;
  }
};

// Webhook handler for DocuSign events
const handleWebhook = async (webhookData) => {
  try {
    const { event, envelope } = webhookData;
    
    console.log(`DocuSign webhook received: ${event} for envelope ${envelope.envelopeId}`);
    
    // Handle different events
    switch (event) {
      case 'envelope-sent':
        // Handle envelope sent
        break;
        
      case 'envelope-delivered':
        // Handle envelope delivered
        break;
        
      case 'envelope-completed':
        // Handle envelope completed (all signed)
        await handleEnvelopeCompleted(envelope);
        break;
        
      case 'envelope-declined':
        // Handle envelope declined
        await handleEnvelopeDeclined(envelope);
        break;
        
      default:
        console.log(`Unhandled DocuSign event: ${event}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error handling DocuSign webhook:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to handle completed envelopes
const handleEnvelopeCompleted = async (envelope) => {
  try {
    // Update your database with the completed envelope status
    console.log(`Envelope ${envelope.envelopeId} completed successfully`);
    
    // You might want to:
    // 1. Download the signed documents
    // 2. Update lease status
    // 3. Send notifications
    // 4. Update application status
  } catch (error) {
    console.error('Error handling completed envelope:', error);
  }
};

// Helper function to handle declined envelopes
const handleEnvelopeDeclined = async (envelope) => {
  try {
    // Update your database with the declined envelope status
    console.log(`Envelope ${envelope.envelopeId} was declined`);
    
    // You might want to:
    // 1. Notify relevant parties
    // 2. Update application status
    // 3. Log the decline reason
  } catch (error) {
    console.error('Error handling declined envelope:', error);
  }
};

// Validate DocuSign configuration
const validateConfig = () => {
  const required = [
    'DOCUSIGN_INTEGRATOR_KEY',
    'DOCUSIGN_USER_ID',
    'DOCUSIGN_BASE_PATH'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    return {
      valid: false,
      missing: missing,
      message: `Missing DocuSign environment variables: ${missing.join(', ')}`
    };
  }
  
  // Check if private key file exists
  const keyPath = path.join(process.cwd(), 'config', 'docusign-private-key.txt');
  if (!fs.existsSync(keyPath)) {
    return {
      valid: false,
      missing: ['docusign-private-key.txt'],
      message: 'DocuSign private key file not found'
    };
  }
  
  return { valid: true };
};

module.exports = {
  initializeDocuSign,
  getAccessToken,
  createEnvelope,
  getEnvelopeStatus,
  getRecipientView,
  downloadDocuments,
  handleWebhook,
  validateConfig
};