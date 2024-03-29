import { Controller, Post, Body } from '@nestjs/common';
import { ActorContext, ActorCtx, Public } from 'src/auth/auth.guard';
import { AdminService } from './admin.service';
import { LoginAdminDto } from './dto/login-admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Public()
  @Post('login')
  async login(@Body() loginAdminDto: LoginAdminDto) {
    const [admin, accessToken] = await this.adminService.login(loginAdminDto);
    return { token: accessToken, user: admin };
  }

  @Post('logout')
  async logout(@ActorContext() actorContext: any) {
    await this.adminService.logout(actorContext.accessToken);
    return {
      status: true,
    };
  }
}
