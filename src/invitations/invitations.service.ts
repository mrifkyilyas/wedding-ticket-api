import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { Invitation, InvitationDocument } from './entities/invitation.entity';
import { Model } from 'mongoose';
import * as xlsx from 'node-xlsx';
import * as ExcelJS from 'exceljs';
import { json2csvAsync } from 'json-2-csv';

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
    status?: boolean,
  ): Promise<[Invitation[], number, number, number]> {
    sort.push('number|asc');
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
    if (status != null) {
      Object.assign(query, { status });
    }
    const cursor = this.invitationModel.find(query);
    if (skip != null) cursor.skip(skip);
    if (limit != null) cursor.limit(limit);
    if (sort && sort.length > 0) {
      const sortQuery = {};
      for (let i = sort.length - 1; i >= 0; i--) {
        const q = sort[i] ? sort[i].split('|') : [];
        if (q.length < 2) continue;
        const name = q[0];
        const value = q[1];
        sortQuery[name] = value;
      }
      cursor.sort(sortQuery);
    }
    const invitations = await cursor.exec();
    const count = await this.invitationModel.countDocuments(query);
    return [invitations, skip, limit, count];
  }

  async uploadDocument(file: Express.Multer.File): Promise<any> {
    try {
      console.log(file);
      if (!file) {
        throw new BadRequestException('file required');
      }
      if (!file.originalname.match(/\.(xlsx)$/)) {
        throw new BadRequestException('Format file tidak didukung!');
      }
      const workSheetsFromBuffer = await xlsx.parse(file.buffer);
      const [, ...invitations] = workSheetsFromBuffer[0].data;
      const newInvitations = [];
      for (const invitation of invitations) {
        const [no, name, location]: any = invitation;
        if (!name || name == '') continue;
        await this.invitationModel.create({
          name,
          location,
          number: no,
        });
      }
      return 'uploaded';
    } catch (error) {
      throw error;
    }
  }

  async findBySlug(slug: string): Promise<InvitationDocument> {
    try {
      const invitation = await this.invitationModel.findOne({ slug });
      if (!invitation) {
        throw new BadRequestException('invitation not found');
      }
      return invitation;
    } catch (error) {
      throw error;
    }
  }

  async downloadExcel(): Promise<{ file: Buffer; filename: string }> {
    const invitations = await this.invitationModel
      .find({})
      .select('number name location slug checkInTime')
      .sort({ number: 'asc' });
    const headers = [
      { header: 'No', key: 'number', width: 20 },
      { header: 'Nama Undangan', key: 'name', width: 20 },
      { header: 'Alamat', key: 'location', width: 20 },
      { header: 'Slug', key: 'slug', width: 20 },
    ];
    const filename = `undangan-${new Date().getTime()}`;
    const workbook = new ExcelJS.Workbook();

    // Create sheet
    const worksheet = workbook.addWorksheet(filename);

    worksheet.columns = headers;

    worksheet.addRows(invitations);

    const excel = (await workbook.xlsx.writeBuffer()) as Buffer;

    return {
      file: excel,
      filename,
    };
  }

  async getSlugs(): Promise<{
    file: Buffer;
    filename: string;
  }> {
    const invitations = await this.invitationModel.find({});
    const filename = `slugs-${new Date().getTime()}`;
    const csv = await json2csvAsync(invitations, {
      keys: ['slug'],
      delimiter: { field: ',' },
    });
    const file = Buffer.from(csv, 'utf-8');
    return {
      file,
      filename,
    };
  }
}
