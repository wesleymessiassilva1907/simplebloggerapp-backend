import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface Job {
  id: string;
  type: string;
  data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  attempts: number;
  maxAttempts: number;
  error?: string;
}

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private subscriber: Redis;
  private handlers = new Map<string, (data: any) => Promise<void>>();
  private processing = false;

  constructor(private config: ConfigService) {
    const redisUrl = this.config.get('REDIS_URL', 'redis://redis:6379');
    this.client = new Redis(redisUrl);
    this.subscriber = new Redis(redisUrl);
  }

  async onModuleInit() {
    if (this.config.get('WORKER_MODE') === 'true') {
      this.startProcessing();
    }
  }

  async onModuleDestroy() {
    this.processing = false;
    await this.client.quit();
    await this.subscriber.quit();
  }

  registerHandler(type: string, handler: (data: any) => Promise<void>) {
    this.handlers.set(type, handler);
  }

  async enqueue(type: string, data: any, maxAttempts = 3): Promise<string> {
    const job: Job = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      attempts: 0,
      maxAttempts,
    };

    await this.client.rpush('vertix:queue:jobs', JSON.stringify(job));
    await this.client.publish('vertix:queue:notify', 'new-job');

    return job.id;
  }

  private async startProcessing() {
    this.processing = true;
    console.log('[Worker] Job processing started');

    this.subscriber.subscribe('vertix:queue:notify');
    this.subscriber.on('message', () => this.processJobs());

    // Initial processing
    await this.processJobs();

    // Poll every 5 seconds as fallback
    setInterval(() => this.processJobs(), 5000);
  }

  private async processJobs() {
    if (!this.processing) return;

    const raw = await this.client.lpop('vertix:queue:jobs');
    if (!raw) return;

    const job: Job = JSON.parse(raw);
    const handler = this.handlers.get(job.type);

    if (!handler) {
      console.error(`[Worker] No handler for job type: ${job.type}`);
      job.status = 'failed';
      job.error = `No handler for type: ${job.type}`;
      await this.client.rpush('vertix:queue:failed', JSON.stringify(job));
      return;
    }

    job.attempts++;
    job.status = 'processing';

    try {
      await handler(job.data);
      job.status = 'completed';
      await this.client.rpush('vertix:queue:completed', JSON.stringify(job));
      console.log(`[Worker] Job ${job.id} (${job.type}) completed`);
    } catch (error: any) {
      job.error = error.message;
      if (job.attempts < job.maxAttempts) {
        job.status = 'pending';
        await this.client.rpush('vertix:queue:jobs', JSON.stringify(job));
        console.log(`[Worker] Job ${job.id} failed, retrying (${job.attempts}/${job.maxAttempts})`);
      } else {
        job.status = 'failed';
        await this.client.rpush('vertix:queue:failed', JSON.stringify(job));
        console.error(`[Worker] Job ${job.id} failed permanently: ${error.message}`);
      }
    }

    // Process next job
    setImmediate(() => this.processJobs());
  }
}
