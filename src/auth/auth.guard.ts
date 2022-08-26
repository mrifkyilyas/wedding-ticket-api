import {
  CallHandler,
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { CustomDecorator } from '@nestjs/common/decorators/core/set-metadata.decorator';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = (): CustomDecorator => SetMetadata(IS_PUBLIC_KEY, true);

export interface ActorCtx {
  id: string;
  roleId: string;
  role: string;
  authToken: string;
  iat: number;
  exp: number;
}

export const ActorContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.actor;
  },
);

@Injectable()
export class authGuard extends AuthGuard('jwt') {
  /**
   * Constructor.
   *
   * @param {Reflector} reflector - The reflector.
   * @param {AuthService} authService - The auth service.
   * @example
   */
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {
    super();
  }

  /**
   * Can activate.
   *
   * @param {ExecutionContext} context - The execution context.
   * @returns {Promise<boolean>} True if you can activate.
   * @example
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request?.headers['authorization'];
    if (!authorization) {
      throw new HttpException(
        'You must provide authorization',
        HttpStatus.UNAUTHORIZED,
      );
    }
    console.log(authorization);
    const actor = await this.authService.verify(authorization);
    request['actor'] = actor;

    return true;
  }
}
