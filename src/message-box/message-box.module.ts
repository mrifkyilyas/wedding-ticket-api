import { Module } from '@nestjs/common';
import { MessageBoxService } from './message-box.service';
import { MessageBoxController } from './message-box.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MessageBox, MessageBoxSchema } from './entities/message-box.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { InvitationsModule } from 'src/invitations/invitations.module';

@Module({
  controllers: [MessageBoxController],
  providers: [MessageBoxService],
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: MessageBox.name,
        schema: MessageBoxSchema,
      },
    ]),
    InvitationsModule,
  ],
  exports: [MessageBoxService],
})
export class MessageBoxModule {}
