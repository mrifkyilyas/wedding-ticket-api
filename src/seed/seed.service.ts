import { Injectable, Logger } from '@nestjs/common';
import { AdminService } from 'src/admin/admin.service';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class SeedService {
  constructor(
    private readonly adminsService: AdminService,
    private readonly configService: ConfigService,
  ) {}

  async run(): Promise<any> {
    await this.seedAdmins();
  }

  async seedAdmins(): Promise<any> {
    Logger.log('Seeding admins...');
    const admin = await this.adminsService.createOrUpdate({
      userName: 'admin',
      password: this.configService.PASSWORD_ADMIN,
      email: 'admin@admin.com'
    });
    return admin;
  }
}
