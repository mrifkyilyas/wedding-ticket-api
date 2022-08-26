import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { AdminModule } from 'src/admin/admin.module';
import { ConfigModule } from 'src/config/config.module';

@Module({
  providers: [SeedService],
  imports: [ConfigModule, AdminModule],
  exports: [SeedService],
})
export class SeedModule {}
