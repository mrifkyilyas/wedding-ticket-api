import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from './config/config.module';
import { InvitationsModule } from './invitations/invitations.module';

@Module({
  imports: [
    ConfigModule,
    InvitationsModule,
    MongooseModule.forRoot(process.env.MONGODB_URL),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
