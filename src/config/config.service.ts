import { from } from 'env-var';
import { config } from 'dotenv';

config({ path: '.env' });

export class ConfigService {
  public constructor(private processEnv = process.env) {
    Object.freeze(this);
  }

  private env = from(this.processEnv);
  public readonly NODE_ENV = this.env.get('NODE_ENV').required().asString();

  public readonly PORT = this.env.get('PORT').required().asPortNumber();

  public readonly MONGODB_URL = this.env
    .get('MONGODB_URL')
    .required()
    .asString();

  public readonly API_KEY_WEDDING_TICKET = this.env
    .get('API_KEY_WEDDING_TICKET')
    .required()
    .asString();

  public readonly PASSWORD_ADMIN = this.env
    .get('PASSWORD_ADMIN')
    .required()
    .asString();

  public readonly SALT_KEY = this.env.get('SALT_KEY').required().asString();

  public readonly JWT_EXPIRED_IN_SECOND = this.env
    .get('JWT_EXPIRED_IN_SECOND')
    .required()
    .asInt();

  public readonly JWT_SECRET = this.env.get('JWT_SECRET').required().asString();
}
