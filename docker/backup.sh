#!/bin/bash

# MongoDB backup script for PropRent
# This script creates automated backups of the PropRent MongoDB database

# Configuration
DB_NAME="proprender"
DB_USER="admin"
DB_HOST="mongodb"
DB_PORT="27017"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="proprender_backup_${DATE}"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Start backup process
log "Starting MongoDB backup for database: ${DB_NAME}"

# Get MongoDB password from environment
if [ -z "$MONGO_ROOT_PASSWORD" ]; then
    log "ERROR: MONGO_ROOT_PASSWORD environment variable is not set"
    exit 1
fi

# Create backup directory for this backup
mkdir -p ${BACKUP_DIR}/${BACKUP_NAME}

# Perform the backup
log "Creating backup: ${BACKUP_NAME}"

mongodump \
    --host ${DB_HOST}:${DB_PORT} \
    --username ${DB_USER} \
    --password ${MONGO_ROOT_PASSWORD} \
    --db ${DB_NAME} \
    --out ${BACKUP_DIR}/${BACKUP_NAME} \
    --gzip

# Check if backup was successful
if [ $? -eq 0 ]; then
    log "Backup completed successfully: ${BACKUP_DIR}/${BACKUP_NAME}"
    
    # Create backup metadata file
    cat > ${BACKUP_DIR}/${BACKUP_NAME}/metadata.json << EOF
{
    "backup_name": "${BACKUP_NAME}",
    "database": "${DB_NAME}",
    "created_at": "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)",
    "size_bytes": $(du -sb ${BACKUP_DIR}/${BACKUP_NAME} | cut -f1),
    "compressed": true,
    "format": "mongodump"
}
EOF
    
    log "Backup metadata created"
    
    # Compress the entire backup directory
    log "Compressing backup directory..."
    tar -czf ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz -C ${BACKUP_DIR} ${BACKUP_NAME}
    
    # Remove uncompressed backup directory
    rm -rf ${BACKUP_DIR}/${BACKUP_NAME}
    
    log "Backup compressed: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    
    # Calculate backup size
    BACKUP_SIZE=$(du -h ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz | cut -f1)
    log "Backup size: ${BACKUP_SIZE}"
    
else
    log "ERROR: Backup failed"
    exit 1
fi

# Clean up old backups
log "Cleaning up backups older than ${RETENTION_DAYS} days..."
find ${BACKUP_DIR} -name "proprender_backup_*.tar.gz" -mtime +${RETENTION_DAYS} -delete

# List remaining backups
log "Current backups:"
ls -lh ${BACKUP_DIR}/proprender_backup_*.tar.gz

# Upload to S3 if configured (optional)
if [ ! -z "$BACKUP_S3_BUCKET" ] && [ ! -z "$BACKUP_S3_REGION" ] && [ ! -z "$BACKUP_S3_ACCESS_KEY" ] && [ ! -z "$BACKUP_S3_SECRET_KEY" ]; then
    log "Uploading backup to S3 bucket: ${BACKUP_S3_BUCKET}"
    
    # Configure AWS CLI
    aws configure set aws_access_key_id ${BACKUP_S3_ACCESS_KEY}
    aws configure set aws_secret_access_key ${BACKUP_S3_SECRET_KEY}
    aws configure set default.region ${BACKUP_S3_REGION}
    
    # Upload to S3
    aws s3 cp ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz s3://${BACKUP_S3_BUCKET}/backups/
    
    if [ $? -eq 0 ]; then
        log "Backup uploaded to S3 successfully"
        
        # Verify upload
        if aws s3 ls s3://${BACKUP_S3_BUCKET}/backups/${BACKUP_NAME}.tar.gz > /dev/null 2>&1; then
            log "S3 upload verified successfully"
        else
            log "WARNING: S3 upload verification failed"
        fi
    else
        log "ERROR: Failed to upload backup to S3"
    fi
else
    log "S3 backup not configured (missing environment variables)"
fi

# Send notification if configured (optional)
if [ ! -z "$NOTIFICATION_EMAIL" ] && [ ! -z "$SMTP_HOST" ] && [ ! -z "$SMTP_USER" ] && [ ! -z "$SMTP_PASS" ]; then
    log "Sending backup notification to: ${NOTIFICATION_EMAIL}"
    
    # Send email notification
    echo "Subject: PropRent MongoDB Backup Completed - ${BACKUP_NAME}

Backup completed successfully for PropRent database.

Backup details:
- Name: ${BACKUP_NAME}
- Database: ${DB_NAME}
- Size: ${BACKUP_SIZE}
- Date: $(date)
- Location: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz

This backup will be retained for ${RETENTION_DAYS} days.

Best regards,
PropRent Backup System" | sendmail -t ${NOTIFICATION_EMAIL}
    
    if [ $? -eq 0 ]; then
        log "Notification sent successfully"
    else
        log "WARNING: Failed to send notification"
    fi
fi

# Health check - verify backup integrity
log "Verifying backup integrity..."
if tar -tzf ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz | head -5 > /dev/null 2>&1; then
    log "Backup integrity verified successfully"
else
    log "WARNING: Backup integrity verification failed"
fi

log "Backup process completed successfully"

# Exit with success
exit 0
