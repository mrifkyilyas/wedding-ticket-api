import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { WillAttendEnum } from 'src/libs/enum/will-attend.enum';

export class CreateMessageBoxDto {
  @IsNotEmpty()
  @IsString()
  message: string;
  @IsNotEmpty()
  @IsString()
  slug: string;
  @IsNotEmpty()
  @IsEnum(WillAttendEnum)
  willAttend: WillAttendEnum;
}
