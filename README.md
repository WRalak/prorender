# PropRent - Real Estate Rental Platform

A comprehensive real estate rental platform that connects tenants, agents, and administrators in a seamless property management ecosystem.

## 🚀 Features

### For Tenants
- **Property Search**: Advanced filtering and search capabilities
- **Online Applications**: Apply to properties with digital document uploads
- **Real-time Messaging**: Communicate directly with agents
- **Payment Management**: Secure online rent payments and tracking
- **Maintenance Requests**: Submit and track maintenance issues
- **Favorites & Saved Searches**: Save properties and search criteria

### For Agents
- **Property Management**: List and manage rental properties
- **Application Processing**: Review and approve tenant applications
- **Lease Management**: Create and manage digital leases
- **Communication Hub**: Real-time messaging with tenants
- **Analytics Dashboard**: Track performance and metrics
- **Document Management**: Secure storage of property documents

### For Administrators
- **User Management**: Manage tenants and agents
- **System Oversight**: Monitor platform activity
- **Reporting & Analytics**: Comprehensive insights and reports
- **Settings Management: Configure platform settings
- **Audit Logs**: Track all system activities

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **React Router 7** - Client-side routing
- **TailwindCSS 4** - Utility-first CSS framework
- **React Query** - Server state management
- **Socket.io Client** - Real-time communication
- **React Hook Form** - Form management
- **Chart.js** - Data visualization
- **Mapbox** - Interactive maps

### Backend
- **Node.js** - JavaScript runtime
- **Express 4** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - Object data modeling
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Cloudinary** - Cloud image storage
- **Stripe** - Payment processing
- **Nodemailer** - Email services
- **Redis** - Caching and sessions

### Additional Services
- **Winston** - Logging
- **Bull** - Job queue
- **PDFKit** - PDF generation
- **DocuSign** - Digital signatures

## 📁 Project Structure

```
prorender/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── routes/         # Route definitions
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── sockets/        # Socket.io handlers
│   │   └── utils/          # Utility functions
│   └── package.json
├── docker/                 # Docker configuration
├── nginx/                  # Nginx configuration
└── package.json           # Root package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 8+
- MongoDB 5+
- Redis 6+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd prorender
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Setup**
   
   Create `.env` files in both `server` and `client` directories:

   **Server `.env`:**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/prorender
   REDIS_HOST=localhost
   REDIS_PORT=6379
   
   JWT_SECRET=your-jwt-secret
   JWT_EXPIRE=7d
   
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@prorender.com
   
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   CLIENT_URL=http://localhost:3000
   ```

   **Client `.env`:**
   ```env
   REACT_APP_SERVER_URL=http://localhost:5000
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
   REACT_APP_MAPBOX_TOKEN=your-mapbox-token
   ```

4. **Start Development Servers**
   ```bash
   npm run dev
   ```

   This will start both the frontend (http://localhost:3000) and backend (http://localhost:5000) servers.

### Database Seeding

To populate the database with sample data:

```bash
npm run seed
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property (Agent only)
- `PUT /api/properties/:id` - Update property (Agent only)
- `DELETE /api/properties/:id` - Delete property (Agent only)

### Applications
- `GET /api/applications` - Get user applications
- `POST /api/applications` - Submit application
- `PUT /api/applications/:id` - Update application
- `POST /api/applications/:id/documents` - Upload documents

### Messages
- `GET /api/messages` - Get conversations
- `GET /api/messages/:id` - Get conversation details
- `POST /api/messages` - Send message

### Payments
- `GET /api/payments` - Get payment history
- `POST /api/payments` - Process payment
- `GET /api/payments/:id` - Get payment details

## 🔧 Development

### Code Style
- Use ESLint for code linting
- Follow React hooks best practices
- Maintain consistent naming conventions
- Write meaningful commit messages

### Testing
```bash
npm test
```

### Building for Production
```bash
npm run build
```

## 🚀 Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Manual Deployment
1. Build the frontend: `npm run build`
2. Set production environment variables
3. Start the server: `npm run server:start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: support@prorender.com
- Documentation: [docs.prorender.com](https://docs.prorender.com)
- Issues: [GitHub Issues](https://github.com/prorender/prorender/issues)

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] AI-powered property recommendations
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] International property listings
- [ ] IoT integration for smart homes