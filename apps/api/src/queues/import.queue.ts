import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

export interface ImportJobData {
  importLogId: string;
  filename: string;
  mappings: Record<string, string>;
  userId?: string;
}

@Injectable()
export class ImportQueue {
  constructor(
    @InjectQueue('import') private readonly importQueue: Queue<ImportJobData>,
  ) {}

  async addJob(data: ImportJobData): Promise<string> {
    const job = await this.importQueue.add('process-import', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        count: 100, // Keep last 100 completed jobs
        age: 7 * 24 * 60 * 60, // Keep for 7 days
      },
      removeOnFail: false, // Keep failed jobs for debugging
    });

    return job.id as string;
  }

  async getJob(jobId: string) {
    return this.importQueue.getJob(jobId);
  }

  async getJobState(jobId: string) {
    const job = await this.getJob(jobId);
    if (!job) return null;
    
    return {
      id: job.id,
      state: await job.getState(),
      progress: job.progress,
      data: job.data,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
    };
  }
}
