const Bull = require('bull');
const { logger } = require('../config/logger');
const cacheService = require('./cacheService');

class QueueService {
  constructor() {
    this.queues = new Map();
    this.redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: process.env.REDIS_DB || 0,
    };
    this.defaultOptions = {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
    };
  }

  // Create or get a queue
  getQueue(name, options = {}) {
    if (!this.queues.has(name)) {
      const queueOptions = {
        ...this.defaultOptions,
        ...options,
        redis: this.redisConfig,
      };

      const queue = new Bull(name, queueOptions);
      
      // Set up event listeners
      this.setupQueueListeners(queue, name);
      
      this.queues.set(name, queue);
      logger.info(`Queue created: ${name}`);
    }

    return this.queues.get(name);
  }

  // Set up queue event listeners
  setupQueueListeners(queue, name) {
    queue.on('completed', (job, result) => {
      logger.info(`Job completed in queue ${name}: ${job.id}`, { result });
    });

    queue.on('failed', (job, err) => {
      logger.error(`Job failed in queue ${name}: ${job.id}`, { error: err.message, stack: err.stack });
    });

    queue.on('stalled', (job) => {
      logger.warn(`Job stalled in queue ${name}: ${job.id}`);
    });

    queue.on('progress', (job, progress) => {
      logger.debug(`Job progress in queue ${name}: ${job.id} - ${progress}%`);
    });

    queue.on('error', (err) => {
      logger.error(`Queue error ${name}:`, err);
    });
  }

  // Add job to queue
  async addJob(queueName, jobData, options = {}) {
    try {
      const queue = this.getQueue(queueName);
      
      const jobOptions = {
        ...this.defaultOptions,
        ...options,
      };

      const job = await queue.add(jobData, jobOptions);
      
      logger.info(`Job added to queue ${queueName}: ${job.id}`, { data: jobData });
      return job;

    } catch (error) {
      logger.error(`Failed to add job to queue ${queueName}:`, error);
      throw error;
    }
  }

  // Process jobs in queue
  processQueue(queueName, processor, concurrency = 1) {
    try {
      const queue = this.getQueue(queueName);
      
      queue.process(concurrency, async (job) => {
        logger.info(`Processing job ${job.id} in queue ${queueName}`);
        
        try {
          const result = await processor(job.data, job);
          logger.info(`Job ${job.id} processed successfully`);
          return result;
        } catch (error) {
          logger.error(`Job ${job.id} processing failed:`, error);
          throw error;
        }
      });

      logger.info(`Queue processor set up: ${queueName} (concurrency: ${concurrency})`);

    } catch (error) {
      logger.error(`Failed to set up queue processor for ${queueName}:`, error);
      throw error;
    }
  }

  // Get job by ID
  async getJob(queueName, jobId) {
    try {
      const queue = this.getQueue(queueName);
      const job = await queue.getJob(jobId);
      return job;
    } catch (error) {
      logger.error(`Failed to get job ${jobId} from queue ${queueName}:`, error);
      return null;
    }
  }

  // Get queue statistics
  async getQueueStats(queueName) {
    try {
      const queue = this.getQueue(queueName);
      
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaiting(),
        queue.getActive(),
        queue.getCompleted(),
        queue.getFailed(),
        queue.getDelayed(),
      ]);

      return {
        queueName,
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        total: waiting.length + active.length + completed.length + failed.length + delayed.length,
      };

    } catch (error) {
      logger.error(`Failed to get queue stats for ${queueName}:`, error);
      return null;
    }
  }

  // Get all queue statistics
  async getAllQueueStats() {
    const stats = {};
    
    for (const queueName of this.queues.keys()) {
      stats[queueName] = await this.getQueueStats(queueName);
    }

    return stats;
  }

  // Pause queue
  async pauseQueue(queueName) {
    try {
      const queue = this.getQueue(queueName);
      await queue.pause();
      logger.info(`Queue paused: ${queueName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to pause queue ${queueName}:`, error);
      return false;
    }
  }

  // Resume queue
  async resumeQueue(queueName) {
    try {
      const queue = this.getQueue(queueName);
      await queue.resume();
      logger.info(`Queue resumed: ${queueName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to resume queue ${queueName}:`, error);
      return false;
    }
  }

  // Clear queue
  async clearQueue(queueName, type = 'completed') {
    try {
      const queue = this.getQueue(queueName);
      await queue.clean(0, type);
      logger.info(`Queue cleared: ${queueName} (type: ${type})`);
      return true;
    } catch (error) {
      logger.error(`Failed to clear queue ${queueName}:`, error);
      return false;
    }
  }

  // Remove job
  async removeJob(queueName, jobId) {
    try {
      const job = await this.getJob(queueName, jobId);
      if (job) {
        await job.remove();
        logger.info(`Job removed: ${jobId} from queue ${queueName}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Failed to remove job ${jobId} from queue ${queueName}:`, error);
      return false;
    }
  }

  // Retry failed job
  async retryJob(queueName, jobId) {
    try {
      const job = await this.getJob(queueName, jobId);
      if (job) {
        await job.retry();
        logger.info(`Job retried: ${jobId} in queue ${queueName}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Failed to retry job ${jobId} in queue ${queueName}:`, error);
      return false;
    }
  }

  // Schedule delayed job
  async scheduleJob(queueName, jobData, delay, options = {}) {
    try {
      const queue = this.getQueue(queueName);
      
      const jobOptions = {
        ...this.defaultOptions,
        ...options,
        delay: delay,
      };

      const job = await queue.add(jobData, jobOptions);
      
      logger.info(`Job scheduled in queue ${queueName}: ${job.id} (delay: ${delay}ms)`);
      return job;

    } catch (error) {
      logger.error(`Failed to schedule job in queue ${queueName}:`, error);
      throw error;
    }
  }

  // Add recurring job
  async addRecurringJob(queueName, jobData, cronExpression, options = {}) {
    try {
      const queue = this.getQueue(queueName);
      
      const jobOptions = {
        ...this.defaultOptions,
        ...options,
        repeat: { cron: cronExpression },
      };

      const job = await queue.add(jobData, jobOptions);
      
      logger.info(`Recurring job added to queue ${queueName}: ${job.id} (cron: ${cronExpression})`);
      return job;

    } catch (error) {
      logger.error(`Failed to add recurring job to queue ${queueName}:`, error);
      throw error;
    }
  }

  // Cancel recurring job
  async cancelRecurringJob(queueName, jobId) {
    try {
      const queue = this.getQueue(queueName);
      const job = await this.getJob(queueName, jobId);
      
      if (job && job.opts.repeat) {
        await queue.removeRepeatableByKey(job.opts.repeat.key);
        logger.info(`Recurring job cancelled: ${jobId} in queue ${queueName}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error(`Failed to cancel recurring job ${jobId} in queue ${queueName}:`, error);
      return false;
    }
  }

  // Get job counts by type
  async getJobCounts(queueName) {
    try {
      const queue = this.getQueue(queueName);
      const counts = await queue.getJobCounts();
      return counts;
    } catch (error) {
      logger.error(`Failed to get job counts for queue ${queueName}:`, error);
      return null;
    }
  }

  // Set up queue monitoring
  setupMonitoring() {
    // Log queue stats every 5 minutes
    setInterval(async () => {
      try {
        const stats = await this.getAllQueueStats();
        logger.info('Queue stats:', stats);
      } catch (error) {
        logger.error('Error getting queue stats:', error);
      }
    }, 5 * 60 * 1000);
  }

  // Graceful shutdown
  async shutdown() {
    try {
      logger.info('Shutting down queue service...');
      
      const shutdownPromises = [];
      
      for (const [name, queue] of this.queues) {
        shutdownPromises.push(
          queue.close().then(() => {
            logger.info(`Queue closed: ${name}`);
          }).catch(error => {
            logger.error(`Error closing queue ${name}:`, error);
          })
        );
      }

      await Promise.all(shutdownPromises);
      this.queues.clear();
      
      logger.info('Queue service shutdown complete');
      
    } catch (error) {
      logger.error('Error during queue service shutdown:', error);
    }
  }

  // Health check
  async healthCheck() {
    try {
      const stats = await this.getAllQueueStats();
      const totalJobs = Object.values(stats).reduce((sum, stat) => sum + (stat?.total || 0), 0);
      
      return {
        status: 'healthy',
        queues: this.queues.size,
        totalJobs,
        stats,
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }
}

// Create singleton instance
const queueService = new QueueService();

// Predefined queue names
const QUEUE_NAMES = {
  EMAIL: 'email',
  NOTIFICATION: 'notification',
  CLEANUP: 'cleanup',
  BACKUP: 'backup',
  SUBSCRIPTION: 'subscription',
  PAYMENT: 'payment',
  REPORT: 'report',
  MAINTENANCE: 'maintenance',
  ANALYTICS: 'analytics',
  WEBHOOK: 'webhook',
};

module.exports = {
  queueService,
  QUEUE_NAMES,
};
