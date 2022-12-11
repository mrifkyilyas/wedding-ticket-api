import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { OParseIntPipe } from 'src/libs/pipes/o-parse-int.pipe';
import { ParseSortPipe } from 'src/libs/pipes/parse-sort.pipe';
import { ParseSearchPipe } from 'src/libs/pipes/parse-search.pipe';
import { CheckInInvitationDto } from './dto/check-in-invitation.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/auth.guard';
import { Response } from 'express';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post('create')
  create(@Body() createInvitationDto: CreateInvitationDto) {
    return this.invitationsService.create(createInvitationDto);
  }

  @Public()
  @Get(':slug/detail')
  detail(@Param('slug') slug) {
    return this.invitationsService.detail(slug);
  }

  @Post('check-in')
  checkIn(@Body() checkInInvitationDto: CheckInInvitationDto) {
    return this.invitationsService.checkIn(checkInInvitationDto.slug);
  }

  @Delete(':slug/delete')
  delete(@Param('slug') slug) {
    return this.invitationsService.delete(slug);
  }

  @Get('list')
  async list(
    @Query('skip', new OParseIntPipe()) qSkip,
    @Query('limit', new OParseIntPipe()) qLimit,
    @Query('sort', new ParseSortPipe()) qSort,
    @Query('search', new ParseSearchPipe()) qSearch,
    @Query('status') qStatus,
  ) {
    const [invitations, skip, limit, count] =
      await this.invitationsService.list(
        qSkip,
        qLimit,
        qSort,
        qSearch,
        qStatus,
      );
    return { invitations, skip, limit, count };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    return this.invitationsService.uploadDocument(file);
  }

  @Post('flush')
  async flush() {
    return this.invitationsService.flush();
  }

  @Post('set-all-status-to-false')
  async setAllStatusToFalse() {
    return this.invitationsService.setAllStatusToFalse();
  }

  @Get('download')
  async generateReportTicket(@Res() res: Response): Promise<any> {
    const { filename, file } = await this.invitationsService.downloadExcel();
    res.attachment(`${filename}.xlsx`);
    res.set({ 'Access-Control-Expose-Headers': 'Content-Disposition' });
    res.status(200);
    res.send(file);
  }

  @Get('get-slugs')
  async getSlugs(@Res() res: Response): Promise<any> {
    const { file, filename } = await this.invitationsService.getSlugs();
    res.attachment(`${filename}.csv`);
    res.set({ 'Access-Control-Expose-Headers': 'Content-Disposition' });
    res.status(200);
    res.send(file);
  }
}
