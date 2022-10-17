import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from './config/config.module';
import { InvitationsModule } from './invitations/invitations.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { SeedModule } from './seed/seed.module';
import { SeedService } from './seed/seed.service';
import { APP_GUARD } from '@nestjs/core';
import { authGuard } from './auth/auth.guard';
import { MessageBoxModule } from './message-box/message-box.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    InvitationsModule,
    MongooseModule.forRoot(process.env.MONGODB_URL),
    AdminModule,
    SeedModule,
    MessageBoxModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: authGuard,
    },
  ],
})
export class AppModule {
  constructor(private readonly seedService: SeedService) {}
  async onApplicationBootstrap() {
    await this.seedService.run();
  }
}
