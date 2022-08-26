import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Invitation, InvitationSchema } from './entities/invitation.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [InvitationsController],
  providers: [InvitationsService],
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: Invitation.name,
        schema: InvitationSchema,
      },
    ]),
  ],
})
export class InvitationsModule {}
