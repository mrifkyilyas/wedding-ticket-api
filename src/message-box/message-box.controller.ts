import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { MessageBoxService } from './message-box.service';
import { CreateMessageBoxDto } from './dto/create-message-box.dto';
import { Public } from 'src/auth/auth.guard';
import { OParseIntPipe } from 'src/libs/pipes/o-parse-int.pipe';
import { ParseSortPipe } from 'src/libs/pipes/parse-sort.pipe';
import { ParseSearchPipe } from 'src/libs/pipes/parse-search.pipe';

@Controller('message-box')
export class MessageBoxController {
  constructor(private readonly messageBoxService: MessageBoxService) {}

  @Public()
  @Post('create')
  create(@Body() createMessageBoxDto: CreateMessageBoxDto) {
    return this.messageBoxService.create(createMessageBoxDto);
  }

  @Get('list')
  async list(
    @Query('skip', new OParseIntPipe()) qSkip,
    @Query('limit', new OParseIntPipe()) qLimit,
    @Query('sort', new ParseSortPipe()) qSort,
    @Query('search', new ParseSearchPipe()) qSearch,
  ) {
    const [messageBoxes, skip, limit, count] =
      await this.messageBoxService.list(qSkip, qLimit, qSort, qSearch);
    return { messageBoxes, skip, limit, count };
  }
}
