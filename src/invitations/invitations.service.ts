import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { Invitation, InvitationDocument } from './entities/invitation.entity';
import { Model } from 'mongoose';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectModel(Invitation.name)
    private readonly invitationModel: Model<InvitationDocument>,
  ) {}
  async create(createInvitationDto: CreateInvitationDto): Promise<Invitation> {
    try {
      return this.invitationModel.create(createInvitationDto);
    } catch (error) {
      throw error;
    }
  }

  async detail(slug: string): Promise<Invitation> {
    try {
      return this.invitationModel.findOne({ slug });
    } catch (error) {
      throw new error('Invitation not found');
    }
  }

  async checkIn(slug: string): Promise<Invitation> {
    const invitation = await this.invitationModel.findOne({ slug });
    if (!invitation || invitation.status === true) {
      throw new Error('Invitation not found or allready checkin');
    }
    invitation.status = true;
    invitation.checkInTime = new Date();
    return invitation.save();
  }

  async delete(slug: string): Promise<Invitation> {
    try {
      return this.invitationModel.findOneAndDelete({ slug });
    } catch (error) {
      throw error;
    }
  }

  async list(
    skip?: number,
    limit?: number,
    sort?: string[],
    search?: string[],
  ): Promise<[Invitation[], number, number, number]> {
    const query = {};
    if (search && search.length > 0) {
      const searchQuery = [];
      for (let i = search.length - 1; i >= 0; i--) {
        const q = search[i] ? search[i].split('|') : [];
        if (q.length < 2) continue;
        const name = q[0];
        const value = q[1];
        searchQuery.push({
          [name]: { $regex: '.*' + [value] + '.*', $options: 'i' },
        });
      }
      Object.assign(query, { $or: searchQuery });
    }
    const cursor = this.invitationModel.find(query);
    if (skip != null) cursor.skip(skip);
    if (limit != null) cursor.limit(limit);
    if (sort) cursor.sort({ [sort[0]]: sort[1] });
    const invitations = await cursor.exec();
    const count = await this.invitationModel.countDocuments(query);
    return [invitations, skip, limit, count];
  }
}
