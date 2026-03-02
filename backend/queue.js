import { Worker } from 'bullmq';
import { redisConnection } from './config/redis.js';
import { processEmailJob } from './workers/email.js';

console.log('🚀 Starting background worker...');

// Create a new worker to process jobs from the 'email-queue'
new Worker('email-queue', processEmailJob, {
  connection: redisConnection,
  concurrency: 5, // Process up to 5 jobs at the same time
});

console.log('✅ Worker is listening for jobs on "email-queue"');