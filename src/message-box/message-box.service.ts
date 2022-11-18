import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateMessageBoxDto } from './dto/create-message-box.dto';
import { MessageBox, MessageBoxDocument } from './entities/message-box.entity';
import { Model } from 'mongoose';
import { InvitationsService } from './../invitations/invitations.service';

@Injectable()
export class MessageBoxService {
  constructor(
    @InjectModel(MessageBox.name)
    private messageBoxModel: Model<MessageBoxDocument>,
    private readonly invitationsService: InvitationsService,
  ) {}
  async create(createMessageBoxDto: CreateMessageBoxDto): Promise<MessageBox> {
    try {
      const invitation = await this.invitationsService.findBySlug(
        createMessageBoxDto.slug,
      );
      if (!invitation) {
        throw new BadRequestException('Invitation Tidak Terdaftar');
      }
      return this.messageBoxModel.create({
        invitation: invitation._id,
        message: createMessageBoxDto.message,
        willAttend: createMessageBoxDto.willAttend,
      });
    } catch (error) {
      throw error;
    }
  }

  async list(
    skip?: number,
    limit?: number,
    sort?: string[],
    search?: string[],
  ): Promise<[MessageBox[], number, number, number]> {
    const query = {};
    if (search && search.length > 0) {
      const searchQuery = [];
      for (let i = search.length - 1; i >= 0; i--) {
        const q = search[i] ? search[i].split('|') : [];
        if (q.length < 2) continue;
        const name = q[0];
        const value = q[1];
        searchQuery.push({
          ["invitation.name"]: { $regex: '.*' + [value] + '.*', $options: 'i' },
        });
      }
      Object.assign(query, { $or: searchQuery });
    }
    const cursor = this.messageBoxModel.find(query).populate('invitation');
    if (skip != null) cursor.skip(skip);
    if (limit != null) cursor.limit(limit);
    if (sort) cursor.sort({ [sort[0]]: sort[1] });
    const messageBoxes = await cursor.exec();
    const count = await this.messageBoxModel.countDocuments(query);
    return [messageBoxes, skip, limit, count];
  }

  async isHaveMessage(slug: string): Promise<boolean> {
    try {
      console.log('sini');
      const invitation = await this.invitationsService.findBySlug(slug);
      if (!invitation) {
        throw new BadRequestException('Invitation Tidak Terdaftar');
      }
      const count = await this.messageBoxModel.countDocuments({
        invitation: invitation._id,
      });
      return count > 0;
    } catch (error) {
      throw error;
    }
  }
}
