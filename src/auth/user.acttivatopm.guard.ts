import { AuthService } from './auth.service';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { User } from 'src/user/user.dto';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class UserActivationGuard implements CanActivate {
  private logger: Logger = new Logger(UserActivationGuard.name);
  constructor(
    private readonly reflector: Reflector,
    private authService: AuthService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    let request = context.switchToHttp().getRequest();
    const contextType = context.getType();
    let user: User = null;

    switch (contextType) {
      case 'http':
        request = context.switchToHttp().getRequest();
        break;
      case 'rpc':
        request = context.switchToRpc().getData();
        break;
      case 'ws':
        const socket = context.switchToWs().getClient();
        request = socket.handshake;
        const auth = socket.handshake.auth;
        request.headers = {
          ...request.headers,
          authorization: auth.authorization,
        };
        break;
      default:
        if (contextType === 'graphql') {
          const gqlContext = GqlExecutionContext.create(context);
          request = gqlContext.getContext()['req'];
        } else {
          throw new Error(`Unsupported context type: ${contextType}`);
        }
    }

    user = this.authService.getUserFromRequest(request);
    if (!user.isActivated) {
      this.logger.error(`no activate user. (User: ${JSON.stringify(user)})`);
      throw new UnauthorizedException(`Check user Acitvate`);
    }
    return true;
  }
}
