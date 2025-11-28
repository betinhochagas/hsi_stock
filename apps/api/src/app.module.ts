import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AssetsModule } from './assets/assets.module';
import { CategoriesModule } from './categories/categories.module';
import { LocationsModule } from './locations/locations.module';
import { ManufacturersModule } from './manufacturers/manufacturers.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { LicensesModule } from './licenses/licenses.module';
import { MovementsModule } from './movements/movements.module';
import { ImportModule } from './import/import.module';
import { ReportsModule } from './reports/reports.module';
import { ExportModule } from './export/export.module';
import { QueuesModule } from './queues/queues.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10) * 1000,
        limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      },
    ]),
    PrismaModule,
    QueuesModule,
    AuthModule,
    UsersModule,
    AssetsModule,
    CategoriesModule,
    LocationsModule,
    ManufacturersModule,
    SuppliersModule,
    LicensesModule,
    MovementsModule,
    ImportModule,
    ReportsModule,
    ExportModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
