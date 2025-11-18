import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ImportQueue } from './import.queue';
import { ImportProcessor } from './import.processor';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    BullModule.registerQueue({
      name: 'import',
    }),
  ],
  providers: [ImportQueue, ImportProcessor],
  exports: [ImportQueue],
})
export class QueuesModule {}
