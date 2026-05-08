# PropRent Docker Configuration

This directory contains Docker configuration files for deploying the PropRent real estate rental platform.

## 📁 Files Overview

### Docker Images
- **`Dockerfile.server`** - Multi-stage build for the Node.js backend server
- **`Dockerfile.client`** - Multi-stage build for the React frontend with Nginx

### Docker Compose Files
- **`docker-compose.yml`** - Base configuration (existing)
- **`docker-compose.dev.yml`** - Development environment with hot reload
- **`docker-compose.prod.yml`** - Production environment with monitoring

### Configuration Files
- **`nginx.conf`** - Base Nginx configuration
- **`nginx.dev.conf`** - Development Nginx with relaxed security
- **`nginx.prod.conf`** - Production Nginx with security hardening
- **`.env.example`** - Environment variables template
- **`mongo-init.js`** - MongoDB initialization script
- **`backup.sh`** - Automated backup script

## 🚀 Quick Start

### Development Environment

1. **Copy environment file:**
   ```bash
   cp docker/.env.example .env
   ```

2. **Start development services:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Access services:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB Express: http://localhost:8081
   - Redis Commander: http://localhost:8082

### Production Environment

1. **Setup environment variables:**
   ```bash
   cp docker/.env.example .env
   # Edit .env with production values
   ```

2. **Generate SSL certificates:**
   ```bash
   mkdir -p ssl
   # Place your cert.pem and key.pem files in ssl/ directory
   ```

3. **Start production services:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Access services:**
   - Application: https://yourdomain.com
   - Grafana (monitoring): http://localhost:3001
   - Prometheus (metrics): http://localhost:9090

## 📋 Environment Variables

### Required Variables
- `MONGO_ROOT_PASSWORD` - MongoDB admin password
- `REDIS_PASSWORD` - Redis password
- `JWT_SECRET` - JWT signing secret (32+ chars)
- `JWT_REFRESH_SECRET` - JWT refresh secret (32+ chars)
- `CLIENT_URL` - Frontend URL (e.g., https://yourdomain.com)

### Optional Variables
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` - Email configuration
- `CLOUDINARY_*` - Image upload service
- `MAPBOX_ACCESS_TOKEN` - Maps service
- `STRIPE_*` - Payment processing
- `GRAFANA_PASSWORD` - Monitoring dashboard

## 🔧 Services Overview

### Database Services
- **MongoDB** - Primary database with validation schemas
- **Redis** - Session storage and caching

### Application Services
- **Server** - Node.js backend (port 5000)
- **Client** - React frontend served by Nginx (port 80/443)

### Development Tools
- **Mongo Express** - MongoDB management UI (port 8081)
- **Redis Commander** - Redis management UI (port 8082)

### Production Monitoring
- **Prometheus** - Metrics collection (port 9090)
- **Grafana** - Visualization dashboard (port 3001)

## 🗄️ Database Setup

The MongoDB initialization script (`mongo-init.js`) automatically:

1. **Creates application database** (`proprender`)
2. **Sets up application user** with read/write permissions
3. **Creates collections** with JSON Schema validation:
   - `users` - User accounts with role-based access
   - `properties` - Property listings with location indexing
   - `applications` - Rental applications
   - `leases` - Lease agreements
   - `payments` - Payment records
   - `maintenance` - Maintenance requests
   - `messages` - Chat messages
   - `conversations` - Chat conversations
   - `notifications` - User notifications

4. **Creates indexes** for optimal performance
5. **Sets up text search** for property listings

## 🔒 Security Features

### Nginx Security
- **HTTPS enforcement** with SSL/TLS
- **Security headers** (CSP, HSTS, X-Frame-Options, etc.)
- **Rate limiting** for API endpoints
- **Request size limits**
- **Bot blocking**
- **File access restrictions**

### Application Security
- **JWT authentication** with refresh tokens
- **Role-based access control**
- **Input validation** and sanitization
- **Rate limiting** on sensitive endpoints
- **CORS configuration**
- **Session management**

### Container Security
- **Non-root users** for all containers
- **Read-only filesystems** where possible
- **Resource limits** and constraints
- **Health checks** for all services
- **Secret management** via environment variables

## 📊 Monitoring & Logging

### Application Metrics
- **Response times** and error rates
- **Database performance** metrics
- **User activity** tracking
- **Resource utilization** monitoring

### System Monitoring
- **Container health** status
- **Resource usage** (CPU, memory, disk)
- **Network traffic** monitoring
- **Backup status** tracking

### Logging
- **Structured JSON logging** with timestamps
- **Log rotation** and retention policies
- **Centralized log collection**
- **Error tracking** and alerting

## 💾 Backup & Recovery

### Automated Backups
- **Daily MongoDB backups** with compression
- **S3 integration** for cloud storage
- **Retention policies** (30 days default)
- **Backup verification** and integrity checks

### Manual Backup
```bash
# Run backup manually
docker-compose exec mongodb mongodump --db proprender --out /backups/manual_$(date +%Y%m%d)

# Restore from backup
docker-compose exec mongodb mongorestore --db proprender /backups/backup_name
```

### Disaster Recovery
1. **Stop all services**
2. **Restore database** from latest backup
3. **Restart services** in correct order
4. **Verify application** functionality

## 🔄 Development Workflow

### Hot Reload Development
```bash
# Start with hot reload enabled
docker-compose -f docker-compose.dev.yml up

# View logs in real-time
docker-compose -f docker-compose.dev.yml logs -f server
docker-compose -f docker-compose.dev.yml logs -f client
```

### Database Seeding
```bash
# Seed development database
docker-compose exec mongodb mongo proprender --eval "
  // Your seeding script here
"
```

### Testing
```bash
# Run tests in container
docker-compose -f docker-compose.dev.yml exec server npm test
docker-compose -f docker-compose.dev.yml exec client npm test
```

## 🚀 Production Deployment

### Pre-deployment Checklist
- [ ] Environment variables configured
- [ ] SSL certificates in place
- [ ] Database backups enabled
- [ ] Monitoring configured
- [ ] Security headers verified
- [ ] Resource limits set
- [ ] Health checks passing

### Deployment Steps
1. **Build and push images** to registry
2. **Update environment variables**
3. **Deploy with rolling updates**
4. **Verify service health**
5. **Monitor performance metrics**

### Scaling
```bash
# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale server=3 --scale client=2

# Load balancing via Nginx
# Automatic failover handling
```

## 🔧 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check MongoDB status
docker-compose exec mongodb mongo --eval "db.adminCommand('ping')"

# Check Redis status
docker-compose exec redis redis-cli ping
```

#### Service Health
```bash
# Check container status
docker-compose ps

# View service logs
docker-compose logs [service_name]

# Restart specific service
docker-compose restart [service_name]
```

#### Performance Issues
```bash
# Monitor resource usage
docker stats

# Check database performance
docker-compose exec mongodb mongo --eval "db.stats()"
```

### Debug Mode
```bash
# Run with debug logging
DEBUG=* docker-compose -f docker-compose.dev.yml up
```

## 📚 Additional Resources

### Docker Documentation
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

### Security Resources
- [OWASP Docker Security](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [Nginx Security Guide](https://www.nginx.com/blog/nginx-security-best-practices/)

### Monitoring Tools
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

## 🆘 Support

For issues with the Docker configuration:

1. **Check logs** for error messages
2. **Verify environment variables** are correctly set
3. **Ensure proper file permissions** on SSL certificates
4. **Check resource availability** (disk space, memory)
5. **Review network configuration** and port conflicts

For application-specific issues, refer to the main application documentation.
