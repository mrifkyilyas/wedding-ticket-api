import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { Invitation, InvitationDocument } from './entities/invitation.entity';
import { Model } from 'mongoose';
import * as xlsx from 'node-xlsx';

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
      const invitation = await this.invitationModel.findOne({ slug });
      if (!invitation) {
        throw new BadRequestException('invitation not found');
      }
      return invitation;
    } catch (error) {
      throw new BadRequestException('Invitation not found');
    }
  }

  async checkIn(slug: string): Promise<Invitation> {
    const invitation = await this.invitationModel.findOne({ slug });
    if (!invitation) {
      throw new BadRequestException('Invitation not found');
    }
    if (invitation.status === true) {
      throw new BadRequestException('Invitation already checked in');
    }
    console.log(invitation);
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

  async flush() {
    try {
      return this.invitationModel.deleteMany({});
    } catch (error) {
      throw error;
    }
  }

  async setAllStatusToFalse() {
    try {
      return this.invitationModel.updateMany(
        { status: true },
        { status: false },
      );
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

  async uploadDocument(file: Express.Multer.File): Promise<any> {
    try {
      if (!file) {
        throw new BadRequestException('file required');
      }
      if (!file.originalname.match(/\.(xlsx)$/)) {
        throw new BadRequestException('Format file tidak didukung!');
      }
      const workSheetsFromBuffer = await xlsx.parse(file.buffer);
      const [, ...invitations] = workSheetsFromBuffer[0].data;
      const newInvitations = [];
      invitations.map(async (invitation: Array<string>) => {
        const [name, location] = invitation;
        newInvitations.push(
          this.invitationModel.create({
            name,
            location,
          }),
        );
      });
      await Promise.all(newInvitations);
      return 'uploaded';
    } catch (error) {
      throw error;
    }
  }
}
