import { Module } from '@nestjs/common';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { PrismaModule } from '../prisma/prisma.module';
import { HSIInventarioProcessor } from './processors/hsi-inventario.processor';

@Module({
  imports: [PrismaModule],
  controllers: [ImportController],
  providers: [ImportService, HSIInventarioProcessor],
  exports: [ImportService],
})
export class ImportModule {}
