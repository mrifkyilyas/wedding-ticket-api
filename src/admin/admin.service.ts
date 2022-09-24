import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from './entities/admin.entity';
import { Model } from 'mongoose';
import { CreateAdminDto } from './dto/create-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from 'src/config/config.service';
import * as argon2 from 'argon2';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    try {
      const passwordSalt = bcrypt.genSaltSync(10);
      createAdminDto.password = bcrypt.hashSync(
        createAdminDto.password,
        passwordSalt,
      );
      return this.adminModel.create(createAdminDto);
    } catch (error) {
      throw error;
    }
  }

  async createOrUpdate(createAdminDto: CreateAdminDto): Promise<Admin> {
    try {
      const { email, password } = createAdminDto;
      const passwordSalt = bcrypt.genSaltSync(10);
      createAdminDto.password = bcrypt.hashSync(
        createAdminDto.password,
        passwordSalt,
      );
      const admin = await this.adminModel.findOne({ email });
      if (admin) {
        admin.password = createAdminDto.password;
        return admin.save();
      } else {
        console.log(createAdminDto);
        return this.create(createAdminDto);
      }
    } catch (error) {
      throw error;
    }
  }

  async login(loginAdminDto: LoginAdminDto): Promise<[Admin, string]> {
    try {
      const { email, password } = loginAdminDto;
      const admin = await this.adminModel.findOne({ email });
      console.log(admin);
      if (!admin) throw new BadRequestException('Invalid email or password');

      const match = await bcrypt.compare(password, admin.password);
      if (!match) throw new BadRequestException('Invalid email or password');
      const auth = await this.authService.create({
        morph: admin._id,
        morphModel: Admin.name,
      });

      const accessToken = await this.authService.generateJwtToken({
        morph: admin._id,
        morphModel: Admin.name,
        role: 'ADMIN',
        authToken: auth.accessToken,
      });

      return [admin, accessToken];
    } catch (error) {
      throw error;
    }
  }

  async logout(authToken: string): Promise<void> {
    try {
      await this.authService.delete(authToken);
    } catch (error) {
      throw error;
    }
  }
}
