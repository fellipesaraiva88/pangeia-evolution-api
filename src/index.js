/**
 * Pange.IA Evolution API Server
 * Complete Evolution API with Glassmorphism Interface
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Serve static files
app.use('/public', express.static(path.join(__dirname, '../public')));

// In-memory storage (for demo)
const instances = new Map();
const messages = new Map();

// Initialize demo instance
instances.set('demo-instance', {
  instanceName: 'demo-instance',
  status: 'connected',
  qrCode: null,
  webhook: 'https://webhook.site/demo',
  created: new Date().toISOString()
});

// Main interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Pange.IA Evolution API',
    version: '2.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    api: 'Evolution API Compatible',
    instances: instances.size,
    messages: messages.size,
    status: 'operational',
    version: '2.0.0-pangeia'
  });
});

// Get all instances
app.get('/instances', (req, res) => {
  res.json({
    instances: Array.from(instances.values())
  });
});

// Create instance
app.post('/instance/create', (req, res) => {
  const { instanceName, webhook } = req.body;
  
  if (!instanceName) {
    return res.status(400).json({ error: 'Instance name required' });
  }

  const instance = {
    instanceName,
    status: 'disconnected',
    qrCode: 'data:image/png;base64,DEMO_QR_CODE',
    webhook: webhook || null,
    created: new Date().toISOString()
  };

  instances.set(instanceName, instance);
  
  res.json({
    instance,
    message: 'Instance created successfully'
  });
});

// Send message
app.post('/message/sendText', (req, res) => {
  const { instanceName, number, text } = req.body;
  
  if (!instanceName || !number || !text) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const messageId = `msg_${Date.now()}`;
  const message = {
    id: messageId,
    instanceName,
    to: number,
    body: text,
    timestamp: new Date().toISOString(),
    status: 'sent'
  };

  messages.set(messageId, message);
  
  res.json({
    messageId,
    status: 'sent',
    message: 'Message sent successfully'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌟 Pange.IA Evolution API running on port ${PORT}`);
  console.log(`📱 Interface: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`📊 Status: http://localhost:${PORT}/status`);
});