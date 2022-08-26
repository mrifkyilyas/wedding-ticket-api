import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from './entities/admin.entity';
import { ConfigModule } from 'src/config/config.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [
    AuthModule,
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: Admin.name,
        schema: AdminSchema,
      },
    ]),
  ],
  exports: [AdminService],
})
export class AdminModule {}
