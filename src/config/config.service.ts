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
}
